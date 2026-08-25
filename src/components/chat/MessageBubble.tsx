// ─────────────────────────────────────────────
// BYOK — Message Bubble
// ─────────────────────────────────────────────
// Renders individual chat messages (user and assistant).
// Assistant messages show provider badge + collapsible metadata.
// ─────────────────────────────────────────────

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Copy, Check, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // required for math styling
import type { ConversationMessage } from '@/providers/types';
import { PROVIDER_META } from '@/providers/registry';

interface MessageBubbleProps {
  message: ConversationMessage;
  isStreaming?: boolean;
  onRetry?: () => void;
}

export default function MessageBubble({ message, isStreaming, onRetry }: MessageBubbleProps) {
  const [metaExpanded, setMetaExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`group flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[75%] flex flex-col ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        <div
          className={`${
          isUser
            ? 'bg-white/[0.08] border border-white/[0.06] rounded-2xl rounded-br-md'
            : 'bg-transparent'
        }`}
      >
        {/* Provider badge for assistant messages */}
        {!isUser && message.provider && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <span
              className="text-[13px] font-medium"
              style={{ color: PROVIDER_META[message.provider]?.color || '#888' }}
            >
              {PROVIDER_META[message.provider]?.icon}{' '}
              {PROVIDER_META[message.provider]?.name}
            </span>
            {message.model && (
              <span className="text-[12px] text-neutral-600">
                · {message.model}
              </span>
            )}
            {message.routing?.mode === 'smart' && (
              <span className="text-[11px] text-purple-400/60 ml-1">Smart</span>
            )}
          </div>
        )}

        {/* Message content */}
        <div
          className={`text-[16px] leading-relaxed break-words ${
            isUser ? 'text-neutral-200 px-4 py-3 whitespace-pre-wrap' : 'text-neutral-300 prose prose-invert prose-p:leading-relaxed prose-pre:bg-white/[0.04] prose-pre:border prose-pre:border-white/[0.06] max-w-none'
          }`}
        >
          {isUser ? (
            message.content
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {message.content
                .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$')
                .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$')}
            </ReactMarkdown>
          )}
          {isStreaming && (
            <motion.span
              className="inline-block w-1.5 h-4 bg-purple-400/60 ml-0.5 align-text-bottom"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          )}
        </div>
      </div>

        {/* Action Bar (Copy / Retry) */}
        {!isStreaming && (
          <div className={`flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? 'justify-end' : 'justify-start'}`}>
            <button
              onClick={handleCopy}
              className="p-1.5 text-neutral-500 hover:text-neutral-300 transition-colors rounded-md hover:bg-white/[0.04]"
              aria-label="Copy message"
              title="Copy"
            >
              {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
            {!isUser && onRetry && (
              <button
                onClick={onRetry}
                className="p-1.5 text-neutral-500 hover:text-neutral-300 transition-colors rounded-md hover:bg-white/[0.04]"
                aria-label="Retry response"
                title="Retry"
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        )}

        {/* Collapsed metadata for assistant messages */}
        {!isUser && message.routing && !isStreaming && (
          <div className="mt-2">
            <button
              onClick={() => setMetaExpanded(!metaExpanded)}
              className="flex items-center gap-1 text-[12px] text-neutral-600 hover:text-neutral-400 transition-colors"
            >
              <span>
                {PROVIDER_META[message.provider!]?.name}
                {message.routing.mode === 'smart' && ' · Smart'}
                {message.routing.latencyMs && ` · ${(message.routing.latencyMs / 1000).toFixed(1)}s`}
              </span>
              {metaExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            {metaExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 pl-2 border-l border-white/[0.06] space-y-1 text-[12px] text-neutral-500"
              >
                {message.routing.reason && (
                  <div>
                    <span className="text-neutral-600">Reason: </span>
                    {message.routing.reason}
                  </div>
                )}
                {message.routing.confidence != null && (
                  <div>
                    <span className="text-neutral-600">Confidence: </span>
                    {Math.round(message.routing.confidence * 100)}%
                  </div>
                )}
                {message.routing.tokenUsage && (
                  <div>
                    <span className="text-neutral-600">Tokens: </span>
                    {message.routing.tokenUsage.total.toLocaleString()}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
