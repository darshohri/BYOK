import { useUserStore } from '@/store/user';

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

const getUserId = () => {
  // If the store is not fully initialized, we fallback to 'anon'
  return useUserStore.getState().user?.id || 'anon';
};

const getKey = (base: string) => `${base}_${getUserId()}`;

const KEY_PREFIX = 'byok_key_';
const CHAT_PREFIX = 'byok_chats';
const SETTINGS_PREFIX = 'byok_settings';
const ANALYTICS_PREFIX = 'byok_analytics';
const MODELS_PREFIX = 'byok_models_';

// ── WebCrypto & IndexedDB Encrypted Storage ────────────────

const getDBName = () => `byok_secure_db_${getUserId()}`;
const DB_VERSION = 3; // Upgraded for ledger and chats
const STORE_NAME = 'encrypted_keys';
const LEDGER_STORE_NAME = 'override_ledger';
const CHATS_STORE_NAME = 'chats_store';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(getDBName(), DB_VERSION);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      if (!db.objectStoreNames.contains(LEDGER_STORE_NAME)) {
        const ledgerStore = db.createObjectStore(LEDGER_STORE_NAME, { keyPath: 'id', autoIncrement: true });
        ledgerStore.createIndex('category', 'category', { unique: false });
        ledgerStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      if (!db.objectStoreNames.contains(CHATS_STORE_NAME)) {
        db.createObjectStore(CHATS_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ... skipping unchanged lines, we will modify appStorage ...

function setInDB(key: string, value: any): Promise<void> {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  });
}

function getFromDB(key: string): Promise<any> {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  });
}

function deleteFromDB(key: string): Promise<void> {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  });
}

function clearDB(): Promise<void> {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  });
}

// ── Passphrase Hash Storage ─────────────────────────────────
// The passphrase is NOT used to encrypt/decrypt keys.
// It is stored as a SHA-256 hash and is ONLY used to confirm
// identity before a destructive action (removing a key).
// Keys are stored as plain strings in IndexedDB — always accessible.

const PASSPHRASE_HASH_KEY = 'byok_passphrase_hash';

async function hashPassphrase(passphrase: string): Promise<string> {
  const enc = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-256', enc.encode(passphrase));
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export const keyManager = {
  /** Returns true if a passphrase has been set. */
  hasPassphrase(): boolean {
    return !!localStorage.getItem(PASSPHRASE_HASH_KEY);
  },

  /** Sets a new passphrase (stores hash only). */
  async setPassphrase(passphrase: string): Promise<void> {
    const hash = await hashPassphrase(passphrase);
    localStorage.setItem(PASSPHRASE_HASH_KEY, hash);
  },

  /** Verifies a passphrase against the stored hash. Returns true if correct. */
  async verifyPassphrase(passphrase: string): Promise<boolean> {
    const stored = localStorage.getItem(PASSPHRASE_HASH_KEY);
    if (!stored) return false;
    const hash = await hashPassphrase(passphrase);
    return hash === stored;
  },

  /** Wipes all stored keys and the passphrase hash. */
  async resetAll(): Promise<void> {
    await clearDB();
    localStorage.removeItem(PASSPHRASE_HASH_KEY);
  },

  // ── Legacy compat stubs (safe no-ops, kept so other files compile) ──
  isUnlocked(): boolean { return true; },
  async hasAnyEncryptedKeys(): Promise<boolean> { return false; },
  hasPlaintextKeys(): boolean { return false; },
  
  /** Migrates old plaintext keys from localStorage to IndexedDB if any exist. */
  async migratePlaintextKeys(): Promise<void> {
    const providers = ['gemini', 'groq', 'openrouter'];
    for (const p of providers) {
      const lsKey = getKey(`${KEY_PREFIX}${p}`);
      const plain = localStorage.getItem(lsKey);
      if (plain) {
        await keyStorage.setKey(p, plain);
        localStorage.removeItem(lsKey);
      }
    }
  },
};

/**
 * API key storage — plain-string storage in IndexedDB.
 * Keys are NEVER stored in localStorage, URLs, or chat history.
 * No encryption is applied — the browser's same-origin IndexedDB
 * provides sufficient isolation for a BYOK client-side app.
 */
export const keyStorage = {
  /** Retrieve the stored API key for a provider. Always accessible — no passphrase required. */
  async getKey(providerId: string): Promise<string | null> {
    try {
      const dbKey = getKey(`${KEY_PREFIX}${providerId}`);
      const value = await getFromDB(dbKey);
      if (!value) return null;
      // Handle both legacy encrypted format {iv, cipher} and new plain string
      if (typeof value === 'string') return value;
      // Legacy: if it's an encrypted object, we can't decrypt it without the session key.
      // Return null — the user will need to re-enter the key.
      if (typeof value === 'object' && 'iv' in value && 'cipher' in value) return null;
      return null;
    } catch {
      return null;
    }
  },

  /** Store an API key for a provider as a plain string in IndexedDB. */
  async setKey(providerId: string, key: string): Promise<void> {
    try {
      const dbKey = getKey(`${KEY_PREFIX}${providerId}`);
      await setInDB(dbKey, key);
      localStorage.setItem(`_mask_${providerId}`, this.maskKey(key));
    } catch {
      console.error(`[BYOK] Failed to store key for ${providerId}`);
    }
  },

  /** Remove the stored key for a provider. */
  async removeKey(providerId: string): Promise<void> {
    try {
      await deleteFromDB(getKey(`${KEY_PREFIX}${providerId}`));
      localStorage.removeItem(`_mask_${providerId}`);
    } catch {
      // Silently fail
    }
  },

  /** Check if a key exists for a provider (regardless of its format). */
  async hasKey(providerId: string): Promise<boolean> {
    try {
      const val = await getFromDB(getKey(`${KEY_PREFIX}${providerId}`));
      return val !== undefined && val !== null;
    } catch {
      return false;
    }
  },

  /** Return a masked representation of a key (shows first 4 + last 4 chars). */
  maskKey(key: string): string {
    if (!key || key.length <= 8) return '••••••••';
    const first = key.slice(0, 4);
    const last = key.slice(-4);
    return `${first}${'•'.repeat(Math.min(key.length - 8, 12))}${last}`;
  },
};

export interface OverrideEvent {
  id?: number;
  category: string;
  originalPick: string;
  manualPick: string;
  timestamp: number;
}

export const ledgerStorage = {
  async recordOverride(category: string, originalPick: string, manualPick: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(LEDGER_STORE_NAME, 'readwrite');
      const store = tx.objectStore(LEDGER_STORE_NAME);
      
      store.add({ category, originalPick, manualPick, timestamp: Date.now() });

      const index = store.index('category');
      const req = index.getAll(category);
      
      req.onsuccess = () => {
        const events = req.result as OverrideEvent[];
        if (events.length > 200) {
          events.sort((a, b) => a.timestamp - b.timestamp);
          const toDelete = events.slice(0, events.length - 200);
          for (const ev of toDelete) {
            store.delete(ev.id!);
          }
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async getBias(category: string, availableProviders: string[]): Promise<Record<string, number>> {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(LEDGER_STORE_NAME, 'readonly');
      const store = tx.objectStore(LEDGER_STORE_NAME);
      const index = store.index('category');
      const req = index.getAll(category);
      
      req.onsuccess = () => {
        const events = req.result as OverrideEvent[];
        const validEvents = events.filter(e => availableProviders.includes(e.manualPick));
        
        // Cold start threshold
        if (validEvents.length < 15) {
          return resolve({});
        }

        const counts: Record<string, number> = {};
        for (const p of availableProviders) { counts[p] = 0; }
        
        for (const e of validEvents) {
          counts[e.manualPick]++;
        }

        const total = validEvents.length;
        const biases: Record<string, number> = {};
        
        for (const p of availableProviders) {
          const ratio = counts[p] / total;
          if (ratio > 0.6) {
            biases[p] = 50; 
          } else if (ratio > 0.4) {
            biases[p] = 20;
          }
        }
        
        resolve(biases);
      };
      
      req.onerror = () => resolve({});
    });
  },

  async resetLedger(): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(LEDGER_STORE_NAME, 'readwrite');
      const store = tx.objectStore(LEDGER_STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },
  
  async getAllEvents(): Promise<OverrideEvent[]> {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(LEDGER_STORE_NAME, 'readonly');
      const store = tx.objectStore(LEDGER_STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve([]);
    });
  }
};


/**
 * General-purpose local persistence for app state.
 * Keeps chat history, settings, analytics, and model selections
 * separate from API key storage.
 */
export const appStorage = {
  // ── Chat History ──────────────────────────

  async migrateChats(): Promise<void> {
    const lsKey = getKey(CHAT_PREFIX);
    const lsChats = localStorage.getItem(lsKey);
    if (lsChats) {
      try {
        await this.setChats(lsChats);
        // Verify it was successfully written before deleting
        const verified = await this.getChats();
        if (verified === lsChats) {
          localStorage.removeItem(lsKey);
          console.log('[BYOK] Successfully migrated chats to IndexedDB');
        } else {
          console.error('[BYOK] Chat migration verification failed (mismatch)');
        }
      } catch (err) {
        console.error('[BYOK] Chat migration failed', err);
      }
    }
  },

  async getChats(): Promise<string | null> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(CHATS_STORE_NAME, 'readonly');
        const store = tx.objectStore(CHATS_STORE_NAME);
        const req = store.get('chats');
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return null;
    }
  },

  async setChats(data: string): Promise<void> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(CHATS_STORE_NAME, 'readwrite');
        const store = tx.objectStore(CHATS_STORE_NAME);
        const req = store.put(data, 'chats');
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      console.error('[BYOK] Failed to persist chat history');
    }
  },

  getActiveChat(): string | null {
    try {
      return localStorage.getItem(getKey(`${CHAT_PREFIX}_active`));
    } catch {
      return null;
    }
  },

  setActiveChat(id: string | null): void {
    try {
      if (id) {
        localStorage.setItem(getKey(`${CHAT_PREFIX}_active`), id);
      } else {
        localStorage.removeItem(getKey(`${CHAT_PREFIX}_active`));
      }
    } catch {
      console.error('[BYOK] Failed to persist active chat');
    }
  },

  // ── Settings ──────────────────────────────

  getSettings(): string | null {
    try {
      return localStorage.getItem(getKey(SETTINGS_PREFIX));
    } catch {
      return null;
    }
  },

  setSettings(data: string): void {
    try {
      localStorage.setItem(getKey(SETTINGS_PREFIX), data);
    } catch {
      console.error('[BYOK] Failed to persist settings');
    }
  },

  // ── Analytics ─────────────────────────────

  getAnalytics(): string | null {
    try {
      return localStorage.getItem(getKey(ANALYTICS_PREFIX));
    } catch {
      return null;
    }
  },

  setAnalytics(data: string): void {
    try {
      localStorage.setItem(getKey(ANALYTICS_PREFIX), data);
    } catch {
      console.error('[BYOK] Failed to persist analytics');
    }
  },

  // ── Model Selections ─────────────────────

  getSelectedModel(providerId: string): string | null {
    try {
      return localStorage.getItem(getKey(`${MODELS_PREFIX}${providerId}`));
    } catch {
      return null;
    }
  },

  setSelectedModel(providerId: string, modelId: string): void {
    try {
      localStorage.setItem(getKey(`${MODELS_PREFIX}${providerId}`), modelId);
    } catch {
      console.error(`[BYOK] Failed to persist model selection for ${providerId}`);
    }
  },

  removeSelectedModel(providerId: string): void {
    try {
      localStorage.removeItem(getKey(`${MODELS_PREFIX}${providerId}`));
    } catch {
      // Silently fail
    }
  },
};

