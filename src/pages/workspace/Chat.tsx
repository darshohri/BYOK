// ─────────────────────────────────────────────
// BYOK — Chat Page (Main Workspace View)
// ─────────────────────────────────────────────
// Wires together EmptyState, MessageList, Composer,
// RoutingIndicator, and the full send message flow.
// ─────────────────────────────────────────────

import React, { useState, useCallback, useRef } from 'react';
import EmptyState from '@/components/chat/EmptyState';
import MessageList from '@/components/chat/MessageList';
import Composer from '@/components/chat/Composer';
import { useChatStore } from '@/store/chat';
import { useProviderStore } from '@/store/providers';
import { useSettingsStore } from '@/store/settings';
import { useAnalyticsStore } from '@/store/analytics';
import { getProvider } from '@/providers/registry';
import { routePrompt } from '@/routing/smartRouter';
import { generateChatTitle } from '@/lib/titleGenerator';
import { keyStorage } from '@/lib/storage';
import type { ProviderId, RouterResult } from '@/providers/types';

export default function ChatPage() {
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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

  const handleSend = useCallback(async (text: string, skipAddUserMessage: boolean = false) => {
    if (isProcessing) return;

    // Ensure we have an active conversation
    let convId = activeConversation?.id;
    if (!convId) {
      convId = createConversation();
    }

    if (!skipAddUserMessage) {
      // Add user message
      addMessage(convId, { role: 'user', content: text });
    }

    setIsProcessing(true);

    try {
      let routeResult: RouterResult | null = null;
      let targetProvider: ProviderId;
      let targetModel: string;

      if (mode === 'smart') {
        // ── Smart Mode ──────────────────────
        if (showRoutingAnimation) {
          setRoutingState('analyzing');
        }

        routeResult = routePrompt({
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

        targetProvider = routeResult.provider;
        targetModel = routeResult.model;

        if (showRoutingAnimation) {
          setRoutingState('selected', targetProvider, Math.round(routeResult.confidence * 100));

          // Brief pause for the user to see the selection
          await new Promise(r => setTimeout(r, 600));
          setRoutingState('hidden');
        }
      } else {
        // ── Manual Mode ─────────────────────
        targetProvider = mode as ProviderId;
        const conn = connections[targetProvider];

        if (!conn?.connected) {
          addMessage(convId, {
            role: 'assistant',
            content: `${targetProvider} is not connected. Please add your API key in the API Keys page.`,
          });
          setIsProcessing(false);
          return;
        }

        targetModel = conn.selectedModel || '';
      }

      // Get the API key (never stored in chat)
      const apiKey = keyStorage.getKey(targetProvider);
      if (!apiKey) {
        addMessage(convId, {
          role: 'assistant',
          content: `No API key found for ${targetProvider}. Please reconnect in the API Keys page.`,
        });
        setIsProcessing(false);
        return;
      }

      // Add placeholder assistant message for streaming
      addMessage(convId, {
        role: 'assistant',
        content: '',
        provider: targetProvider,
        model: targetModel,
      });

      // Get the last added message ID for streaming updates
      const currentConv = useChatStore.getState().getConversation(convId);
      const lastMsg = currentConv?.messages[currentConv.messages.length - 1];
      if (lastMsg) {
        setStreamingMessageId(lastMsg.id);
      }

      // Build message history for the API
      const messages = (currentConv?.messages || [])
        .filter(m => m.role === 'user' || (m.role === 'assistant' && m.content))
        .slice(0, -1) // Remove the empty placeholder
        .map(m => ({ role: m.role, content: m.content }));

      // Send the request
      const provider = getProvider(targetProvider);
      const controller = new AbortController();
      abortRef.current = controller;

      // Auto-title will happen after the response finishes streaming
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
          updateLastAssistantMessage(convId!, streamedContent);
        },
      });

      // Finalize the message with metadata
      finalizeLastAssistantMessage(convId, {
        provider: targetProvider,
        model: response.model || targetModel,
        routing: {
          mode: mode === 'smart' ? 'smart' : targetProvider,
          confidence: routeResult?.confidence,
          reason: routeResult?.reason,
          scores: routeResult?.scores,
          latencyMs: response.latencyMs,
          tokenUsage: response.tokenUsage,
        },
      });

      // Auto-title if it's the first message, now safely AFTER the main stream finishes
      if (messages.length === 0) {
        // Optimistically set title to user's prompt
        const placeholderTitle = text.slice(0, 40) + (text.length > 40 ? '...' : '');
        useChatStore.getState().renameConversation(convId!, placeholderTitle);
        generateChatTitle(convId!, text, targetProvider, response.model || targetModel, apiKey);
      }

      // If non-streaming, set the full content
      if (!streamedContent && response.content) {
        updateLastAssistantMessage(convId, response.content);
      }

      // Record analytics
      recordRequest({
        provider: targetProvider,
        model: response.model || targetModel,
        latencyMs: response.latencyMs,
        tokens: response.tokenUsage?.total,
        wasSmartMode: mode === 'smart',
      });
    } catch (error: any) {
      if (error.name === 'AbortError') return;

      // Add error as assistant message
      const errorMessage = parseProviderError(error);
      addMessage(convId, {
        role: 'assistant',
        content: errorMessage,
      });
    } finally {
      setIsProcessing(false);
      setStreamingMessageId(null);
      abortRef.current = null;
    }
  }, [
    isProcessing, activeConversation, createConversation, addMessage,
    updateLastAssistantMessage, finalizeLastAssistantMessage,
    connections, mode, fallbackProvider, showRoutingAnimation, recordRequest,
  ]);

  const handleRetry = useCallback((messageId: string) => {
    if (isProcessing) return;
    const conv = useChatStore.getState().getActiveConversation();
    if (!conv) return;

    const msgIndex = conv.messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;
    
    // The user message should be the one right before the assistant message
    const prevMsg = conv.messages[msgIndex - 1];
    if (!prevMsg || prevMsg.role !== 'user') return;
    
    // Truncate the conversation (remove this assistant message and anything after)
    useChatStore.getState().truncateConversation(conv.id, msgIndex);
    
    // Resubmit
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
        {/* Composer */}
        <Composer onSend={handleSend} disabled={isProcessing} />
      </div>
    </div>
  );
}

/**
 * Parse provider errors into user-friendly messages.
 */
function parseProviderError(error: any): string {
  const msg = error.message || 'An unknown error occurred';

  if (msg.includes('401') || msg.toLowerCase().includes('invalid')) {
    return '⚠️ **API key invalid.** Please check your API key in the API Keys page.';
  }
  if (msg.includes('429') || msg.toLowerCase().includes('rate limit')) {
    return '⚠️ **Rate limit reached.** You\'ve exceeded the provider\'s rate limit. Try again in a moment, or switch to a different provider.';
  }
  if (msg.includes('403') || msg.toLowerCase().includes('quota')) {
    return '⚠️ **Insufficient quota / Limit.** Your API quota or limit has been exceeded. Check your usage with the provider.';
  }
  if (msg.includes('404')) {
    return '⚠️ **Model unavailable.** The selected model may no longer be available (404 Error). Try selecting a different model in the Models page.';
  }
  if (msg.includes('500') || msg.includes('502') || msg.includes('503')) {
    return '⚠️ **Provider temporarily unavailable.** The AI provider is experiencing issues. Try again shortly.';
  }
  if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch')) {
    return '⚠️ **Network error.** Please check your internet connection and try again.';
  }

  return `⚠️ **API Error:** ${msg}`;
}
