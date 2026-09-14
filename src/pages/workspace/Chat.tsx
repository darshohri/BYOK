// ─────────────────────────────────────────────
// BYOK — Chat Page (Main Workspace View)
// ─────────────────────────────────────────────
// Wires together EmptyState, MessageList, Composer,
// RoutingIndicator, and the full send message flow.
// ─────────────────────────────────────────────

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmptyState from '@/components/chat/EmptyState';
import MessageList from '@/components/chat/MessageList';
import Composer from '@/components/chat/Composer';
import { useChatStore } from '@/store/chat';
import { useProviderStore } from '@/store/providers';
import { useSettingsStore } from '@/store/settings';
import { useAnalyticsStore } from '@/store/analytics';
import { getProvider, PROVIDER_META } from '@/providers/registry';
import { routePrompt } from '@/routing/smartRouter';
import { generateChatTitle } from '@/lib/titleGenerator';
import { keyStorage, ledgerStorage, keyManager } from '@/lib/storage';
import type { ProviderId, RouterResult, ConversationMessage, Attachment } from '@/providers/types';

export default function ChatPage() {
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<{
    text: string;
    routeResult: RouterResult;
    convId: string;
    hasImage: boolean;
  } | null>(null);
  
  const abortRef = useRef<AbortController | null>(null);

  const activeConversation = useChatStore(s => s.getActiveConversation());
  const createConversation = useChatStore(s => s.createConversation);
  const addMessage = useChatStore(s => s.addMessage);
  const updateLastAssistantMessage = useChatStore(s => s.updateLastAssistantMessage);
  const finalizeLastAssistantMessage = useChatStore(s => s.finalizeLastAssistantMessage);
  const setRoutingState = useChatStore(s => s.setRoutingState);

  const connections = useProviderStore(s => s.connections);
  const hasAnyConnection = useProviderStore(s => s.hasAnyConnection);

  const mode = useSettingsStore(s => s.mode);
  const fallbackProvider = useSettingsStore(s => s.fallbackProvider);
  const showRoutingAnimation = useSettingsStore(s => s.showRoutingAnimation);
  const longContextThreshold = useSettingsStore(s => s.longContextThreshold);

  const recordRequest = useAnalyticsStore(s => s.recordRequest);

  // --- Send Execution ---
  const executeSend = useCallback(async (
    text: string, 
    convId: string, 
    initialProvider: ProviderId, 
    initialModel: string,
    routeResult: RouterResult | null = null
  ) => {
    let currentProvider = initialProvider;
    let currentModel = initialModel;
    let attemptedProviders = new Set<ProviderId>();
    let fallbackHistory: { provider: ProviderId; error: string }[] = [];
    const currentConvForFilter = useChatStore.getState().getConversation(convId);
    const hasImage = currentConvForFilter?.messages.some(m => m.attachments?.some(a => a.type === 'image')) || false;

    let availableProviders = Object.keys(connections).filter(p => connections[p as ProviderId]?.connected) as ProviderId[];
    if (hasImage) {
      availableProviders = availableProviders.filter(provider => {
        const conn = connections[provider as ProviderId];
        const model = conn.availableModels.find(m => m.id === conn.selectedModel);
        
        if (!model?.capabilities.includes('vision') && provider === 'openrouter') {
          const fallbackVision = conn.availableModels.find(m => m.id.includes('nemotron-3-nano-omni'));
          if (fallbackVision) return true;
        }
        
        return model?.capabilities.includes('vision');
      });
    }
    setRoutingState('hidden');

    addMessage(convId, {
      role: 'assistant',
      content: '',
      provider: currentProvider,
      model: currentModel,
    });

    const currentConv = useChatStore.getState().getConversation(convId);
    const lastMsg = currentConv?.messages[currentConv.messages.length - 1];
    if (lastMsg) setStreamingMessageId(lastMsg.id);

    const messages = (currentConv?.messages || [])
      .filter(m => m.role === 'user' || (m.role === 'assistant' && m.content))
      .slice(0, -1)
      .map(m => ({ role: m.role, content: m.content, attachments: m.attachments }));

    let streamedContent = '';
    let titleGenerated = false;

    while (true) {
      attemptedProviders.add(currentProvider);
      streamedContent = '';

      try {
        const apiKey = await keyStorage.getKey(currentProvider);
        if (!apiKey) {
          if (!keyManager.isUnlocked() && await keyManager.hasAnyEncryptedKeys()) {
            throw new Error(`Your API keys are securely locked. Please enter your passphrase in the API Keys page to unlock them.`);
          }
          throw new Error(`No API key found for ${currentProvider}. Please reconnect in the API Keys page.`);
        }

        const activeConv = useChatStore.getState().getConversation(convId);
        const firstUserMsg = activeConv?.messages.find(m => m.role === 'user');
        const lastUserMsg = activeConv?.messages.filter(m => m.role === 'user').pop();
        
        let needsTitle = false;
        let titlePrompt = '';
        if (activeConv && firstUserMsg) {
          titlePrompt = firstUserMsg.content.trim();
          if (!titlePrompt && firstUserMsg.attachments?.length) {
            titlePrompt = firstUserMsg.attachments.map(a => `Attached ${a.type}: ${a.name}`).join(', ');
          }
          const cleaned = titlePrompt.replace(/\n/g, ' ');
          const placeholder = cleaned.length <= 50 ? cleaned : cleaned.slice(0, 47) + '...';
          const oldPlaceholder = text.slice(0, 40) + (text.length > 40 ? '...' : '');
          needsTitle = activeConv.title === 'New Chat' || activeConv.title === placeholder || activeConv.title === oldPlaceholder;
        }

        const providerInstance = getProvider(currentProvider);
        const controller = new AbortController();
        abortRef.current = controller;

        const response = await providerInstance.sendMessage({
          model: currentModel,
          messages: [
            { role: 'system' as const, content: 'You are a helpful AI assistant. Always respond in English unless the user explicitly requests another language.' },
            ...messages, 
            { role: 'user' as const, content: text, attachments: lastUserMsg?.attachments }
          ],
          apiKey,
          signal: controller.signal,
          onChunk: (chunk) => {
            streamedContent += chunk;
            updateLastAssistantMessage(convId, streamedContent);
          },
        });

        const routingMeta: ConversationMessage['routing'] = {
          mode: mode === 'smart' ? 'smart' : currentProvider,
          confidence: routeResult?.confidence,
          reason: routeResult?.reason,
          scores: routeResult?.scores,
          latencyMs: response.latencyMs,
          tokenUsage: response.tokenUsage,
          classifierLatencyMs: routeResult?.classifierLatencyMs,
          classifierTokenUsage: routeResult?.classifierTokenUsage,
          fallbackHistory: fallbackHistory.length > 0 ? fallbackHistory : undefined,
        };

        finalizeLastAssistantMessage(convId, {
          provider: currentProvider,
          model: response.model || currentModel,
          routing: routingMeta,
        });

        if (!streamedContent && response.content) {
          updateLastAssistantMessage(convId, response.content);
        }

        if (!titleGenerated && needsTitle) {
          titleGenerated = true;
          generateChatTitle(convId, titlePrompt, currentProvider, currentModel, apiKey);
        }

        recordRequest({
          provider: currentProvider,
          model: response.model || currentModel,
          latencyMs: response.latencyMs,
          tokens: response.tokenUsage?.total,
          wasSmartMode: mode === 'smart',
        });
        
        break; 
      } catch (error: any) {
        if (error.name === 'AbortError') {
          setIsProcessing(false);
          setStreamingMessageId(null);
          abortRef.current = null;
          return;
        }

        const errorMessage = parseProviderError(error);

        if (isRetryableError(error)) {
          const nextProvider = availableProviders.find(p => !attemptedProviders.has(p));
          if (nextProvider) {
            fallbackHistory.push({ provider: currentProvider, error: errorMessage });
            currentProvider = nextProvider;
            
            const conn = connections[nextProvider];
            let nextModel = conn?.selectedModel || '';
            
            if (hasImage && nextProvider === 'openrouter') {
              const selectedInfo = conn?.availableModels.find(m => m.id === nextModel);
              if (!selectedInfo?.capabilities.includes('vision')) {
                const fallbackVision = conn?.availableModels.find(m => m.id.includes('nemotron-3-nano-omni'));
                if (fallbackVision) {
                  nextModel = fallbackVision.id;
                  useProviderStore.getState().setSelectedModel('openrouter', fallbackVision.id);
                }
              }
            }
            
            currentModel = nextModel;
            updateLastAssistantMessage(convId, `*Falling back to ${getProvider(currentProvider).name}...*`);
            continue;
          }
        }

        if (fallbackHistory.length > 0 || isRetryableError(error)) {
          fallbackHistory.push({ provider: currentProvider, error: errorMessage });
        }

        const finalErrorStr = fallbackHistory.length > 0 
          ? `${errorMessage}\n\n*All fallback providers failed.*`
          : errorMessage;

        updateLastAssistantMessage(convId, finalErrorStr);
        
        const routingMeta: ConversationMessage['routing'] = {
          mode: mode === 'smart' ? 'smart' : currentProvider,
          fallbackHistory: fallbackHistory.length > 0 ? fallbackHistory : undefined,
        };
        finalizeLastAssistantMessage(convId, { provider: currentProvider, model: currentModel, routing: routingMeta });
        break;
      }
    }

    setIsProcessing(false);
    setStreamingMessageId(null);
    abortRef.current = null;
  }, [
    isProcessing, pendingRoute, activeConversation, createConversation, addMessage, updateLastAssistantMessage, finalizeLastAssistantMessage,
    connections, mode, fallbackProvider, showRoutingAnimation, longContextThreshold, setRoutingState, recordRequest
  ]);

  // --- Auto-proceed timer for routing ---
  useEffect(() => {
    if (!pendingRoute) return;
    const timer = setTimeout(() => {
      executeSend(
        pendingRoute.text,
        pendingRoute.convId,
        pendingRoute.routeResult.provider,
        pendingRoute.routeResult.model,
        pendingRoute.routeResult
      );
      setPendingRoute(null);
    }, 2500);
    return () => clearTimeout(timer);
  }, [pendingRoute, executeSend]);

  // --- Init Send ---
  const handleSend = useCallback(async (text: string, skipAddUserMessage: boolean = false, attachments?: Attachment[]) => {
    if (isProcessing || pendingRoute) return;

    let convId = activeConversation?.id;
    if (!convId) {
      convId = createConversation();
    }

    if (!skipAddUserMessage) {
      addMessage(convId, { role: 'user', content: text, attachments });
    }

    setIsProcessing(true);

    try {
      if (!keyManager.isUnlocked() && await keyManager.hasAnyEncryptedKeys()) {
        addMessage(convId, {
          role: 'assistant',
          content: '⚠️ **Your API keys are securely locked.** Please go to the API Keys tab and enter your passphrase to unlock them.',
        });
        setIsProcessing(false);
        setRoutingState('hidden');
        return;
      }

      if (mode === 'smart') {
        if (showRoutingAnimation) setRoutingState('analyzing');
        
        const currentConv = useChatStore.getState().getConversation(convId);
        const hasHistoryImage = currentConv?.messages.some(m => m.attachments?.some(a => a.type === 'image')) || false;
        const hasImage = !!attachments?.some(a => a.type === 'image') || hasHistoryImage;

        const routeResult = await routePrompt({
          prompt: text,
          connections,
          fallbackProvider,
          longContextThreshold,
          hasImage,
        });

        if (!routeResult) {
          addMessage(convId, {
            role: 'assistant',
            content: 'No providers are connected. Please add an API key in the API Keys page to get started.',
          });
          setIsProcessing(false);
          setRoutingState('hidden');
          return;
        }

        if (showRoutingAnimation) {
          setRoutingState('selected', routeResult.provider, Math.round(routeResult.confidence * 100));
          setPendingRoute({ text, routeResult, convId, hasImage });
          // execution pauses here, awaiting timeout or override
          return;
        } else {
          executeSend(text, convId, routeResult.provider, routeResult.model, routeResult);
        }
      } else {
        const targetProvider = mode as ProviderId;
        const conn = connections[targetProvider];
        if (!conn?.connected) {
          addMessage(convId, {
            role: 'assistant',
            content: `${targetProvider} is not connected. Please add your API key.`,
          });
          setIsProcessing(false);
          return;
        }
        executeSend(text, convId, targetProvider, conn.selectedModel || '', null);
      }
    } catch (error: any) {
      setIsProcessing(false);
      setRoutingState('hidden');
    }
  }, [
    isProcessing, pendingRoute, activeConversation, createConversation, addMessage,
    connections, mode, fallbackProvider, showRoutingAnimation, longContextThreshold, executeSend, setRoutingState
  ]);

  const handleOverride = (provider: ProviderId) => {
    if (!pendingRoute) return;
    const { text, convId, routeResult, hasImage } = pendingRoute;
    let model = connections[provider]?.selectedModel || '';
    
    if (hasImage && provider === 'openrouter') {
      const conn = connections[provider];
      const selectedInfo = conn?.availableModels.find(m => m.id === model);
      if (!selectedInfo?.capabilities.includes('vision')) {
        const fallbackVision = conn?.availableModels.find(m => m.id.includes('nemotron-3-nano-omni'));
        if (fallbackVision) {
          model = fallbackVision.id;
          useProviderStore.getState().setSelectedModel('openrouter', fallbackVision.id);
        }
      }
    }
    
    setPendingRoute(null);

    if (routeResult && provider !== routeResult.provider) {
      ledgerStorage.recordOverride(routeResult.category, routeResult.provider, provider).catch(console.error);
    }
    
    executeSend(text, convId, provider, model, { ...routeResult, provider, model, reason: 'User overridden' });
  };

  const handleRetry = useCallback((messageId: string) => {
    if (isProcessing) return;
    const conv = useChatStore.getState().getActiveConversation();
    if (!conv) return;
    const msgIndex = conv.messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;
    const prevMsg = conv.messages[msgIndex - 1];
    if (!prevMsg || prevMsg.role !== 'user') return;
    
    useChatStore.getState().truncateConversation(conv.id, msgIndex);
    handleSend(prevMsg.content, true, prevMsg.attachments);
  }, [isProcessing, handleSend]);

  const handleEdit = useCallback((messageId: string, newContent: string) => {
    if (isProcessing) return;
    const conv = useChatStore.getState().getActiveConversation();
    if (!conv) return;
    const msgIndex = conv.messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;
    const targetMsg = conv.messages[msgIndex];
    
    // Truncate at the user message to remove it and all subsequent messages
    useChatStore.getState().truncateConversation(conv.id, msgIndex);
    
    // Resend the new content
    handleSend(newContent, false, targetMsg.attachments);
  }, [isProcessing, handleSend]);

  const messages = activeConversation?.messages || [];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0A0A0A]">
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <MessageList 
          messages={messages} 
          streamingMessageId={streamingMessageId} 
          onRetry={handleRetry}
          onEdit={handleEdit}
        />
      )}

      <div className="relative">
        <AnimatePresence>
          {pendingRoute && (
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 10 }}
               className="absolute bottom-full left-4 right-4 md:left-8 md:right-8 lg:left-16 lg:right-16 mb-2 max-w-4xl mx-auto bg-[#141414] border border-white/[0.08] rounded-xl p-4 shadow-xl z-50 overflow-hidden"
            >
               <div className="flex justify-between items-center mb-3">
                 <div>
                   <h4 className="text-[13px] text-white font-medium flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                     Smart Router Decision
                   </h4>
                   <p className="text-[12px] text-neutral-400 mt-0.5">{pendingRoute.routeResult.reason}</p>
                 </div>
                 {pendingRoute.routeResult.classifierLatencyMs && (
                   <div className="text-[11px] text-neutral-500 font-mono">
                     {pendingRoute.routeResult.classifierLatencyMs}ms class.
                   </div>
                 )}
               </div>
               
               <div className="flex flex-wrap gap-2 mt-3">
                  {Object.entries(connections).filter(([, c]) => c.connected).map(([id]) => {
                   const isSelected = id === pendingRoute.routeResult.provider;
                   const meta = PROVIDER_META[id as ProviderId];
                   const isVisionDisabled = pendingRoute.hasImage && id === 'groq';
                   
                   return (
                     <button
                       key={id}
                       disabled={isVisionDisabled}
                       onClick={() => handleOverride(id as ProviderId)}
                       className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all flex items-center gap-1.5 ${
                         isSelected 
                           ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                           : isVisionDisabled
                             ? 'opacity-30 cursor-not-allowed bg-white/[0.01] text-neutral-600 border border-transparent'
                             : 'bg-white/[0.03] text-neutral-400 border border-white/[0.05] hover:bg-white/[0.08]'
                       }`}
                     >
                       <span className="text-[14px]">{meta?.icon}</span>
                       {meta?.name}
                       {!isSelected && !isVisionDisabled && <span className="opacity-0 group-hover:opacity-100 ml-1 text-[10px] uppercase tracking-wide">Override</span>}
                     </button>
                   );
                 })}
               </div>
               
               {/* Animated Progress Bar for 2.5s */}
               <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/[0.02]">
                 <motion.div 
                   className="h-full bg-purple-500/50"
                   initial={{ width: 0 }}
                   animate={{ width: "100%" }}
                   transition={{ duration: 2.5, ease: "linear" }}
                 />
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Composer onSend={handleSend} disabled={isProcessing || !!pendingRoute} />
      </div>
    </div>
  );
}

function parseProviderError(error: any): string {
  const msg = error.message || 'An unknown error occurred';
  if (msg.includes('401') || msg.toLowerCase().includes('invalid')) return '⚠️ **API key invalid.** Please check your API key.';
  if (msg.includes('429') || msg.toLowerCase().includes('rate limit')) return '⚠️ **Rate limit reached.** Try again in a moment.';
  if (msg.toLowerCase().includes('high demand')) return '⚠️ **High demand.** The model is currently overloaded.';
  if (msg.includes('403') || msg.toLowerCase().includes('quota')) return '⚠️ **Insufficient quota.** Check your usage with the provider.';
  if (msg.includes('404')) return '⚠️ **Model unavailable.** Try selecting a different model.';
  if (msg.includes('500') || msg.includes('502') || msg.includes('503')) return '⚠️ **Provider temporarily unavailable.** Try again shortly.';
  if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch')) return '⚠️ **Network error.** Please check your internet connection.';
  return `⚠️ **API Error:** ${msg}`;
}

function isRetryableError(error: any): boolean {
  const msg = (error?.message || '').toLowerCase();
  if (msg.includes('429') || msg.includes('rate limit') || msg.includes('high demand')) return true;
  if (msg.includes('500') || msg.includes('502') || msg.includes('503') || msg.includes('504')) return true;
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout')) return true;
  if (msg.includes('provider returned error')) return true;
  return false;
}
