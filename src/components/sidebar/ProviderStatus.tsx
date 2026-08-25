// ─────────────────────────────────────────────
// BYOK — Provider Status Indicator
// ─────────────────────────────────────────────

import React from 'react';
import type { ProviderId } from '@/providers/types';
import { PROVIDER_META } from '@/providers/registry';
import { useProviderStore } from '@/store/providers';
import { useChatStore } from '@/store/chat';

interface ProviderStatusProps {
  providerId: ProviderId;
}

export default function ProviderStatus({ providerId }: ProviderStatusProps) {
  const connection = useProviderStore(s => s.connections[providerId]);
  const meta = PROVIDER_META[providerId];

  return (
    <div className="group flex items-center justify-between px-3 py-2 rounded-lg transition-colors hover:bg-white/[0.04] cursor-default">
      <div className="flex items-center gap-2.5">
        <div className="w-5 flex items-center justify-center text-base" style={{ opacity: connection.connected ? 1 : 0.4 }}>
          {meta.icon}
        </div>
        <span className={`text-[15px] font-medium transition-colors ${
          connection.connected ? 'text-neutral-200' : 'text-neutral-500'
        }`}>
          {meta.name}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <div
          className={`w-1.5 h-1.5 rounded-full transition-colors ${
            connection.connected
              ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]'
              : 'bg-neutral-600'
          }`}
        />
        <span className={`text-[12px] transition-colors ${
          connection.connected ? 'text-emerald-400/70' : 'text-neutral-600'
        }`}>
          {connection.connected ? 'Connected' : 'Not connected'}
        </span>
      </div>
    </div>
  );
}
