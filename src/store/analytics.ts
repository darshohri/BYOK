// ─────────────────────────────────────────────
// BYOK — Analytics Store (Zustand)
// ─────────────────────────────────────────────
// Tracks local usage statistics. All data is stored locally.
// Never pretends to be billing data.
// Values are labeled accurately based on what providers return.
// ─────────────────────────────────────────────

import { create } from 'zustand';
import type { ProviderId } from '@/providers/types';
import { appStorage } from '@/lib/storage';

interface AnalyticsData {
  /** Total messages sent. */
  totalMessages: number;

  /** Requests broken down by provider. */
  requestsByProvider: Record<ProviderId, number>;

  /** Requests broken down by model ID. */
  requestsByModel: Record<string, number>;

  /** Cumulative latency in ms (for computing average). */
  totalLatencyMs: number;

  /** Number of requests with latency data (for computing average). */
  latencyCount: number;

  /** Estimated total tokens (only from providers that return usage). */
  estimatedTokens: number;

  /** Smart Mode selection counts per provider. */
  smartModeSelections: Record<ProviderId, number>;
}

interface AnalyticsState extends AnalyticsData {
  // ── Actions ───────────────────────────────

  initialize(): void;

  /** Record a completed request. */
  recordRequest(params: {
    provider: ProviderId;
    model: string;
    latencyMs: number;
    tokens?: number;
    wasSmartMode: boolean;
  }): void;

  /** Get average latency in ms. */
  getAverageLatency(): number;

  /** Get provider distribution as percentages. */
  getProviderDistribution(): Record<ProviderId, number>;

  /** Reset all analytics. */
  reset(): void;
}

const EMPTY_PROVIDER_COUNTS: Record<ProviderId, number> = {
  gemini: 0,
  groq: 0,
  openrouter: 0,
};

function persist(data: AnalyticsData) {
  try {
    appStorage.setAnalytics(JSON.stringify(data));
  } catch {
    // Fail silently
  }
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  totalMessages: 0,
  requestsByProvider: { ...EMPTY_PROVIDER_COUNTS },
  requestsByModel: {},
  totalLatencyMs: 0,
  latencyCount: 0,
  estimatedTokens: 0,
  smartModeSelections: { ...EMPTY_PROVIDER_COUNTS },

  initialize() {
    try {
      const raw = appStorage.getAnalytics();
      if (raw) {
        const parsed = JSON.parse(raw) as AnalyticsData;
        set({
          totalMessages: parsed.totalMessages || 0,
          requestsByProvider: { ...EMPTY_PROVIDER_COUNTS, ...parsed.requestsByProvider },
          requestsByModel: parsed.requestsByModel || {},
          totalLatencyMs: parsed.totalLatencyMs || 0,
          latencyCount: parsed.latencyCount || 0,
          estimatedTokens: parsed.estimatedTokens || 0,
          smartModeSelections: { ...EMPTY_PROVIDER_COUNTS, ...parsed.smartModeSelections },
        });
      }
    } catch {
      // Use defaults
    }
  },

  recordRequest({ provider, model, latencyMs, tokens, wasSmartMode }) {
    set(s => {
      const updated: AnalyticsData = {
        totalMessages: s.totalMessages + 1,
        requestsByProvider: {
          ...s.requestsByProvider,
          [provider]: (s.requestsByProvider[provider] || 0) + 1,
        },
        requestsByModel: {
          ...s.requestsByModel,
          [model]: (s.requestsByModel[model] || 0) + 1,
        },
        totalLatencyMs: s.totalLatencyMs + latencyMs,
        latencyCount: s.latencyCount + 1,
        estimatedTokens: s.estimatedTokens + (tokens || 0),
        smartModeSelections: wasSmartMode
          ? {
              ...s.smartModeSelections,
              [provider]: (s.smartModeSelections[provider] || 0) + 1,
            }
          : s.smartModeSelections,
      };

      persist(updated);
      return updated;
    });
  },

  getAverageLatency(): number {
    const { totalLatencyMs, latencyCount } = get();
    if (latencyCount === 0) return 0;
    return Math.round(totalLatencyMs / latencyCount);
  },

  getProviderDistribution(): Record<ProviderId, number> {
    const { requestsByProvider, totalMessages } = get();
    if (totalMessages === 0) {
      return { gemini: 0, groq: 0, openrouter: 0 };
    }
    return {
      gemini: Math.round(((requestsByProvider.gemini || 0) / totalMessages) * 100),
      groq: Math.round(((requestsByProvider.groq || 0) / totalMessages) * 100),
      openrouter: Math.round(((requestsByProvider.openrouter || 0) / totalMessages) * 100),
    };
  },

  reset() {
    const empty: AnalyticsData = {
      totalMessages: 0,
      requestsByProvider: { ...EMPTY_PROVIDER_COUNTS },
      requestsByModel: {},
      totalLatencyMs: 0,
      latencyCount: 0,
      estimatedTokens: 0,
      smartModeSelections: { ...EMPTY_PROVIDER_COUNTS },
    };
    persist(empty);
    set(empty);
  },
}));
