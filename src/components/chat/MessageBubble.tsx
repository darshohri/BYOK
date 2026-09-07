// ─────────────────────────────────────────────
// BYOK — Message Bubble
// ─────────────────────────────────────────────
// Renders individual chat messages (user and assistant).
// Assistant messages show provider badge + collapsible metadata.
// ─────────────────────────────────────────────

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Copy, Check, RotateCcw, Edit2, X, Send, FileText } from 'lucide-react';
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
  onEdit?: (id: string, newContent: string) => void;
}

export default function MessageBubble({ message, isStreaming, onRetry, onEdit }: MessageBubbleProps) {
  const [metaExpanded, setMetaExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  useEffect(() => {
    if (isEditing && editTextareaRef.current) {
      editTextareaRef.current.style.height = 'auto';
      editTextareaRef.current.style.height = `${editTextareaRef.current.scrollHeight}px`;
      editTextareaRef.current.focus();
    }
  }, [isEditing, editContent]);

  const handleSubmitEdit = () => {
    const trimmed = editContent.trim();
    if (trimmed && trimmed !== message.content && onEdit) {
      onEdit(message.id, trimmed);
    }
    setIsEditing(false);
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
          isUser && !isEditing
            ? 'bg-white/[0.08] border border-white/[0.06] rounded-2xl rounded-br-md'
            : 'bg-transparent'
        } ${isEditing ? 'w-full min-w-[300px] md:min-w-[500px]' : ''}`}
      >
        {/* Provider badge for assistant messages */}
        {!isUser && message.provider && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <span
              className="inline-flex items-center gap-1 text-[13px] font-medium"
              style={{ color: PROVIDER_META[message.provider]?.color || '#888' }}
            >
              {PROVIDER_META[message.provider]?.icon}
              <span>{PROVIDER_META[message.provider]?.name}</span>
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
        {isEditing ? (
          <div className="bg-white/[0.04] border border-purple-500/30 rounded-2xl p-3 shadow-lg">
            <textarea
              ref={editTextareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-transparent text-neutral-200 outline-none resize-none overflow-hidden leading-relaxed"
              rows={1}
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(message.content);
                }}
                className="px-3 py-1.5 rounded-lg text-[13px] font-medium text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitEdit}
                disabled={!editContent.trim()}
                className="px-3 py-1.5 rounded-lg text-[13px] font-medium bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save & Submit
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`text-[16px] leading-relaxed break-words ${
              isUser ? 'text-neutral-200 px-4 py-3 whitespace-pre-wrap' : 'text-neutral-300 prose prose-invert prose-p:leading-relaxed prose-pre:bg-white/[0.04] prose-pre:border prose-pre:border-white/[0.06] max-w-none'
            }`}
          >
            {isUser && message.attachments && message.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {message.attachments.map((att, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden border border-white/[0.1] bg-white/[0.02]">
                    {att.type === 'image' ? (
                      <img src={att.data} alt={att.name} className="max-w-[240px] max-h-[240px] object-cover" />
                    ) : (
                      <div className="flex items-center gap-2 p-2.5 bg-white/[0.03]">
                         <FileText size={16} className="text-neutral-400" />
                         <span className="text-[13px] font-medium text-neutral-300 truncate max-w-[150px]">{att.name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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
        )}
      </div>

        {/* Action Bar (Copy / Retry / Edit) */}
        {!isStreaming && !isEditing && (
          <div className={`flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? 'justify-end' : 'justify-start'}`}>
            {isUser && onEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-neutral-500 hover:text-neutral-300 transition-colors rounded-md hover:bg-white/[0.04]"
                aria-label="Edit message"
                title="Edit"
              >
                <Edit2 size={14} />
              </button>
            )}
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
              <span className="flex items-center">
                {PROVIDER_META[message.provider!]?.name}
                {message.routing.fallbackHistory && message.routing.fallbackHistory.length > 0 && (
                  <span className="text-amber-500/70 ml-1.5 flex items-center">
                    (after {PROVIDER_META[message.routing.fallbackHistory[0].provider]?.name} failed)
                  </span>
                )}
                {message.routing.mode === 'smart' && <span className="ml-1.5">· Smart</span>}
                {message.routing.latencyMs && <span className="ml-1.5">· {(message.routing.latencyMs / 1000).toFixed(1)}s</span>}
              </span>
              {metaExpanded ? <ChevronUp size={12} className="ml-1" /> : <ChevronDown size={12} className="ml-1" />}
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
                {message.routing.fallbackHistory && message.routing.fallbackHistory.length > 0 && (
                  <div className="mt-2 text-amber-500/70 border-l border-amber-500/20 pl-2">
                    <span className="text-amber-500/90 font-medium block mb-1">Fallback History:</span>
                    {message.routing.fallbackHistory.map((fallback, i) => (
                      <div key={i} className="mb-0.5 leading-tight">
                        <span className="text-amber-500/90">{PROVIDER_META[fallback.provider]?.name}:</span> {fallback.error.replace(/\*/g, '')}
                      </div>
                    ))}
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
