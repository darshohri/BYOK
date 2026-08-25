// ─────────────────────────────────────────────
// BYOK — Message List
// ─────────────────────────────────────────────
// Renders all messages in the active conversation.
// Auto-scrolls to the latest message.
// ─────────────────────────────────────────────

import React, { useRef, useEffect } from 'react';
import type { ConversationMessage } from '@/providers/types';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: ConversationMessage[];
  streamingMessageId?: string | null;
  onRetry?: (messageId: string) => void;
}

export default function MessageList({ messages, streamingMessageId, onRetry }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  const lastMessageCount = useRef(messages.length);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const isNewMessage = messages.length > lastMessageCount.current;
    bottomRef.current?.scrollIntoView({ behavior: isNewMessage ? 'smooth' : 'auto' });
    lastMessageCount.current = messages.length;
  }, [messages, messages.length > 0 ? messages[messages.length - 1]?.content : '']);

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-16 py-6">
      <div className="max-w-4xl mx-auto">
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isStreaming={msg.id === streamingMessageId}
            onRetry={onRetry ? () => onRetry(msg.id) : undefined}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
