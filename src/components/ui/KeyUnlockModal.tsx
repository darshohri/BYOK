// ─────────────────────────────────────────────
// BYOK — Passphrase Confirmation Dialog
// ─────────────────────────────────────────────
// Only shown when the user clicks "Remove" on a connected API key.
// In 'create' mode: prompts user to set a passphrase for the first time.
// In 'verify' mode: asks for the existing passphrase to confirm removal.
// Never shown during normal app use or chat.
// ─────────────────────────────────────────────

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { keyManager } from '@/lib/storage';
import { Lock, ShieldAlert, Eye, EyeOff } from 'lucide-react';

interface PassphraseConfirmDialogProps {
  /** What the passphrase protects — displayed in the UI. e.g. "Groq" */
  providerName: string;
  /** Called when the user successfully confirms the passphrase. */
  onConfirmed: () => void;
  /** Called when the user cancels. */
  onCancel: () => void;
}

export default function PassphraseConfirmDialog({
  providerName,
  onConfirmed,
  onCancel,
}: PassphraseConfirmDialogProps) {
  const needsCreate = !keyManager.hasPassphrase();

  const [passphrase, setPassphrase] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase.trim()) return;
    setError(null);
    setLoading(true);

    if (needsCreate) {
      // Creating a passphrase for the first time
      if (passphrase.length < 4) {
        setError('Passphrase must be at least 4 characters.');
        setLoading(false);
        return;
      }
      if (passphrase !== confirm) {
        setError('Passphrases do not match.');
        setLoading(false);
        return;
      }
      await keyManager.setPassphrase(passphrase);
      onConfirmed();
    } else {
      // Verifying existing passphrase
      const ok = await keyManager.verifyPassphrase(passphrase);
      if (!ok) {
        setError('Incorrect passphrase.');
        setLoading(false);
        return;
      }
      onConfirmed();
    }

    setLoading(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onCancel}
        />

        {/* Dialog */}
        <motion.div
          className="relative z-10 bg-[#0E0E0E] border border-white/[0.08] rounded-2xl w-full max-w-sm p-6 overflow-hidden"
          initial={{ scale: 0.95, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 12 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          {/* Glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-red-500/10 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10">
            {/* Icon */}
            <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center mb-4">
              {needsCreate ? (
                <Lock size={18} className="text-red-400" />
              ) : (
                <ShieldAlert size={18} className="text-red-400" />
              )}
            </div>

            {/* Title */}
            <h2 className="text-[16px] font-semibold text-white mb-1">
              {needsCreate ? 'Set a Removal Passphrase' : 'Confirm Removal'}
            </h2>
            <p className="text-[12px] text-neutral-500 mb-5">
              {needsCreate
                ? `Create a passphrase to protect key removal. You'll need it whenever you want to remove an API key.`
                : `Enter your passphrase to remove the ${providerName} API key. This action cannot be undone.`}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Passphrase input */}
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={passphrase}
                  onChange={e => { setPassphrase(e.target.value); setError(null); }}
                  placeholder={needsCreate ? 'Create passphrase...' : 'Enter passphrase...'}
                  className="w-full px-3 py-2.5 pr-10 bg-white/[0.03] border border-white/[0.08] rounded-lg text-[13px] text-white placeholder:text-neutral-600 focus:outline-none focus:border-red-500/40 transition-colors"
                  autoFocus
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {/* Confirm input (create mode only) */}
              {needsCreate && (
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setError(null); }}
                  placeholder="Confirm passphrase..."
                  className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-[13px] text-white placeholder:text-neutral-600 focus:outline-none focus:border-red-500/40 transition-colors"
                  autoComplete="new-password"
                />
              )}

              {error && (
                <p className="text-[12px] text-red-400">{error}</p>
              )}

              {/* Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 py-2 text-[12px] font-medium text-neutral-400 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!passphrase.trim() || loading}
                  className="flex-1 py-2 text-[12px] font-medium text-white bg-red-600/80 hover:bg-red-500/80 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading
                    ? '...'
                    : needsCreate
                    ? 'Set & Remove'
                    : 'Remove Key'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
