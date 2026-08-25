import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Lock, LogOut, Check, Loader2 } from 'lucide-react';
import { useUserStore } from '@/store/user';
import { useNavigate } from 'react-router-dom';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, updateUser, logout } = useUserStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

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

  // Reset state when opened
  React.useEffect(() => {
    if (isOpen) {
      setFullName(user?.fullName || '');
      setEmail(user?.email || '');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setProfileMsg(null);
      setPwdMsg(null);
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);

    try {
      const res = await fetch('http://localhost:3001/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, fullName, email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

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
      const res = await fetch('http://localhost:3001/api/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');

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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

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
              <div className="w-40 border-r border-white/[0.06] bg-[#0A0A0A] p-2 flex flex-col gap-1">
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
                  Security
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
                  <form onSubmit={handleSavePassword} className="space-y-4">
                    <div>
                      <label className="block text-[12px] font-medium text-neutral-400 mb-1.5">
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
                    <div className="h-px bg-white/[0.06] my-2" />
                    <div>
                      <label className="block text-[12px] font-medium text-neutral-400 mb-1.5">
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
                      <label className="block text-[12px] font-medium text-neutral-400 mb-1.5">
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
                )}
              </div>
            </div>
        </motion.div>
      </div>}
    </AnimatePresence>
  );
}
