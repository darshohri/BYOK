// ─────────────────────────────────────────────
// BYOK — Settings Page
// ─────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ProviderId, RoutingMode } from '@/providers/types';
import { useSettingsStore } from '@/store/settings';
import { useProviderStore } from '@/store/providers';
import { PROVIDER_META } from '@/providers/registry';
import { ledgerStorage, type OverrideEvent } from '@/lib/storage';

const MODE_OPTIONS: { id: RoutingMode; label: string; description: string }[] = [
  {
    id: 'smart',
    label: 'Smart',
    description: 'BYOK analyzes your prompt and selects the best connected provider.',
  },
  { id: 'gemini', label: 'Gemini', description: 'Always use Gemini for all requests.' },
  { id: 'groq', label: 'Groq', description: 'Always use Groq for all requests.' },
  { id: 'openrouter', label: 'OpenRouter', description: 'Always use OpenRouter for all requests.' },
];

const FALLBACK_OPTIONS: ProviderId[] = ['gemini', 'groq', 'openrouter'];

export default function SettingsPage() {
  const mode = useSettingsStore(s => s.mode);
  const setMode = useSettingsStore(s => s.setMode);
  const fallbackProvider = useSettingsStore(s => s.fallbackProvider);
  const setFallbackProvider = useSettingsStore(s => s.setFallbackProvider);
  const showRoutingAnimation = useSettingsStore(s => s.showRoutingAnimation);
  const setShowRoutingAnimation = useSettingsStore(s => s.setShowRoutingAnimation);
  const longContextThreshold = useSettingsStore(s => s.longContextThreshold);
  const setLongContextThreshold = useSettingsStore(s => s.setLongContextThreshold);
  const connections = useProviderStore(s => s.connections);

  const [events, setEvents] = useState<OverrideEvent[]>([]);

  useEffect(() => {
    ledgerStorage.getAllEvents().then(setEvents);
  }, []);

  const handleResetLedger = async () => {
    if (confirm("Are you sure you want to reset Router Insights? This will clear all historical routing biases.")) {
       await ledgerStorage.resetLedger();
       setEvents([]);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-16 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-white mb-1">Settings</h1>
        <p className="text-[13px] text-neutral-500 mb-8">Configure your workspace.</p>

        {/* Mode Selection */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 mb-6"
        >
          <h2 className="text-[14px] font-semibold text-white mb-1">Routing Mode</h2>
          <p className="text-[12px] text-neutral-500 mb-4">
            Choose how BYOK selects a provider for your prompts.
          </p>

          <div className="space-y-2">
            {MODE_OPTIONS.map(opt => {
              const isProvider = opt.id !== 'smart';
              const isConnected = isProvider ? connections[opt.id as ProviderId]?.connected : true;

              return (
                <button
                  key={opt.id}
                  onClick={() => setMode(opt.id)}
                  disabled={isProvider && !isConnected}
                  className={`w-full flex items-start gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                    mode === opt.id
                      ? 'bg-purple-500/[0.08] border border-purple-500/[0.15]'
                      : isConnected || !isProvider
                      ? 'bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04]'
                      : 'bg-white/[0.01] border border-white/[0.03] opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      mode === opt.id
                        ? 'border-purple-400'
                        : 'border-neutral-600'
                    }`}
                  >
                    {mode === opt.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    )}
                  </div>
                  <div>
                    <p className={`text-[13px] font-medium ${
                      mode === opt.id ? 'text-white' : 'text-neutral-300'
                    }`}>
                      {opt.label}
                      {opt.id === 'smart' && (
                        <span className="ml-2 text-[10px] text-purple-400/60 font-normal">
                          Default
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">{opt.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Fallback Provider */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 mb-6"
        >
          <h2 className="text-[14px] font-semibold text-white mb-1">Fallback Provider</h2>
          <p className="text-[12px] text-neutral-500 mb-4">
            When Smart Mode has low confidence, this provider will be used instead.
          </p>

          <div className="flex gap-2">
            {FALLBACK_OPTIONS.map(id => {
              const meta = PROVIDER_META[id];
              const isConnected = connections[id]?.connected;
              return (
                <button
                  key={id}
                  onClick={() => setFallbackProvider(id)}
                  disabled={!isConnected}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
                    fallbackProvider === id
                      ? 'bg-purple-500/[0.1] border border-purple-500/[0.2] text-white'
                      : isConnected
                      ? 'bg-white/[0.03] border border-white/[0.06] text-neutral-400 hover:bg-white/[0.06]'
                      : 'bg-white/[0.01] border border-white/[0.03] text-neutral-600 cursor-not-allowed'
                  }`}
                >
                  <span>{meta.icon}</span>
                  {meta.name}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Animation Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5"
        >
          <h2 className="text-[14px] font-semibold text-white mb-4">Preferences</h2>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[13px] text-neutral-300">Routing animation</p>
              <p className="text-[11px] text-neutral-500">
                Show "Analyzing task..." animation during Smart Mode routing.
              </p>
            </div>
            <button
              onClick={() => setShowRoutingAnimation(!showRoutingAnimation)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                showRoutingAnimation ? 'bg-purple-500' : 'bg-neutral-700'
              }`}
              role="switch"
              aria-checked={showRoutingAnimation}
              aria-label="Toggle routing animation"
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  showRoutingAnimation ? 'left-[22px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-white/[0.04]">
            <div>
              <p className="text-[13px] text-neutral-300">Long-Context Threshold</p>
              <p className="text-[11px] text-neutral-500 max-w-sm">
                Prompts exceeding this approximate token count bypass normal classification and are sent to the model with the largest context window.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-[#0a0a0a] border border-white/[0.06] rounded-lg px-3 py-1.5 focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/50 transition-all">
              <input
                type="number"
                min="1000"
                step="1000"
                value={longContextThreshold}
                onChange={(e) => setLongContextThreshold(Number(e.target.value) || 8000)}
                className="w-16 bg-transparent text-[13px] text-white outline-none text-right font-mono"
              />
              <span className="text-[11px] text-neutral-500">tokens</span>
            </div>
          </div>
        </motion.div>
        {/* Router Insights */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 mt-6 mb-6"
        >
          <h2 className="text-[14px] font-semibold text-white mb-1">Router Insights</h2>
          <p className="text-[12px] text-neutral-500 mb-4">
            BYOK learns from your manual overrides to personalize Smart Routing.
          </p>

          <div className="flex items-center justify-between bg-[#0a0a0a] border border-white/[0.04] rounded-lg p-4">
             <div>
                <p className="text-[13px] text-white">Learned Overrides</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  {events.length} {events.length === 1 ? 'event' : 'events'} recorded
                </p>
             </div>
             
             <button
               onClick={handleResetLedger}
               disabled={events.length === 0}
               className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-md text-[12px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
               Reset Ledger
             </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
