// ─────────────────────────────────────────────
// BYOK — Provider Store (Zustand)
// ─────────────────────────────────────────────
// Manages API key connections, model lists, and selected models
// per provider. Keys are stored via the storage abstraction —
// they are NEVER held in this store's state directly.
// ─────────────────────────────────────────────

import { create } from 'zustand';
import type { ProviderId, ProviderConnection, ModelInfo } from '@/providers/types';
import { getProvider, getAllProviderIds } from '@/providers/registry';
import { keyStorage, appStorage, keyManager } from '@/lib/storage';

interface ProviderState {
  /** Connection state per provider. */
  connections: Record<ProviderId, ProviderConnection>;

  /** Whether a provider operation is in progress. */
  loading: Record<ProviderId, boolean>;

  /** Last error per provider. */
  errors: Record<ProviderId, string | null>;

  // ── Actions ───────────────────────────────

  /** Initialize store from persisted storage on app boot. */
  initialize(): Promise<void>;

  /**
   * Connect a provider by validating the key and fetching models.
   * Stores the key via keyStorage, NOT in Zustand state.
   */
  connectProvider(id: ProviderId, key: string): Promise<boolean>;

  /** Disconnect a provider — removes key and resets state. */
  disconnectProvider(id: ProviderId): Promise<void>;

  /** Set the user's selected model for a provider. */
  setSelectedModel(id: ProviderId, modelId: string): void;

  /** Re-fetch available models for a provider. */
  refreshModels(id: ProviderId): Promise<void>;

  /** Test an existing connection (re-validate key). */
  testConnection(id: ProviderId): Promise<boolean>;

  /** Check if at least one provider is connected. */
  hasAnyConnection(): boolean;

  /** Get all currently connected provider IDs. */
  getConnectedProviderIds(): ProviderId[];
}

function createEmptyConnection(): ProviderConnection {
  return {
    connected: false,
    selectedModel: null,
    availableModels: [],
    maskedKey: null,
  };
}

function createInitialConnections(): Record<ProviderId, ProviderConnection> {
  const connections: Record<string, ProviderConnection> = {};
  for (const id of getAllProviderIds()) {
    connections[id] = createEmptyConnection();
  }
  return connections as Record<ProviderId, ProviderConnection>;
}

function createInitialFlags<T>(defaultValue: T): Record<ProviderId, T> {
  const flags: Record<string, T> = {};
  for (const id of getAllProviderIds()) {
    flags[id] = defaultValue;
  }
  return flags as Record<ProviderId, T>;
}

export const useProviderStore = create<ProviderState>((set, get) => ({
  connections: createInitialConnections(),
  loading: createInitialFlags(false),
  errors: createInitialFlags<string | null>(null),

  async initialize() {
    await keyManager.migratePlaintextKeys();
    
    const providerIds = getAllProviderIds();
    const connections = { ...get().connections };

    for (const id of providerIds) {
      const hasKey = await keyStorage.hasKey(id);
      const savedModel = appStorage.getSelectedModel(id);

      if (hasKey) {
        let key = await keyStorage.getKey(id);
        
        if (key) {
          const masked = keyStorage.maskKey(key);
          localStorage.setItem(`_mask_${id}`, masked);
          
          connections[id] = {
            connected: true,
            selectedModel: savedModel,
            availableModels: [],
            maskedKey: masked,
          };
        } else {
          // Key exists in DB but couldn't be read (legacy encrypted format).
          // We can't decrypt it anymore, so we purge it.
          await keyStorage.removeKey(id);
          connections[id] = {
            connected: false,
            selectedModel: null,
            availableModels: [],
            maskedKey: null,
          };
        }
      }
    }

    set({ connections });

    // Fetch models for connected providers in background
    for (const id of providerIds) {
      if (connections[id].connected) {
        get().refreshModels(id);
      }
    }
  },

  async connectProvider(id: ProviderId, key: string): Promise<boolean> {
    set(s => ({
      loading: { ...s.loading, [id]: true },
      errors: { ...s.errors, [id]: null },
    }));

    try {
      const provider = getProvider(id);

      // Validate the key
      const valid = await provider.validateKey(key);
      if (!valid) {
        set(s => ({
          loading: { ...s.loading, [id]: false },
          errors: { ...s.errors, [id]: 'Invalid API key' },
        }));
        return false;
      }

      // Store the key
      await keyStorage.setKey(id, key);

      // Fetch available models
      let models: ModelInfo[] = [];
      try {
        models = await provider.listModels(key);
      } catch {
        // Non-fatal — continue with empty model list
      }

      // Set a default model if none is saved
      const savedModel = appStorage.getSelectedModel(id);
      
      let defaultModelForProvider = models[0]?.id || null;
      if (id === 'gemini') {
        const preferred = models.find(m => m.id.includes('3.8-flash'));
        if (preferred) defaultModelForProvider = preferred.id;
      } else if (id === 'groq') {
        const preferred = models.find(m => m.id === 'openai/gpt-oss-120b');
        if (preferred) defaultModelForProvider = preferred.id;
      } else if (id === 'openrouter') {
        const preferred = models.find(m => m.id === 'nvidia/nemotron-3-nano-omni:free' || m.id === 'nvidia/nemotron-3-nano-omni');
        if (preferred) defaultModelForProvider = preferred.id;
      }

      const selectedModel = savedModel && models.some(m => m.id === savedModel)
        ? savedModel
        : defaultModelForProvider;

      if (selectedModel) {
        appStorage.setSelectedModel(id, selectedModel);
      }

      set(s => ({
        connections: {
          ...s.connections,
          [id]: {
            connected: true,
            selectedModel,
            availableModels: models,
            lastValidated: Date.now(),
            maskedKey: keyStorage.maskKey(key),
          },
        },
        loading: { ...s.loading, [id]: false },
        errors: { ...s.errors, [id]: null },
      }));

      return true;
    } catch (error: any) {
      set(s => ({
        loading: { ...s.loading, [id]: false },
        errors: { ...s.errors, [id]: error.message || 'Connection failed' },
      }));
      return false;
    }
  },

  async disconnectProvider(id: ProviderId) {
    await keyStorage.removeKey(id);
    appStorage.removeSelectedModel(id);

    set(s => ({
      connections: {
        ...s.connections,
        [id]: createEmptyConnection(),
      },
      errors: { ...s.errors, [id]: null },
    }));
  },

  setSelectedModel(id: ProviderId, modelId: string) {
    appStorage.setSelectedModel(id, modelId);

    set(s => ({
      connections: {
        ...s.connections,
        [id]: {
          ...s.connections[id],
          selectedModel: modelId,
        },
      },
    }));
  },

  async refreshModels(id: ProviderId) {
    const key = await keyStorage.getKey(id);
    if (!key) return;

    set(s => ({ loading: { ...s.loading, [id]: true } }));

    try {
      const provider = getProvider(id);
      const models = await provider.listModels(key);

      set(s => {
        const current = s.connections[id];
        // If the currently selected model is no longer available, reset
        const selectedModel =
          current.selectedModel && models.some(m => m.id === current.selectedModel)
            ? current.selectedModel
            : models[0]?.id || null;

        if (selectedModel) {
          appStorage.setSelectedModel(id, selectedModel);
        }

        return {
          connections: {
            ...s.connections,
            [id]: {
              ...current,
              availableModels: models,
              selectedModel,
            },
          },
          loading: { ...s.loading, [id]: false },
        };
      });
    } catch {
      set(s => ({ loading: { ...s.loading, [id]: false } }));
    }
  },

  async testConnection(id: ProviderId): Promise<boolean> {
    const key = await keyStorage.getKey(id);
    if (!key) return false;

    set(s => ({ loading: { ...s.loading, [id]: true } }));

    try {
      const provider = getProvider(id);
      const valid = await provider.validateKey(key);

      set(s => ({
        loading: { ...s.loading, [id]: false },
        connections: {
          ...s.connections,
          [id]: {
            ...s.connections[id],
            connected: valid,
            lastValidated: Date.now(),
          },
        },
        errors: {
          ...s.errors,
          [id]: valid ? null : 'API key is no longer valid',
        },
      }));

      return valid;
    } catch {
      set(s => ({
        loading: { ...s.loading, [id]: false },
        errors: { ...s.errors, [id]: 'Connection test failed' },
      }));
      return false;
    }
  },

  hasAnyConnection(): boolean {
    return Object.values(get().connections).some(c => c.connected);
  },

  getConnectedProviderIds(): ProviderId[] {
    return (Object.entries(get().connections) as [ProviderId, ProviderConnection][])
      .filter(([, c]) => c.connected)
      .map(([id]) => id);
  },
}));
