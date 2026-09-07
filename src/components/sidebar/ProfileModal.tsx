import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Lock, LogOut, Check, Loader2, Shield } from 'lucide-react';
import { useUserStore } from '@/store/user';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/lib/firebase';
import { deleteUser, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { keyManager } from '@/lib/storage';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, updateUser, logout } = useUserStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'passphrase'>('profile');

  // Profile state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Passphrase state
  const [currentPassphrase, setCurrentPassphrase] = useState('');
  const [newPassphrase, setNewPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [passphraseSaving, setPassphraseSaving] = useState(false);
  const [passphraseMsg, setPassphraseMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Reset state when opened
  React.useEffect(() => {
    if (isOpen) {
      setFullName(user?.fullName || '');
      setEmail(user?.email || '');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassphrase('');
      setNewPassphrase('');
      setConfirmPassphrase('');
      setProfileMsg(null);
      setPwdMsg(null);
      setPassphraseMsg(null);
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not logged in');

      await updateProfile(currentUser, { displayName: fullName });
      // Note: Updating email in Firebase requires verification, keeping it simple here

      updateUser({ fullName, email });
      setProfileMsg({ text: 'Profile updated successfully.', type: 'success' });
    } catch (err: any) {
      setProfileMsg({ text: err.message, type: 'error' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (newPassword !== confirmPassword) {
      setPwdMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setPwdMsg({ text: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }

    setPwdSaving(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not logged in');

      if (currentUser.email) {
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
      }

      await updatePassword(currentUser, newPassword);

      setPwdMsg({ text: 'Password updated successfully.', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwdMsg({ text: err.message, type: 'error' });
    } finally {
      setPwdSaving(false);
    }
  };

  const handleSavePassphrase = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassphraseMsg(null);
    if (newPassphrase.length < 4) {
      setPassphraseMsg({ text: 'New passphrase must be at least 4 characters.', type: 'error' });
      return;
    }
    if (newPassphrase !== confirmPassphrase) {
      setPassphraseMsg({ text: 'New passphrases do not match.', type: 'error' });
      return;
    }

    setPassphraseSaving(true);
    try {
      const success = await keyManager.changePassphrase(currentPassphrase, newPassphrase);
      if (!success) {
        setPassphraseMsg({ text: 'Incorrect current passphrase.', type: 'error' });
        return;
      }
      setCurrentPassphrase('');
      setNewPassphrase('');
      setConfirmPassphrase('');
      setPassphraseMsg({ text: 'Passphrase updated successfully.', type: 'success' });
      setTimeout(() => setPassphraseMsg(null), 3000);
    } catch (err: any) {
      setPassphraseMsg({ text: err.message || 'An error occurred', type: 'error' });
    } finally {
      setPassphraseSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };


  return (
    <AnimatePresence>
      {isOpen && <motion.div
        key="profile-overlay"
        initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[100]"
            onClick={onClose}
      />}
      
      {isOpen && <div key="profile-modal-wrapper" className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none p-4">
        <motion.div
          key="profile-modal"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="w-full max-w-[500px] bg-[#141414] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
            >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <h2 className="text-lg font-semibold text-white">Your Profile</h2>
              <button
                onClick={onClose}
                className="p-1.5 text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/[0.05]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex">
              {/* Sidebar Tabs */}
              <div className="w-44 border-r border-white/[0.06] bg-[#0A0A0A] p-5 flex flex-col gap-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                    activeTab === 'profile'
                      ? 'bg-white/[0.08] text-white'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <User size={15} />
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                    activeTab === 'password'
                      ? 'bg-white/[0.08] text-white'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <Lock size={15} />
                  Password
                </button>
                <button
                  onClick={() => setActiveTab('passphrase')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                    activeTab === 'passphrase'
                      ? 'bg-white/[0.08] text-white'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <Shield size={15} />
                  Passphrase
                </button>
                <div className="flex-1" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all mt-auto"
                >
                  <LogOut size={15} />
                  Log Out
                </button>
              </div>

              {/* Main Area */}
              <div className="flex-1 p-5 bg-[#141414]">
                {activeTab === 'profile' && (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                      <label className="block text-[12px] font-medium text-neutral-400 mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-neutral-400 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                        required
                      />
                    </div>

                    <div className="min-h-[36px] flex flex-col justify-end">
                      {profileMsg && (
                        <div className={`p-2 rounded-lg text-[12px] ${profileMsg.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                          {profileMsg.type === 'success' && <Check size={14} className="inline mr-1" />}
                          {profileMsg.text}
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={profileSaving}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[13px] font-medium transition-colors disabled:opacity-50"
                      >
                        {profileSaving && <Loader2 size={14} className="animate-spin" />}
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}

                {activeTab === 'password' && (
                  <div className="space-y-6">
                    <form onSubmit={handleSavePassword} className="space-y-3">
                      <div>
                        <label className="block text-[12px] font-medium text-neutral-400 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-neutral-400 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-neutral-400 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                          required
                        />
                      </div>

                      <div className="min-h-[36px] flex flex-col justify-end">
                        {pwdMsg && (
                          <div className={`p-2 rounded-lg text-[12px] ${pwdMsg.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {pwdMsg.type === 'success' && <Check size={14} className="inline mr-1" />}
                            {pwdMsg.text}
                          </div>
                        )}
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={pwdSaving}
                          className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[13px] font-medium transition-colors disabled:opacity-50"
                        >
                          {pwdSaving && <Loader2 size={14} className="animate-spin" />}
                          Update Password
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeTab === 'passphrase' && (
                  <div className="space-y-6">
                    <form onSubmit={handleSavePassphrase} className="space-y-3">
                      <div>
                        <label className="block text-[12px] font-medium text-neutral-400 mb-1">
                          Current Passphrase
                        </label>
                        <input
                          type="password"
                          value={currentPassphrase}
                          onChange={(e) => setCurrentPassphrase(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-neutral-400 mb-1">
                          New Passphrase
                        </label>
                        <input
                          type="password"
                          value={newPassphrase}
                          onChange={(e) => setNewPassphrase(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                          required
                          minLength={4}
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-neutral-400 mb-1">
                          Confirm New Passphrase
                        </label>
                        <input
                          type="password"
                          value={confirmPassphrase}
                          onChange={(e) => setConfirmPassphrase(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                          required
                        />
                      </div>

                      <div className="min-h-[36px] flex flex-col justify-end">
                        {passphraseMsg && (
                          <div className={`p-2 rounded-lg text-[12px] ${passphraseMsg.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {passphraseMsg.type === 'success' && <Check size={14} className="inline mr-1" />}
                            {passphraseMsg.text}
                          </div>
                        )}
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={passphraseSaving}
                          className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[13px] font-medium transition-colors disabled:opacity-50"
                        >
                          {passphraseSaving && <Loader2 size={14} className="animate-spin" />}
                          Update Passphrase
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
        </motion.div>
      </div>}
    </AnimatePresence>
  );
}
