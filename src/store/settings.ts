// ─────────────────────────────────────────────
// BYOK — Settings Store (Zustand)
// ─────────────────────────────────────────────
// User preferences: routing mode, fallback provider, UI prefs.
// Persisted to localStorage.
// ─────────────────────────────────────────────

import { create } from 'zustand';
import type { ProviderId, RoutingMode } from '@/providers/types';
import { appStorage } from '@/lib/storage';

interface SettingsState {
  /** Current routing mode. Default: 'smart'. */
  mode: RoutingMode;

  /** Fallback provider when Smart Mode confidence is low. Default: 'gemini'. */
  fallbackProvider: ProviderId;

  /** Whether to show routing animation. */
  showRoutingAnimation: boolean;

  /** Whether the sidebar is collapsed (tablet/mobile). */
  sidebarCollapsed: boolean;

  // ── Actions ───────────────────────────────

  initialize(): void;
  setMode(mode: RoutingMode): void;
  setFallbackProvider(provider: ProviderId): void;
  setShowRoutingAnimation(show: boolean): void;
  setSidebarCollapsed(collapsed: boolean): void;
}

function persistSettings(state: Partial<SettingsState>) {
  try {
    const current = JSON.parse(appStorage.getSettings() || '{}');
    appStorage.setSettings(JSON.stringify({ ...current, ...state }));
  } catch {
    // Fail silently
  }
}

export const useSettingsStore = create<SettingsState>((set) => ({
  mode: 'smart',
  fallbackProvider: 'gemini',
  showRoutingAnimation: true,
  sidebarCollapsed: false,

  initialize() {
    try {
      const raw = appStorage.getSettings();
      if (raw) {
        const parsed = JSON.parse(raw);
        set({
          mode: parsed.mode || 'smart',
          fallbackProvider: parsed.fallbackProvider || 'gemini',
          showRoutingAnimation: parsed.showRoutingAnimation ?? true,
          sidebarCollapsed: parsed.sidebarCollapsed ?? false,
        });
      }
    } catch {
      // Use defaults
    }
  },

  setMode(mode: RoutingMode) {
    set({ mode });
    persistSettings({ mode });
  },

  setFallbackProvider(provider: ProviderId) {
    set({ fallbackProvider: provider });
    persistSettings({ fallbackProvider: provider });
  },

  setShowRoutingAnimation(show: boolean) {
    set({ showRoutingAnimation: show });
    persistSettings({ showRoutingAnimation: show });
  },

  setSidebarCollapsed(collapsed: boolean) {
    set({ sidebarCollapsed: collapsed });
    persistSettings({ sidebarCollapsed: collapsed });
  },
}));
