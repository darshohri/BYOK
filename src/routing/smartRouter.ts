// ─────────────────────────────────────────────
// BYOK — Smart Router
// ─────────────────────────────────────────────
// Orchestrates signal detection and scoring to select
// the best provider + model for a given prompt.
//
// CRITICAL: This is 100% local. No AI API call is ever
// made for routing. No developer-owned key is used.
// ─────────────────────────────────────────────

import type { ProviderId, RouterResult, ProviderConnection } from '@/providers/types';
import { analyzePrompt } from './signals';
import { calculateScores, normalizeScores, calculateConfidence } from './scoring';

/** Confidence threshold below which the fallback provider is used. */
const CONFIDENCE_THRESHOLD = 0.55;

/** Human-readable task type descriptions for the routing reason. */
const TASK_DESCRIPTIONS: Record<string, string> = {
  coding: 'software development and code generation',
  debugging: 'debugging and error resolution',
  explanation: 'explanation and knowledge sharing',
  quickQuestion: 'quick factual question',
  brainstorming: 'brainstorming and ideation',
  research: 'research and analysis',
  comparison: 'comparison and evaluation',
  writing: 'writing and content creation',
  summarization: 'text summarization',
  longContext: 'long-context processing',
  imageAnalysis: 'image analysis',
  recentEvents: 'recent events and current knowledge',
  general: 'general-purpose task',
};

export interface SmartRouterParams {
  /** The user's prompt text. */
  prompt: string;
  /** Provider connection state — only connected providers are considered. */
  connections: Record<ProviderId, ProviderConnection>;
  /** Fallback provider when confidence is low. */
  fallbackProvider: ProviderId;
}

/**
 * Run the Smart Router to select the best provider for a prompt.
 *
 * Returns null if no providers are connected.
 */
export function routePrompt(params: SmartRouterParams): RouterResult | null {
  const { prompt, connections, fallbackProvider } = params;

  // Determine available providers (connected only)
  const availableProviders = (Object.entries(connections) as [ProviderId, ProviderConnection][])
    .filter(([, conn]) => conn.connected)
    .map(([id]) => id);

  // No providers connected
  if (availableProviders.length === 0) {
    return null;
  }

  // Only one provider connected — use it directly
  if (availableProviders.length === 1) {
    const provider = availableProviders[0];
    const model = connections[provider].selectedModel || '';
    return {
      provider,
      model,
      confidence: 1.0,
      reason: `Only connected provider`,
      scores: { gemini: 0, groq: 0, openrouter: 0, [provider]: 100 },
    };
  }

  // Analyze the prompt
  const analysis = analyzePrompt(prompt);

  // Calculate scores (only for available providers)
  const rawScores = calculateScores(analysis, availableProviders);
  const normalizedScores = normalizeScores(rawScores);
  const confidence = calculateConfidence(rawScores);

  // Find the winning provider
  let selectedProvider: ProviderId = availableProviders[0];
  let highestScore = -Infinity;

  for (const provider of availableProviders) {
    if (rawScores[provider] > highestScore) {
      highestScore = rawScores[provider];
      selectedProvider = provider;
    }
  }

  // Apply fallback logic if confidence is low
  if (confidence < CONFIDENCE_THRESHOLD) {
    if (availableProviders.includes(fallbackProvider)) {
      selectedProvider = fallbackProvider;
    }
    // else keep the highest-scoring connected provider
  }

  const selectedModel = connections[selectedProvider].selectedModel || '';
  const taskDesc = TASK_DESCRIPTIONS[analysis.taskType] || 'general-purpose task';

  return {
    provider: selectedProvider,
    model: selectedModel,
    confidence: Math.round(confidence * 100) / 100,
    reason: `Detected ${taskDesc}`,
    scores: normalizedScores,
  };
}
