// ─────────────────────────────────────────────
// BYOK — Workspace Layout
// ─────────────────────────────────────────────
// Shell layout: Sidebar + main content area.
// Initializes all stores on mount.
// Child routes render inside the main area.
// ─────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/sidebar/Sidebar';
import { useProviderStore } from '@/store/providers';
import { useChatStore } from '@/store/chat';
import { useSettingsStore } from '@/store/settings';
import { useAnalyticsStore } from '@/store/analytics';
import { keyManager } from '@/lib/storage';

export default function Workspace() {

  const initProviders = useProviderStore(s => s.initialize);
  const initChat = useChatStore(s => s.initialize);
  const initSettings = useSettingsStore(s => s.initialize);
  const initAnalytics = useAnalyticsStore(s => s.initialize);
  const setSidebarCollapsed = useSettingsStore(s => s.setSidebarCollapsed);

  useEffect(() => {
    // Always initialize stores regardless of unlock state,
    // they don't decrypt keys on mount, only flag them as connected
    initProviders();
    initChat();
    initSettings();
    initAnalytics();
  }, []);

  return (
    <div className="h-screen flex bg-[#0A0A0A] text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center h-12 px-4 border-b border-white/[0.06] bg-[#0A0A0A] shrink-0">
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="p-1.5 text-neutral-400 hover:text-white transition-colors"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <span className="ml-3 text-[14px] font-semibold text-white">BYOK</span>
        </div>

        {/* Page content — rendered by nested routes */}
        <Outlet />
      </div>
    </div>
  );
}
