// ─────────────────────────────────────────────
// BYOK — Workspace Sidebar
// ─────────────────────────────────────────────
// Persistent sidebar on desktop. Collapsible drawer on mobile.
// Displays: branding, connected providers, new chat, navigation.
// ─────────────────────────────────────────────

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  ArrowLeft,
  Clock,
  BarChart3,
  Cpu,
  Key,
  Settings,
  X,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Loader2,
  Trash2
} from 'lucide-react';
import ProviderStatus from './ProviderStatus';
import NavItem from './NavItem';
import { useChatStore } from '@/store/chat';
import { useSettingsStore } from '@/store/settings';
import { useUserStore } from '@/store/user';
import ProfileModal from './ProfileModal';

export default function Sidebar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const user = useUserStore(s => s.user);
  const navigate = useNavigate();
  const location = useLocation();
  const createConversation = useChatStore(s => s.createConversation);
  const conversations = useChatStore(s => s.conversations);
  const activeConversationId = useChatStore(s => s.activeConversationId);
  const setActiveConversation = useChatStore(s => s.setActiveConversation);
  const generatingTitleId = useChatStore(s => s.generatingTitleId);
  const deleteConversation = useChatStore(s => s.deleteConversation);
  const sidebarCollapsed = useSettingsStore(s => s.sidebarCollapsed);
  const setSidebarCollapsed = useSettingsStore(s => s.setSidebarCollapsed);

  const isChatPage = location.pathname === '/workspace' || location.pathname === '/workspace/';
  const currentConv = conversations.find(c => c.id === activeConversationId);
  const isNewChatDisabled = currentConv ? currentConv.messages.length === 0 : false;
  const shouldDisableButton = isChatPage && isNewChatDisabled;

  const handleNewChat = () => {
    if (!isChatPage) {
      navigate('/workspace');
      return;
    }
    if (isNewChatDisabled) {
      navigate('/workspace');
      return;
    }
    createConversation();
    navigate('/workspace');
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50
          w-[320px] bg-[#0A0A0A] border-r border-white/[0.06]
          flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
        {/* ── Top: Branding ── */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-white/[0.04] shrink-0">
          <span className="text-lg font-bold tracking-tight text-white">
            BYOK
          </span>
          {/* Mobile close button */}
          <button
            onClick={() => setSidebarCollapsed(true)}
            className="lg:hidden p-1 text-neutral-400 hover:text-white transition-colors"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Connected Providers ── */}
        <div className="px-3 pt-4 pb-2">
          <p className="px-3 text-xs font-semibold tracking-[0.1em] uppercase text-neutral-500 mb-2">
            Connected Providers
          </p>
          <ProviderStatus providerId="gemini" />
          <ProviderStatus providerId="groq" />
          <ProviderStatus providerId="openrouter" />
        </div>

        {/* ── New Chat / Back to Chat Button ── */}
        <div className="px-3 pt-1 pb-3">
          <button
            onClick={handleNewChat}
            disabled={shouldDisableButton}
            className={`
              w-full flex items-center justify-center gap-2
              px-4 py-2.5 rounded-lg
              text-[15px] font-semibold text-white
              transition-all duration-200
              ${shouldDisableButton 
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-50' 
                : 'bg-purple-600/90 hover:bg-purple-500/90 hover:shadow-[0_0_20px_rgba(139,92,246,0.25)] active:scale-[0.98]'}
            `}
            aria-label={isChatPage ? "New Chat" : "Back to Chat"}
          >
            {isChatPage ? <Plus size={18} /> : <ArrowLeft size={18} />}
            {isChatPage ? "New Chat" : "Back to Chat"}
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="px-3 flex-1 flex flex-col gap-0.5 overflow-y-auto">
          {/* History Accordion */}
          <div className="flex flex-col">
            <button
              onClick={() => setHistoryOpen(!historyOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[15px] font-medium transition-all duration-200 ${
                historyOpen ? 'text-neutral-200 bg-white/[0.04]' : 'text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock size={18} className={historyOpen ? 'text-purple-400' : ''} />
                <span>History</span>
              </div>
              {historyOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            <AnimatePresence>
              {historyOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden flex flex-col gap-0.5 mt-0.5 pl-3 border-l border-white/5 ml-3"
                >
                  {conversations.length === 0 ? (
                    <div className="px-3 py-2 text-[13px] text-neutral-600">No recent chats</div>
                  ) : (
                    [...conversations]
                      .sort((a, b) => b.updatedAt - a.updatedAt)
                      .slice(0, 15) // Show up to 15 recent chats
                      .map(chat => {
                        const isActive = chat.id === activeConversationId;
                        const isGenerating = chat.id === generatingTitleId;
                        return (
                          <div key={chat.id} className="relative group w-full flex items-center">
                            <button
                              onClick={() => {
                                setActiveConversation(chat.id);
                                navigate('/workspace');
                              }}
                              className={`flex-1 min-w-0 flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-left truncate transition-colors pr-8 ${
                                isActive
                                  ? 'bg-white/[0.06] text-white'
                                  : 'text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200'
                              }`}
                            >
                              {isGenerating ? (
                                <Loader2 size={14} className="shrink-0 animate-spin text-purple-400" />
                              ) : (
                                <MessageSquare size={14} className="shrink-0" />
                              )}
                              <span className={`truncate -translate-y-[1px] ${isGenerating ? 'animate-pulse text-purple-400/80' : ''}`}>
                                {chat.title}
                              </span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteConversation(chat.id);
                              }}
                              className="absolute right-1.5 p-1.5 rounded-md text-neutral-500 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
                              title="Delete chat"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        );
                      })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <NavItem icon={BarChart3} label="Analytics" path="/workspace/analytics" />
          <NavItem icon={Cpu} label="Models" path="/workspace/models" />
          <NavItem icon={Key} label="API Keys" path="/workspace/api-keys" />
          <NavItem icon={Settings} label="Settings" path="/workspace/settings" />
        </nav>

        {/* ── Bottom ── */}
        <div className="px-3 pb-4 pt-2 border-t border-white/[0.04] shrink-0">
          {user ? (
            <button
              onClick={() => setProfileOpen(true)}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors hover:bg-white/[0.04]"
            >
              <div className="w-10 h-10 rounded-full bg-black border border-white/[0.08] text-white flex items-center justify-center text-[17px] font-bold shrink-0">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[15px] font-medium text-neutral-200 truncate">{user.fullName}</p>
                <p className="text-[13px] text-neutral-500 truncate">{user.email}</p>
              </div>
            </button>
          ) : (
            <button
              onClick={() => navigate('/auth?mode=login')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-[15px] font-medium text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
            >
              Sign In to BYOK
            </button>
          )}
        </div>
      </aside>

      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
