const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'ASUS', 'Desktop', 'Projects', 'BYOK', 'src', 'pages', 'workspace', 'Chat.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const newCode = `import React, { useState, useCallback, useRef, useEffect } from 'react';
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
import { keyStorage } from '@/lib/storage';
import type { ProviderId, RouterResult, ConversationMessage } from '@/providers/types';

export default function ChatPage() {
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<{
    text: string;
    routeResult: RouterResult;
    convId: string;
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

  const recordRequest = useAnalyticsStore(s => s.recordRequest);

  // --- Send Execution ---
  const executeSend = useCallback(async (
    text: string,
    convId: string,
    targetProvider: ProviderId,
    targetModel: string,
    routeResult: RouterResult | null
  ) => {
    try {
      setRoutingState('hidden');
      
      const apiKey = await keyStorage.getKey(targetProvider);
      if (!apiKey) {
        addMessage(convId, {
          role: 'assistant',
          content: \`No API key found for \${targetProvider}. Please reconnect in the API Keys page.\`,
        });
        setIsProcessing(false);
        return;
      }

      addMessage(convId, {
        role: 'assistant',
        content: '',
        provider: targetProvider,
        model: targetModel,
      });

      const currentConv = useChatStore.getState().getConversation(convId);
      const lastMsg = currentConv?.messages[currentConv.messages.length - 1];
      if (lastMsg) {
        setStreamingMessageId(lastMsg.id);
      }

      const messages = (currentConv?.messages || [])
        .filter(m => m.role === 'user' || (m.role === 'assistant' && m.content))
        .slice(0, -1)
        .map(m => ({ role: m.role, content: m.content }));

      const provider = getProvider(targetProvider);
      const controller = new AbortController();
      abortRef.current = controller;

      let streamedContent = '';

      const response = await provider.sendMessage({
        model: targetModel,
        messages: [
          { role: 'system' as const, content: 'You are a helpful AI assistant. Always respond in English unless the user explicitly requests another language.' },
          ...messages, 
          { role: 'user' as const, content: text }
        ],
        apiKey,
        signal: controller.signal,
        onChunk: (chunk) => {
          streamedContent += chunk;
          updateLastAssistantMessage(convId, streamedContent);
        },
      });

      const routingMeta: ConversationMessage['routing'] = {
        mode: mode === 'smart' ? 'smart' : targetProvider,
        confidence: routeResult?.confidence,
        reason: routeResult?.reason,
        scores: routeResult?.scores,
        latencyMs: response.latencyMs,
        tokenUsage: response.tokenUsage,
        classifierLatencyMs: routeResult?.classifierLatencyMs,
        classifierTokenUsage: routeResult?.classifierTokenUsage,
      };

      finalizeLastAssistantMessage(convId, {
        provider: targetProvider,
        model: response.model || targetModel,
        routing: routingMeta,
      });

      if (messages.length === 0) {
        const placeholderTitle = text.slice(0, 40) + (text.length > 40 ? '...' : '');
        useChatStore.getState().renameConversation(convId, placeholderTitle);
        generateChatTitle(convId, text, targetProvider, response.model || targetModel, apiKey);
      }

      if (!streamedContent && response.content) {
        updateLastAssistantMessage(convId, response.content);
      }

      recordRequest({
        provider: targetProvider,
        model: response.model || targetModel,
        latencyMs: response.latencyMs,
        tokens: response.tokenUsage?.total,
        wasSmartMode: mode === 'smart',
      });
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      const errorMessage = parseProviderError(error);
      addMessage(convId, { role: 'assistant', content: errorMessage });
    } finally {
      setIsProcessing(false);
      setStreamingMessageId(null);
      abortRef.current = null;
    }
  }, [addMessage, updateLastAssistantMessage, finalizeLastAssistantMessage, mode, recordRequest, setRoutingState]);

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
  const handleSend = useCallback(async (text: string, skipAddUserMessage: boolean = false) => {
    if (isProcessing || pendingRoute) return;

    let convId = activeConversation?.id;
    if (!convId) {
      convId = createConversation();
    }

    if (!skipAddUserMessage) {
      addMessage(convId, { role: 'user', content: text });
    }

    setIsProcessing(true);

    try {
      if (mode === 'smart') {
        if (showRoutingAnimation) setRoutingState('analyzing');
        
        const routeResult = await routePrompt({
          prompt: text,
          connections,
          fallbackProvider,
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
          setPendingRoute({ text, routeResult, convId });
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
            content: \`\${targetProvider} is not connected. Please add your API key.\`,
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
    connections, mode, fallbackProvider, showRoutingAnimation, executeSend, setRoutingState
  ]);

  const handleOverride = (provider: ProviderId) => {
    if (!pendingRoute) return;
    const { text, convId, routeResult } = pendingRoute;
    const model = connections[provider]?.selectedModel || '';
    setPendingRoute(null);
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
    handleSend(prevMsg.content, true);
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
                   return (
                     <button
                       key={id}
                       onClick={() => handleOverride(id as ProviderId)}
                       className={\`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all flex items-center gap-1.5 \${
                         isSelected 
                           ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                           : 'bg-white/[0.03] text-neutral-400 border border-white/[0.05] hover:bg-white/[0.08]'
                       }\`}
                     >
                       <span className="text-[14px]">{meta?.icon}</span>
                       {meta?.name}
                       {!isSelected && <span className="opacity-0 group-hover:opacity-100 ml-1 text-[10px] uppercase tracking-wide">Override</span>}
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
  if (msg.includes('403') || msg.toLowerCase().includes('quota')) return '⚠️ **Insufficient quota.** Check your usage with the provider.';
  if (msg.includes('404')) return '⚠️ **Model unavailable.** Try selecting a different model.';
  if (msg.includes('500') || msg.includes('502') || msg.includes('503')) return '⚠️ **Provider temporarily unavailable.** Try again shortly.';
  if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch')) return '⚠️ **Network error.** Please check your internet connection.';
  return \`⚠️ **API Error:** \${msg}\`;
}
`;

const lines = content.split('\n');
const startIdx = lines.findIndex(l => l.includes('export default function ChatPage() {'));
const endIdx = lines.length;

if (startIdx !== -1) {
  lines.splice(startIdx, endIdx - startIdx, newCode);
  
  // also add missing imports at top
  let importStr = lines.slice(0, startIdx).join('\n');
  if (!importStr.includes('AnimatePresence')) {
    importStr = importStr.replace(/import \{ motion \}/, 'import { motion, AnimatePresence }');
    if (!importStr.includes('AnimatePresence')) {
        importStr = importStr.replace(/import React, {/, "import { motion, AnimatePresence } from 'framer-motion';\nimport React, {");
    }
  }
  if (!importStr.includes('PROVIDER_META')) {
      importStr = importStr.replace(/import { getProvider }/, "import { getProvider, PROVIDER_META }");
  }
  
  fs.writeFileSync(filePath, importStr + '\n' + newCode);
  console.log('Successfully updated Chat.tsx');
} else {
  console.log('Could not find ChatPage function');
}
