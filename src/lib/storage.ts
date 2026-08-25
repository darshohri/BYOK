// ─────────────────────────────────────────────
// BYOK — Secure Key Storage Abstraction
// ─────────────────────────────────────────────
// V1 uses localStorage. The interface is designed so the
// underlying implementation can be swapped to IndexedDB,
// Web Crypto, or any other mechanism without changing
// any consumer code.
//
// Rules:
// - Never log full keys
// - Never expose keys in URLs or error messages
// - Never persist keys inside chat history or analytics
// - After initial entry, only show masked representations
// ─────────────────────────────────────────────

const KEY_PREFIX = 'byok_key_';
const CHAT_PREFIX = 'byok_chats';
const SETTINGS_PREFIX = 'byok_settings';
const ANALYTICS_PREFIX = 'byok_analytics';
const MODELS_PREFIX = 'byok_models_';

/**
 * API key storage — thin abstraction over localStorage.
 */
export const keyStorage = {
  /** Retrieve the stored key for a provider. Returns null if not set. */
  getKey(providerId: string): string | null {
    try {
      return localStorage.getItem(`${KEY_PREFIX}${providerId}`);
    } catch {
      return null;
    }
  },

  /** Store an API key for a provider. */
  setKey(providerId: string, key: string): void {
    try {
      localStorage.setItem(`${KEY_PREFIX}${providerId}`, key);
    } catch {
      console.error(`[BYOK] Failed to store key for ${providerId}`);
    }
  },

  /** Remove the stored key for a provider. */
  removeKey(providerId: string): void {
    try {
      localStorage.removeItem(`${KEY_PREFIX}${providerId}`);
    } catch {
      // Silently fail — key may not exist
    }
  },

  /** Check if a key exists for a provider. */
  hasKey(providerId: string): boolean {
    return this.getKey(providerId) !== null;
  },

  /**
   * Return a masked representation of a key.
   * Shows only the last 4 characters.
   * Example: "AIzaSyB..." → "•••••••••yB..."
   */
  maskKey(key: string): string {
    if (!key || key.length <= 4) return '••••';
    const visible = key.slice(-4);
    return `${'•'.repeat(Math.min(key.length - 4, 12))}${visible}`;
  },
};

/**
 * General-purpose local persistence for app state.
 * Keeps chat history, settings, analytics, and model selections
 * separate from API key storage.
 */
export const appStorage = {
  // ── Chat History ──────────────────────────

  getChats(): string | null {
    try {
      return localStorage.getItem(CHAT_PREFIX);
    } catch {
      return null;
    }
  },

  setChats(data: string): void {
    try {
      localStorage.setItem(CHAT_PREFIX, data);
    } catch {
      console.error('[BYOK] Failed to persist chat history');
    }
  },

  getActiveChat(): string | null {
    try {
      return localStorage.getItem(`${CHAT_PREFIX}_active`);
    } catch {
      return null;
    }
  },

  setActiveChat(id: string | null): void {
    try {
      if (id) {
        localStorage.setItem(`${CHAT_PREFIX}_active`, id);
      } else {
        localStorage.removeItem(`${CHAT_PREFIX}_active`);
      }
    } catch {
      console.error('[BYOK] Failed to persist active chat');
    }
  },

  // ── Settings ──────────────────────────────

  getSettings(): string | null {
    try {
      return localStorage.getItem(SETTINGS_PREFIX);
    } catch {
      return null;
    }
  },

  setSettings(data: string): void {
    try {
      localStorage.setItem(SETTINGS_PREFIX, data);
    } catch {
      console.error('[BYOK] Failed to persist settings');
    }
  },

  // ── Analytics ─────────────────────────────

  getAnalytics(): string | null {
    try {
      return localStorage.getItem(ANALYTICS_PREFIX);
    } catch {
      return null;
    }
  },

  setAnalytics(data: string): void {
    try {
      localStorage.setItem(ANALYTICS_PREFIX, data);
    } catch {
      console.error('[BYOK] Failed to persist analytics');
    }
  },

  // ── Model Selections ─────────────────────

  getSelectedModel(providerId: string): string | null {
    try {
      return localStorage.getItem(`${MODELS_PREFIX}${providerId}`);
    } catch {
      return null;
    }
  },

  setSelectedModel(providerId: string, modelId: string): void {
    try {
      localStorage.setItem(`${MODELS_PREFIX}${providerId}`, modelId);
    } catch {
      console.error(`[BYOK] Failed to persist model selection for ${providerId}`);
    }
  },

  removeSelectedModel(providerId: string): void {
    try {
      localStorage.removeItem(`${MODELS_PREFIX}${providerId}`);
    } catch {
      // Silently fail
    }
  },
};
