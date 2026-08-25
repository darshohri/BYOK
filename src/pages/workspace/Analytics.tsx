// ─────────────────────────────────────────────
// BYOK — Analytics Page
// ─────────────────────────────────────────────
// Local usage statistics. All data stored locally.
// Never pretends to be billing data.
// ─────────────────────────────────────────────

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Zap, Clock, Hash, RotateCcw } from 'lucide-react';
import { useAnalyticsStore } from '@/store/analytics';
import { PROVIDER_META } from '@/providers/registry';
import type { ProviderId } from '@/providers/types';

export default function AnalyticsPage() {
  const analytics = useAnalyticsStore();
  const distribution = analytics.getProviderDistribution();
  const avgLatency = analytics.getAverageLatency();

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-16 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-white mb-1">Analytics</h1>
            <p className="text-[13px] text-neutral-500">Local usage statistics</p>
          </div>
          <button
            onClick={() => analytics.reset()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-neutral-500 hover:text-neutral-300 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-lg transition-all"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard
            icon={Hash}
            label="Messages"
            value={analytics.totalMessages.toString()}
            delay={0}
          />
          <StatCard
            icon={Clock}
            label="Avg Latency"
            value={avgLatency ? `${(avgLatency / 1000).toFixed(2)}s` : '—'}
            delay={0.05}
          />
          <StatCard
            icon={Zap}
            label="Est. Tokens"
            value={analytics.estimatedTokens > 0 ? formatNumber(analytics.estimatedTokens) : '—'}
            delay={0.1}
            sublabel={analytics.estimatedTokens > 0 ? undefined : 'Varies by provider'}
          />
          <StatCard
            icon={BarChart3}
            label="Smart Picks"
            value={Object.values(analytics.smartModeSelections).reduce((a, b) => a + b, 0).toString()}
            delay={0.15}
          />
        </div>

        {/* Provider distribution */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 mb-6"
        >
          <h2 className="text-[14px] font-semibold text-white mb-4">Provider Distribution</h2>

          {analytics.totalMessages === 0 ? (
            <p className="text-[13px] text-neutral-600 py-4 text-center">
              No data yet. Start chatting to see your usage.
            </p>
          ) : (
            <div className="space-y-3">
              {(['gemini', 'groq', 'openrouter'] as ProviderId[]).map(id => (
                <ProviderBar
                  key={id}
                  providerId={id}
                  percentage={distribution[id]}
                  count={analytics.requestsByProvider[id] || 0}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Smart Mode selections */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5"
        >
          <h2 className="text-[14px] font-semibold text-white mb-4">Smart Mode Selections</h2>

          {Object.values(analytics.smartModeSelections).every(v => v === 0) ? (
            <p className="text-[13px] text-neutral-600 py-4 text-center">
              No Smart Mode usage yet.
            </p>
          ) : (
            <div className="space-y-3">
              {(['gemini', 'groq', 'openrouter'] as ProviderId[]).map(id => {
                const total = Object.values(analytics.smartModeSelections).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? Math.round((analytics.smartModeSelections[id] / total) * 100) : 0;
                return (
                  <ProviderBar
                    key={id}
                    providerId={id}
                    percentage={pct}
                    count={analytics.smartModeSelections[id]}
                  />
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  delay,
  sublabel,
}: {
  icon: any;
  label: string;
  value: string;
  delay: number;
  sublabel?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4"
    >
      <Icon size={16} className="text-neutral-500 mb-2" />
      <p className="text-xl font-semibold text-white mb-0.5">{value}</p>
      <p className="text-[11px] text-neutral-500">{label}</p>
      {sublabel && <p className="text-[10px] text-neutral-600 mt-0.5">{sublabel}</p>}
    </motion.div>
  );
}

function ProviderBar({
  providerId,
  percentage,
  count,
}: {
  providerId: ProviderId;
  percentage: number;
  count: number;
}) {
  const meta = PROVIDER_META[providerId];
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[12px]">{meta.icon}</span>
          <span className="text-[13px] text-neutral-300">{meta.name}</span>
        </div>
        <span className="text-[12px] text-neutral-500">
          {count} ({percentage}%)
        </span>
      </div>
      <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: meta.color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}
