// ─────────────────────────────────────────────
// BYOK — Score-Based Routing Engine
// ─────────────────────────────────────────────
// Configurable weighted scoring system.
// NOT a giant if/else chain. Each rule is independent and composable.
// Scores are accumulated across all matching rules.
// ─────────────────────────────────────────────

import type { ProviderId } from '@/providers/types';
import type { PromptAnalysis, ScoringRule } from './types';

/**
 * Default scoring rules for V1.
 * These are starting values — designed to be configurable and extensible.
 *
 * Philosophy:
 * - Gemini: Best for coding, long context, multimodal, complex reasoning
 * - Groq: Best for speed, short questions, simple tasks
 * - OpenRouter: Best for research, diverse model access, complex reasoning
 */
export const DEFAULT_SCORING_RULES: ScoringRule[] = [
  // ── Coding & Development ────────────────
  {
    name: 'coding_detected',
    condition: (a) => a.taskType === 'coding',
    scores: { gemini: 40, groq: 10, openrouter: 15 },
  },
  {
    name: 'debugging_detected',
    condition: (a) => a.taskType === 'debugging',
    scores: { gemini: 35, groq: 10, openrouter: 20 },
  },
  {
    name: 'code_fences_present',
    condition: (a) => a.characteristics.hasCodeFences,
    scores: { gemini: 15, groq: 5, openrouter: 10 },
  },

  // ── Context & Complexity ────────────────
  {
    name: 'long_context',
    condition: (a) => a.characteristics.length > 2000 || a.characteristics.wordCount > 300,
    scores: { gemini: 25, groq: -10, openrouter: 15 },
  },
  {
    name: 'very_long_context',
    condition: (a) => a.characteristics.length > 5000,
    scores: { gemini: 20, groq: -20, openrouter: 10 },
  },
  {
    name: 'multi_part_instructions',
    condition: (a) => a.characteristics.isMultiPart,
    scores: { gemini: 15, groq: 5, openrouter: 10 },
  },

  // ── Speed & Simplicity ─────────────────
  {
    name: 'short_simple_question',
    condition: (a) => a.taskType === 'quickQuestion',
    scores: { gemini: 10, groq: 40, openrouter: 10 },
  },
  {
    name: 'short_prompt',
    condition: (a) =>
      a.characteristics.length <= 100 && a.characteristics.wordCount <= 20,
    scores: { gemini: 5, groq: 30, openrouter: 5 },
  },
  {
    name: 'speed_oriented',
    condition: (a) =>
      a.taskType === 'quickQuestion' ||
      (a.characteristics.wordCount < 15 && !a.characteristics.hasCodeFences),
    scores: { gemini: 0, groq: 25, openrouter: 0 },
  },

  // ── Research & Analysis ─────────────────
  {
    name: 'research_comparison',
    condition: (a) => a.taskType === 'research' || a.taskType === 'comparison',
    scores: { gemini: 15, groq: 5, openrouter: 30 },
  },
  {
    name: 'complex_reasoning',
    condition: (a) =>
      a.characteristics.isMultiPart &&
      a.characteristics.wordCount > 50 &&
      (a.characteristics.hasResearchTerms || a.taskType === 'explanation'),
    scores: { gemini: 20, groq: 0, openrouter: 25 },
  },

  // ── Writing & Creative ─────────────────
  {
    name: 'writing_task',
    condition: (a) => a.taskType === 'writing',
    scores: { gemini: 15, groq: 10, openrouter: 20 },
  },
  {
    name: 'brainstorming',
    condition: (a) => a.taskType === 'brainstorming',
    scores: { gemini: 15, groq: 15, openrouter: 20 },
  },

  // ── Summarization ──────────────────────
  {
    name: 'summarization',
    condition: (a) => a.taskType === 'summarization',
    scores: { gemini: 20, groq: 15, openrouter: 15 },
  },

  // ── Explanation ────────────────────────
  {
    name: 'explanation',
    condition: (a) => a.taskType === 'explanation',
    scores: { gemini: 20, groq: 15, openrouter: 15 },
  },

  // ── Recent Events & Current Knowledge ──
  {
    name: 'recent_events',
    condition: (a) => a.characteristics.needsRecentKnowledge,
    scores: { gemini: 40, groq: -30, openrouter: 10 },
  },
  {
    name: 'recent_events_task',
    condition: (a) => a.taskType === 'recentEvents',
    scores: { gemini: 20, groq: -20, openrouter: 5 },
  },

  // ── Deep Reasoning & Math ──────────────
  {
    name: 'deep_reasoning',
    condition: (a) => a.characteristics.needsDeepReasoning,
    scores: { gemini: 30, groq: -15, openrouter: 20 },
  },

  // ── General fallback ──────────────────
  {
    name: 'general_task',
    condition: (a) => a.taskType === 'general',
    scores: { gemini: 15, groq: 15, openrouter: 10 },
  },
];

/**
 * Calculate raw scores for all providers given a prompt analysis.
 * Only considers the specified available providers.
 */
export function calculateScores(
  analysis: PromptAnalysis,
  availableProviders: ProviderId[],
  rules: ScoringRule[] = DEFAULT_SCORING_RULES
): Record<ProviderId, number> {
  const scores: Record<ProviderId, number> = {
    gemini: 0,
    groq: 0,
    openrouter: 0,
  };

  for (const rule of rules) {
    if (rule.condition(analysis)) {
      for (const [provider, score] of Object.entries(rule.scores)) {
        if (availableProviders.includes(provider as ProviderId)) {
          scores[provider as ProviderId] += score || 0;
        }
      }
    }
  }

  // Zero out unavailable providers
  for (const provider of Object.keys(scores) as ProviderId[]) {
    if (!availableProviders.includes(provider)) {
      scores[provider] = 0;
    }
  }

  return scores;
}

/**
 * Normalize scores to 0–100 range for confidence calculation.
 */
export function normalizeScores(
  scores: Record<ProviderId, number>
): Record<ProviderId, number> {
  const maxScore = Math.max(...Object.values(scores), 1);
  const normalized: Record<ProviderId, number> = { gemini: 0, groq: 0, openrouter: 0 };

  for (const [provider, score] of Object.entries(scores)) {
    normalized[provider as ProviderId] = Math.round((Math.max(score, 0) / maxScore) * 100);
  }

  return normalized;
}

/**
 * Calculate confidence based on score distribution.
 * Higher confidence when one provider clearly dominates.
 */
export function calculateConfidence(scores: Record<ProviderId, number>): number {
  const values = Object.values(scores).filter(v => v > 0);
  if (values.length === 0) return 0;
  if (values.length === 1) return 0.95;

  const sorted = [...values].sort((a, b) => b - a);
  const top = sorted[0];
  const second = sorted[1] || 0;

  if (top === 0) return 0;

  // Confidence is based on how much the top score dominates
  const gap = (top - second) / top;
  return Math.min(0.5 + gap * 0.5, 0.99);
}
