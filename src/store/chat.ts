// ─────────────────────────────────────────────
// BYOK — Chat Store (Zustand)
// ─────────────────────────────────────────────
// Manages conversations and messages.
// API keys are NEVER stored inside conversations.
// Persisted to localStorage via the storage abstraction.
// ─────────────────────────────────────────────

import { create } from 'zustand';
import type {
  Conversation,
  ConversationMessage,
  ProviderId,
  TokenUsage,
} from '@/providers/types';
import { appStorage } from '@/lib/storage';

interface ChatState {
  /** All conversations. */
  conversations: Conversation[];

  /** Currently active conversation ID. */
  activeConversationId: string | null;

  // ── Routing State ───────────────────────
  routingPhase: 'hidden' | 'analyzing' | 'selected';
  routingProvider?: ProviderId;
  routingConfidence?: number;

  // ── UI State ───────────────────────────────
  generatingTitleId: string | null;
  setGeneratingTitleId(id: string | null): void;

  // ── Actions ───────────────────────────────

  /** Load persisted conversations on app boot. */
  initialize(): Promise<void>;

  /** Create a new empty conversation and make it active. Returns the new ID. */
  createConversation(): string;

  /** Delete a conversation by ID. */
  deleteConversation(id: string): void;

  /** Rename a conversation. */
  renameConversation(id: string, title: string): void;

  /** Set the active conversation. */
  setActiveConversation(id: string | null): void;

  /** Add a message to a conversation. */
  addMessage(conversationId: string, message: Omit<ConversationMessage, 'id' | 'timestamp'>): void;

  /** Update the content of the last assistant message (for streaming). */
  updateLastAssistantMessage(conversationId: string, content: string): void;

  /** Finalize the last assistant message with metadata after streaming completes. */
  finalizeLastAssistantMessage(
    conversationId: string,
    metadata: {
      provider?: ProviderId;
      model?: string;
      routing?: ConversationMessage['routing'];
    }
  ): void;

  /** Set the current routing phase for UI indicators. */
  setRoutingState(phase: 'hidden' | 'analyzing' | 'selected', provider?: ProviderId, confidence?: number): void;

  /** Truncate a conversation from a specific message index onwards. */
  truncateConversation(conversationId: string, fromIndex: number): void;

  /** Get the active conversation. */
  getActiveConversation(): Conversation | null;

  /** Get a conversation by ID. */
  getConversation(id: string): Conversation | undefined;
}

/** Generate a simple unique ID. */
function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** Auto-generate a title from the first user message. */
function generateTitle(content: string): string {
  const cleaned = content.trim().replace(/\n/g, ' ');
  if (cleaned.length <= 50) return cleaned;
  return cleaned.slice(0, 47) + '...';
}

/** Persist conversations to storage. */
async function persist(conversations: Conversation[]) {
  try {
    await appStorage.setChats(JSON.stringify(conversations));
  } catch {
    // Storage full or unavailable — fail silently
  }
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,

  routingPhase: 'hidden',
  routingProvider: undefined,
  routingConfidence: undefined,

  generatingTitleId: null,

  async initialize() {
    try {
      await appStorage.migrateChats();
      const raw = await appStorage.getChats();
      if (raw) {
        const parsed = JSON.parse(raw) as Conversation[];
        const activeId = appStorage.getActiveChat();
        
        // Ensure the restored active ID actually exists in the parsed chats
        const validActiveId = parsed.some(c => c.id === activeId) ? activeId : null;
        
        set({ 
          conversations: parsed,
          activeConversationId: validActiveId 
        });
      }
    } catch {
      // Corrupted data — start fresh
      set({ conversations: [], activeConversationId: null });
      appStorage.setActiveChat(null);
    }
  },

  createConversation(): string {
    const id = uid();
    const now = Date.now();
    const conversation: Conversation = {
      id,
      title: 'New Chat',
      createdAt: now,
      updatedAt: now,
      messages: [],
    };

    set(s => {
      const conversations = [conversation, ...s.conversations];
      persist(conversations);
      return {
        conversations,
        activeConversationId: id,
      };
    });

    appStorage.setActiveChat(id);
    return id;
  },

  deleteConversation(id: string) {
    set(s => {
      const conversations = s.conversations.filter(c => c.id !== id);
      const isDeletingActive = s.activeConversationId === id;
      const nextActiveId = isDeletingActive ? (conversations[0]?.id || null) : s.activeConversationId;
      
      persist(conversations);
      
      if (isDeletingActive) {
        appStorage.setActiveChat(nextActiveId);
      }

      return {
        conversations,
        activeConversationId: nextActiveId,
      };
    });
  },

  renameConversation(id: string, title: string) {
    set(s => {
      const conversations = s.conversations.map(c =>
        c.id === id ? { ...c, title, updatedAt: Date.now() } : c
      );
      persist(conversations);
      return { conversations };
    });
  },

  setActiveConversation(id: string | null) {
    appStorage.setActiveChat(id);
    set({ activeConversationId: id });
  },

  addMessage(conversationId: string, message: Omit<ConversationMessage, 'id' | 'timestamp'>) {
    const msg: ConversationMessage = {
      ...message,
      id: uid(),
      timestamp: Date.now(),
    };

    set(s => {
      const conversations = s.conversations.map(c => {
        if (c.id !== conversationId) return c;

        const updated = {
          ...c,
          messages: [...c.messages, msg],
          updatedAt: Date.now(),
        };

        // Auto-title from first user message
        if (msg.role === 'user' && c.messages.length === 0) {
          updated.title = generateTitle(msg.content);
        }

        return updated;
      });

      persist(conversations);
      return { conversations };
    });
  },

  updateLastAssistantMessage(conversationId: string, content: string) {
    set(s => {
      const conversations = s.conversations.map(c => {
        if (c.id !== conversationId) return c;

        const messages = [...c.messages];
        const lastIdx = messages.length - 1;
        if (lastIdx >= 0 && messages[lastIdx].role === 'assistant') {
          messages[lastIdx] = { ...messages[lastIdx], content };
        }

        return { ...c, messages, updatedAt: Date.now() };
      });

      // Don't persist every streaming update — too expensive
      return { conversations };
    });
  },

  finalizeLastAssistantMessage(conversationId, metadata) {
    set(s => {
      const conv = s.conversations.find(c => c.id === conversationId);
      if (!conv) return s;

      const newConvs = [...s.conversations];
      const convIndex = newConvs.findIndex(c => c.id === conversationId);
      
      const newMessages = [...conv.messages];
      const lastMsgIndex = newMessages.length - 1;
      
      if (lastMsgIndex >= 0 && newMessages[lastMsgIndex].role === 'assistant') {
        newMessages[lastMsgIndex] = {
          ...newMessages[lastMsgIndex],
          ...metadata
        };
        newConvs[convIndex] = { ...conv, messages: newMessages };
        persist(newConvs);
      }
      
      return { conversations: newConvs };
    });
  },

  truncateConversation(conversationId, fromIndex) {
    set(s => {
      const conv = s.conversations.find(c => c.id === conversationId);
      if (!conv) return s;

      const newConvs = [...s.conversations];
      const convIndex = newConvs.findIndex(c => c.id === conversationId);
      
      const newMessages = conv.messages.slice(0, fromIndex);
      newConvs[convIndex] = { ...conv, messages: newMessages };
      persist(newConvs);
      
      return { conversations: newConvs };
    });
  },

  setRoutingState(phase, provider, confidence) {
    set({
      routingPhase: phase,
      routingProvider: provider,
      routingConfidence: confidence,
    });
  },

  setGeneratingTitleId(id) {
    set({ generatingTitleId: id });
  },

  getActiveConversation() {
    return get().conversations.find(c => c.id === get().activeConversationId) || null;
  },

  getConversation(id: string): Conversation | undefined {
    return get().conversations.find(c => c.id === id);
  },
}));
