// ─────────────────────────────────────────────
// BYOK — History Page
// ─────────────────────────────────────────────

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MessageSquare, Trash2, Pencil, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '@/store/chat';

export default function HistoryPage() {
  const navigate = useNavigate();
  const conversations = useChatStore(s => s.conversations);
  const setActiveConversation = useChatStore(s => s.setActiveConversation);
  const deleteConversation = useChatStore(s => s.deleteConversation);
  const renameConversation = useChatStore(s => s.renameConversation);

  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filtered = conversations.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.messages.some(m => m.content.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpen = (id: string) => {
    setActiveConversation(id);
    navigate('/workspace');
  };

  const handleStartRename = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      renameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-16 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-white mb-1">History</h1>
        <p className="text-[13px] text-neutral-500 mb-6">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </p>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={15} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-[13px] text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/[0.15] transition-colors"
          />
        </div>

        {/* Conversation list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare size={28} className="mx-auto text-neutral-700 mb-3" />
            <p className="text-[13px] text-neutral-500">
              {search ? 'No matching conversations' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((conv, i) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="group flex items-center gap-3 px-4 py-3 bg-white/[0.02] border border-white/[0.04] rounded-lg hover:bg-white/[0.04] hover:border-white/[0.08] transition-all cursor-pointer"
                onClick={() => handleOpen(conv.id)}
              >
                <MessageSquare size={16} className="text-neutral-600 shrink-0" />

                <div className="flex-1 min-w-0">
                  {editingId === conv.id ? (
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSaveRename(conv.id)}
                        className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded px-2 py-1 text-[13px] text-white focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveRename(conv.id)}
                        className="p-1 text-emerald-400 hover:text-emerald-300"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 text-neutral-500 hover:text-neutral-300"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-[13px] font-medium text-neutral-200 truncate">
                        {conv.title}
                      </p>
                      <p className="text-[11px] text-neutral-600 mt-0.5">
                        {conv.messages.length} messages · {formatDate(conv.updatedAt)}
                      </p>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div
                  className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleStartRename(conv.id, conv.title)}
                    className="p-1.5 text-neutral-500 hover:text-neutral-300 rounded transition-colors"
                    aria-label="Rename"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => deleteConversation(conv.id)}
                    className="p-1.5 text-neutral-500 hover:text-red-400 rounded transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(ts: number): string {
  const now = Date.now();
  const diff = now - ts;

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}
