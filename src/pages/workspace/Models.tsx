// ─────────────────────────────────────────────
// BYOK — Models Page
// ─────────────────────────────────────────────
// Model management per provider.
// OpenRouter models are fetched dynamically.
// ─────────────────────────────────────────────

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, RefreshCw, Check, Loader2, Cpu, ChevronDown, ChevronRight, Image as ImageIcon } from 'lucide-react';
import type { ProviderId, ModelInfo } from '@/providers/types';
import { PROVIDER_META } from '@/providers/registry';
import { useProviderStore } from '@/store/providers';

const PROVIDERS: ProviderId[] = ['gemini', 'groq', 'openrouter'];

export default function ModelsPage() {
  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-16 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl font-semibold text-white mb-1">Models</h1>
        <p className="text-[13px] text-neutral-500 mb-8">
          Select and manage models for each provider.
        </p>

        <div className="space-y-8">
          {PROVIDERS.map((id, i) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <ProviderModelsSection providerId={id} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProviderModelsSection({ providerId }: { providerId: ProviderId }) {
  const connection = useProviderStore(s => s.connections[providerId]);
  const loading = useProviderStore(s => s.loading[providerId]);
  const refreshModels = useProviderStore(s => s.refreshModels);
  const setSelectedModel = useProviderStore(s => s.setSelectedModel);

  const [search, setSearch] = useState('');
  const [isExpanded, setIsExpanded] = useState(!connection.selectedModel);

  const meta = PROVIDER_META[providerId];
  const models = connection.availableModels;

  const sortedModels = [...models].sort((a, b) => a.name.localeCompare(b.name));

  const filteredModels = search
    ? sortedModels.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.id.toLowerCase().includes(search.toLowerCase())
      )
    : sortedModels;

  if (!connection.connected) {
    return (
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <span>{meta.icon}</span>
          <h2 className="text-[14px] font-semibold text-white">{meta.name}</h2>
        </div>
        <p className="text-[13px] text-neutral-500">
          Connect your {meta.name} API key to view available models.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
      {/* Header */}
      <div 
        className="flex items-center justify-between mb-4 cursor-pointer select-none group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight size={16} className="text-neutral-500" />
          </motion.div>
          <span>{meta.icon}</span>
          <h2 className="text-[14px] font-semibold text-white">{meta.name}</h2>
          {!isExpanded && connection.selectedModel && (
            <span className="text-[12px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded ml-2">
              {models.find(m => m.id === connection.selectedModel)?.name || connection.selectedModel}
            </span>
          )}
          <span className="text-[11px] text-neutral-500 ml-2 group-hover:text-neutral-400 transition-colors">
            {models.length} model{models.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            refreshModels(providerId);
          }}
          disabled={loading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-neutral-400 hover:text-neutral-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-md transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          Refresh
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
          {/* Search (for larger model lists like OpenRouter) */}
      {models.length > 8 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search models..."
            className="w-full pl-9 pr-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[12px] text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/[0.12] transition-colors"
          />
        </div>
      )}

      {/* Model list */}
      {models.length === 0 ? (
        <div className="text-center py-6">
          <Cpu size={20} className="mx-auto text-neutral-700 mb-2" />
          <p className="text-[12px] text-neutral-500">
            {loading ? 'Loading models...' : 'No models available. Try refreshing.'}
          </p>
        </div>
      ) : (
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {filteredModels.map(model => (
            <ModelRow
              key={model.id}
              model={model}
              isSelected={connection.selectedModel === model.id}
              onSelect={() => {
                setSelectedModel(providerId, model.id);
                setIsExpanded(false);
              }}
            />
          ))}
          {filteredModels.length === 0 && search && (
            <p className="text-[12px] text-neutral-500 text-center py-4">
              No models matching "{search}"
            </p>
          )}
        </div>
      )}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}

function ModelRow({
  model,
  isSelected,
  onSelect,
}: {
  model: ModelInfo;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
        isSelected
          ? 'bg-purple-500/[0.08] border border-purple-500/[0.15]'
          : 'hover:bg-white/[0.03] border border-transparent'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-[13px] font-medium truncate ${
            isSelected ? 'text-white' : 'text-neutral-300'
          }`}>
            {model.name}
          </p>
          {model.capabilities.includes('vision') && (
            <span title="Vision Capable" className="flex items-center shrink-0">
              <ImageIcon size={12} className="text-blue-400" />
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-neutral-600 font-mono truncate">
            {model.id}
          </span>
          {model.contextLength > 0 && (
            <span className="text-[10px] text-neutral-600 shrink-0">
              {formatContext(model.contextLength)}
            </span>
          )}
        </div>
      </div>

      {isSelected && (
        <Check size={14} className="text-purple-400 shrink-0" />
      )}
    </button>
  );
}

function formatContext(tokens: number): string {
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M ctx`;
  if (tokens >= 1000) return `${Math.round(tokens / 1000)}K ctx`;
  return `${tokens} ctx`;
}
