// ─────────────────────────────────────────────
// BYOK — Composer
// ─────────────────────────────────────────────
// Bottom-fixed input area with mode selector and send button.
// Layout: [ + ] Ask BYOK anything... [ Smart ▾ ] [ → ]
// ─────────────────────────────────────────────

import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, ChevronDown, X, FileText, Image as ImageIcon, Loader2, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RoutingMode, ProviderId, Attachment } from '@/providers/types';
import { useSettingsStore } from '@/store/settings';
import { useProviderStore } from '@/store/providers';
import { PROVIDER_META } from '@/providers/registry';
import { processAttachments } from '@/lib/attachments';

interface ComposerProps {
  onSend: (text: string, skipAddUserMessage?: boolean, attachments?: Attachment[]) => void;
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
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const getVisionError = (): string | null => {
    const hasImage = files.some(f => f.type.startsWith('image/'));
    if (!hasImage) return null;

    if (mode === 'smart') {
      const anyConnected = Object.values(connections).some(c => c.connected);
      if (!anyConnected) return "No providers connected. Please connect Gemini or OpenRouter to analyze images.";
      
      let hasVision = false;
      for (const p of Object.keys(connections)) {
        const conn = connections[p as ProviderId];
        if (conn?.connected) {
          const selectedModel = conn.availableModels.find(m => m.id === conn.selectedModel);
          if (selectedModel?.capabilities.includes('vision')) {
            hasVision = true;
            break;
          }
        }
      }
      if (!hasVision) {
        if (connections['openrouter']?.connected) {
           return "Enable a vision-capable OpenRouter model (e.g. MiniMax M3, Nemotron 3 Nano Omni), or connect Gemini.";
        }
        return "No vision-capable models available. Connect Gemini or OpenRouter to analyze images.";
      }
      return null;
    } else {
      const conn = connections[mode as ProviderId];
      if (!conn?.connected) return `${PROVIDER_META[mode as ProviderId]?.name} is not connected.`;
      const selectedModel = conn.availableModels.find(m => m.id === conn.selectedModel);
      if (!selectedModel?.capabilities.includes('vision')) {
        return "Selected model does not support images. Please switch to a vision-capable model.";
      }
      return null;
    }
  };

  const visionError = getVisionError();
  const canSend = text.trim() || files.length > 0;
  const isDisabled = disabled || isProcessingFiles || (canSend && visionError !== null) || !canSend;

  const handleSend = async () => {
    if (isDisabled) return;
    
    setErrorMsg(null);
    setIsProcessingFiles(true);
    let attachments: Attachment[] = [];
    try {
      if (files.length > 0) {
        attachments = await processAttachments(files);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsProcessingFiles(false);
      return;
    }
    
    setIsProcessingFiles(false);
    onSend(text.trim(), false, attachments);
    setText('');
    setFiles([]);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
    // reset input so same file can be selected again
    e.target.value = '';
    setErrorMsg(null);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setErrorMsg(null);
  };

  const currentModeLabel =
    mode === 'smart' ? 'Smart' : PROVIDER_META[mode as ProviderId]?.name || mode;

  return (
    <div className="shrink-0 px-4 md:px-8 lg:px-16 pb-6 pt-2">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex flex-col bg-white/[0.04] border border-white/[0.08] rounded-xl transition-colors focus-within:border-white/[0.14] focus-within:bg-white/[0.05]">
          
          {/* File Previews */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pt-4 pb-2 border-b border-white/[0.05]">
              {files.map((f, i) => (
                <div key={i} className="group bg-white/[0.06] rounded-md p-1.5 flex items-center gap-2 border border-white/[0.05]">
                  <div className="text-purple-400">
                    {f.type.startsWith('image/') ? <ImageIcon size={14} /> : <FileText size={14} />}
                  </div>
                  <span className="text-[11px] text-neutral-300 max-w-[120px] truncate font-medium">{f.name}</span>
                  <button 
                    onClick={() => removeFile(i)} 
                    className="p-1 hover:bg-white/[0.1] rounded-md text-neutral-500 hover:text-red-400 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Errors */}
          {(errorMsg || (visionError && files.length > 0)) && (
            <div className="px-4 pt-3 pb-1">
              <span className="text-[12px] font-medium text-orange-400 flex items-center gap-2">
                {errorMsg || visionError}
              </span>
            </div>
          )}

          {/* Input Area */}
          <div className="relative flex items-end gap-3 px-4 py-3">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              multiple 
              accept="image/*,.txt,.md,.csv,.json,.js,.ts"
              onChange={handleFileChange}
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="shrink-0 p-1.5 text-neutral-400 hover:text-white transition-colors rounded-md hover:bg-white/[0.05]"
              aria-label="Attach file"
              title="Attach image or text file"
            >
              <Plus size={18} />
            </button>

            <textarea
              ref={textareaRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask BYOK anything..."
              disabled={disabled}
              rows={1}
              className="flex-1 bg-transparent text-[15px] text-white placeholder:text-neutral-500 resize-none outline-none min-h-[24px] max-h-[200px] py-1 leading-relaxed"
              aria-label="Message input"
            />

            {/* Mode selector */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                onClick={() => setModeDropdownOpen(!modeDropdownOpen)}
                className={`flex items-center gap-2 px-4 py-2 text-[15px] leading-none font-medium transition-all border border-white/[0.04] rounded-full ${
                  mode === 'smart' 
                    ? 'text-blue-400 bg-white/[0.08] hover:bg-white/[0.12]' 
                    : 'text-neutral-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1]'
                }`}
                aria-label="Select mode"
              >
                {mode === 'smart' && (
                  <Brain size={18} className="text-blue-400" />
                )}
                <span>{currentModeLabel}</span>
                {mode !== 'smart' && <ChevronDown size={14} />}
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
                            className={`w-full flex items-center gap-2 px-3 py-2 text-[13px] text-left transition-colors ${
                              isActive
                                ? 'bg-white/[0.06] text-white'
                                : isConnected || !isProvider
                                ? 'text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200'
                                : 'text-neutral-600 cursor-not-allowed'
                            }`}
                          >
                            <div className="w-4 flex items-center justify-center shrink-0">
                              {opt.id === 'smart' ? (
                                <Brain size={14} className="text-blue-400" />
                              ) : (
                                <span className="text-[11px] flex items-center justify-center">
                                  {PROVIDER_META[opt.id as ProviderId]?.icon}
                                </span>
                              )}
                            </div>
                            <span className={`flex-1 ${(opt.id === 'smart' || opt.id === 'openrouter') ? '-translate-y-[1px]' : ''}`}>{opt.label}</span>
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
              disabled={isDisabled}
              className={`shrink-0 p-2 rounded-lg transition-all duration-200 flex items-center justify-center min-w-[32px] min-h-[32px] ${
                !isDisabled
                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                  : 'bg-white/[0.04] text-neutral-600 cursor-not-allowed'
              }`}
              aria-label="Send message"
            >
              {isProcessingFiles ? (
                <Loader2 size={16} className="animate-spin text-purple-300" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-[11px] text-neutral-600 mt-2">
          AI can make mistakes. Verify important info.
        </p>
      </div>
    </div>
  );
}
