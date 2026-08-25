// ─────────────────────────────────────────────
// BYOK — Composer
// ─────────────────────────────────────────────
// Bottom-fixed input area with mode selector and send button.
// Layout: [ + ] Ask BYOK anything... [ Smart ▾ ] [ → ]
// ─────────────────────────────────────────────

import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RoutingMode, ProviderId } from '@/providers/types';
import { useSettingsStore } from '@/store/settings';
import { useProviderStore } from '@/store/providers';
import { PROVIDER_META } from '@/providers/registry';

interface ComposerProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

const MODE_OPTIONS: { id: RoutingMode; label: string }[] = [
  { id: 'smart', label: 'Smart' },
  { id: 'gemini', label: 'Gemini' },
  { id: 'groq', label: 'Groq' },
  { id: 'openrouter', label: 'OpenRouter' },
];

export default function Composer({ onSend, disabled }: ComposerProps) {
  const [text, setText] = useState('');
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const mode = useSettingsStore(s => s.mode);
  const setMode = useSettingsStore(s => s.setMode);
  const connections = useProviderStore(s => s.connections);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
    }
  }, [text]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setModeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentModeLabel =
    mode === 'smart' ? 'Smart' : PROVIDER_META[mode as ProviderId]?.name || mode;

  return (
    <div className="shrink-0 px-4 md:px-8 lg:px-16 pb-6 pt-2">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-end gap-3 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 transition-colors focus-within:border-white/[0.14] focus-within:bg-white/[0.05]">
          {/* Attachment button (prepared for future use) */}
          <button
            className="shrink-0 p-1.5 text-neutral-500 hover:text-neutral-300 transition-colors rounded-md hover:bg-white/[0.05]"
            aria-label="Attach file"
            title="Attachments coming soon"
          >
            <Plus size={18} />
          </button>

          {/* Text input */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask BYOK anything..."
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent text-[16px] text-white placeholder:text-neutral-500 resize-none outline-none min-h-[24px] max-h-[200px] py-1 leading-relaxed"
            aria-label="Message input"
          />

          {/* Mode selector */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setModeDropdownOpen(!modeDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[14px] font-medium text-neutral-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] rounded-md transition-all"
              aria-label="Select mode"
            >
              {mode === 'smart' && (
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-1" />
              )}
              {currentModeLabel}
              <ChevronDown size={12} />
            </button>

            <AnimatePresence>
              {modeDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full right-0 mb-2 w-44 bg-[#141414] border border-white/[0.08] rounded-lg shadow-xl overflow-hidden z-50"
                >
                  <div className="py-1">
                    {MODE_OPTIONS.map(opt => {
                      const isProvider = opt.id !== 'smart';
                      const isConnected = isProvider
                        ? connections[opt.id as ProviderId]?.connected
                        : true;
                      const isActive = mode === opt.id;

                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setMode(opt.id);
                            setModeDropdownOpen(false);
                          }}
                          disabled={isProvider && !isConnected}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-[14px] text-left transition-colors ${
                            isActive
                              ? 'bg-white/[0.06] text-white'
                              : isConnected || !isProvider
                              ? 'text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200'
                              : 'text-neutral-600 cursor-not-allowed'
                          }`}
                        >
                          <div className="w-4 flex items-center justify-center shrink-0">
                            {opt.id === 'smart' ? (
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                            ) : (
                              <span className="text-[11px] flex items-center justify-center">
                                {PROVIDER_META[opt.id as ProviderId]?.icon}
                              </span>
                            )}
                          </div>
                          <span className="flex-1">{opt.label}</span>
                          {isProvider && !isConnected && (
                            <span className="text-[10px] text-neutral-600">
                              No key
                            </span>
                          )}
                          {isActive && (
                            <span className="w-1 h-1 rounded-full bg-purple-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!text.trim() || disabled}
            className={`shrink-0 p-2 rounded-lg transition-all duration-200 ${
              text.trim() && !disabled
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                : 'bg-white/[0.04] text-neutral-600 cursor-not-allowed'
            }`}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-[11px] text-neutral-600 mt-2">
          AI can make mistakes. Verify important info.
        </p>
      </div>
    </div>
  );
}
