// ─────────────────────────────────────────────
// BYOK — API Keys Page
// ─────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Check, X, Loader2, Eye, EyeOff } from 'lucide-react';
import type { ProviderId } from '@/providers/types';
import { PROVIDER_META } from '@/providers/registry';
import { useProviderStore } from '@/store/providers';
import { keyStorage, keyManager } from '@/lib/storage';
import KeyUnlockModal from '@/components/ui/KeyUnlockModal';

const PROVIDERS: ProviderId[] = ['gemini', 'groq', 'openrouter'];

export default function ApiKeysPage() {
  const [isUnlocked, setIsUnlocked] = useState(keyManager.isUnlocked());
  const initializeStore = useProviderStore(state => state.initialize);

  useEffect(() => {
    // If we're already unlocked (e.g. via passphrase change), ensure store has decrypted keys
    if (isUnlocked) {
      initializeStore();
    }
  }, [isUnlocked, initializeStore]);

  if (!isUnlocked) {
    return <KeyUnlockModal onUnlocked={async () => {
      setIsUnlocked(true);
      // The useEffect above will handle the initializeStore call now
    }} />;
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-16 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-white mb-1">API Keys</h1>
        <p className="text-[13px] text-neutral-500 mb-8">
          Connect your providers. Keys are stored locally in your browser — never sent to BYOK servers.
        </p>

        <div className="space-y-4">
          {PROVIDERS.map((id, i) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <ProviderKeyCard providerId={id} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProviderKeyCard({ providerId }: { providerId: ProviderId }) {
  const connection = useProviderStore(s => s.connections[providerId]);
  const loading = useProviderStore(s => s.loading[providerId]);
  const error = useProviderStore(s => s.errors[providerId]);
  const connectProvider = useProviderStore(s => s.connectProvider);
  const disconnectProvider = useProviderStore(s => s.disconnectProvider);
  const testConnection = useProviderStore(s => s.testConnection);

  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'fail' | null>(null);

  const meta = PROVIDER_META[providerId];
  const maskedKey = connection.connected ? connection.maskedKey : null;

  const handleConnect = async () => {
    if (!keyInput.trim()) return;
    const success = await connectProvider(providerId, keyInput.trim());
    if (success) {
      setKeyInput('');
    }
  };

  const handleDisconnect = () => {
    disconnectProvider(providerId);
    setTestResult(null);
  };

  const handleTest = async () => {
    setTestResult(null);
    const success = await testConnection(providerId);
    setTestResult(success ? 'success' : 'fail');
    setTimeout(() => setTestResult(null), 3000);
  };

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 transition-colors hover:border-white/[0.1]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-lg">{meta.icon}</span>
          <div>
            <h3 className="text-[14px] font-semibold text-white">{meta.name}</h3>
            <p className="text-[11px] text-neutral-500">
              {meta.description}
              {' • '}
              <a
                href={
                  providerId === 'gemini'
                    ? 'https://aistudio.google.com/app/api-keys'
                    : providerId === 'groq'
                    ? 'https://console.groq.com/keys'
                    : 'https://openrouter.ai/workspaces/default/keys'
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition-colors underline-offset-2 hover:underline ml-1"
              >
                Get API Key
              </a>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full ${
              connection.connected
                ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]'
                : 'bg-neutral-600'
            }`}
          />
          <span className={`text-[11px] font-medium ${
            connection.connected ? 'text-emerald-400' : 'text-neutral-500'
          }`}>
            {connection.connected ? 'Connected' : 'Not connected'}
          </span>
        </div>
      </div>

      {connection.connected ? (
        <>
          {/* Connected state */}
          <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-white/[0.02] rounded-lg">
            <Key size={14} className="text-neutral-500" />
            <span className="text-[13px] text-neutral-400 font-mono">{maskedKey}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTest}
              disabled={loading}
              className="px-3 py-1.5 text-[12px] font-medium text-neutral-400 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : testResult === 'success' ? (
                <span className="flex items-center gap-1 text-emerald-400">
                  <Check size={14} /> Valid
                </span>
              ) : testResult === 'fail' ? (
                <span className="flex items-center gap-1 text-red-400">
                  <X size={14} /> Invalid
                </span>
              ) : (
                'Test Connection'
              )}
            </button>
            <button
              onClick={handleDisconnect}
              className="px-3 py-1.5 text-[12px] font-medium text-red-400/70 hover:text-red-400 bg-red-500/[0.04] hover:bg-red-500/[0.08] border border-red-500/[0.1] rounded-lg transition-all"
            >
              Remove
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Input state */}
          <div className="relative mb-3">
            <input
              type={showKey ? 'text' : 'password'}
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleConnect()}
              placeholder={`Enter your ${meta.name} API key...`}
              className="w-full px-3 py-2.5 pr-10 bg-white/[0.03] border border-white/[0.08] rounded-lg text-[13px] text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/40 transition-colors"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
              aria-label={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          {error && (
            <p className="text-[12px] text-red-400 mb-2">{error}</p>
          )}

          <button
            onClick={handleConnect}
            disabled={!keyInput.trim() || loading}
            className="px-4 py-2 text-[12px] font-medium text-white bg-purple-600/80 hover:bg-purple-500/80 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Validating...
              </>
            ) : (
              'Connect'
            )}
          </button>
        </>
      )}
    </div>
  );
}
