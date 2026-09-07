import React, { useState, useEffect } from 'react';
import { keyManager } from '@/lib/storage';
import { Lock, Unlock, AlertTriangle, KeySquare } from 'lucide-react';

interface KeyUnlockModalProps {
  onUnlocked: () => void;
}

export default function KeyUnlockModal({ onUnlocked }: KeyUnlockModalProps) {
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'create' | 'unlock' | 'migrate' | 'loading'>('loading');

  useEffect(() => {
    async function determineMode() {
      const hasPlaintext = keyManager.hasPlaintextKeys();
      const hasEncrypted = await keyManager.hasAnyEncryptedKeys();
      
      if (hasPlaintext) {
        setMode('migrate');
      } else if (hasEncrypted) {
        setMode('unlock');
      } else {
        setMode('create');
      }
    }
    determineMode();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase.trim()) return;

    if ((mode === 'create' || mode === 'migrate') && passphrase.length < 4) {
      setError('Passphrase must be at least 4 characters.');
      return;
    }

    setError(null);

    const success = await keyManager.unlock(passphrase);
    if (!success) {
      setError('Incorrect passphrase, try again.');
      return;
    }

    if (mode === 'migrate') {
      await keyManager.migratePlaintextKeys();
    }

    onUnlocked();
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all keys? This will permanently delete your stored API keys. You cannot undo this action.')) {
      await keyManager.resetAll();
      setMode('create');
      setPassphrase('');
      setError(null);
    }
  };

  if (mode === 'loading') {
    return (
      <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center">
        <div className="animate-pulse text-purple-500">Loading secure workspace...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-2xl w-full max-w-md p-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-purple-500/10 blur-[120px] rounded-full" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
            {mode === 'unlock' ? (
              <Lock className="text-purple-400" size={24} />
            ) : mode === 'migrate' ? (
              <AlertTriangle className="text-amber-400" size={24} />
            ) : (
              <KeySquare className="text-purple-400" size={24} />
            )}
          </div>
          
          <h2 className="text-xl font-semibold text-white mb-2">
            {mode === 'unlock' ? 'Workspace Locked' : mode === 'migrate' ? 'Security Upgrade' : 'Secure Workspace'}
          </h2>
          
          <p className="text-[13px] text-neutral-400 mb-6">
            {mode === 'unlock' 
              ? 'Enter your passphrase to unlock your API keys for this session.'
              : mode === 'migrate'
              ? 'We are upgrading your API keys to use secure, encrypted local storage. Set a passphrase to encrypt your keys.'
              : 'Set a passphrase to encrypt your API keys. You will need to enter this every time you open the app.'}
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="relative">
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder={mode === 'unlock' ? 'Enter passphrase...' : 'Create passphrase...'}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-[14px] text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                autoFocus
              />
            </div>
            
            {error && (
              <p className="text-[13px] text-red-400 text-left">{error}</p>
            )}

            <button
              type="submit"
              disabled={!passphrase.trim()}
              className="w-full py-3 bg-purple-600/90 hover:bg-purple-500 transition-colors text-white text-[14px] font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {mode === 'unlock' ? <Unlock size={16} /> : <Lock size={16} />}
              {mode === 'unlock' ? 'Unlock Workspace' : 'Set Passphrase & Encrypt'}
            </button>
          </form>

          {mode === 'unlock' && (
            <button
              onClick={handleReset}
              className="mt-6 text-[12px] text-neutral-500 hover:text-red-400 transition-colors underline underline-offset-4"
            >
              Forgot passphrase? Reset all keys
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
