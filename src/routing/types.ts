// ─────────────────────────────────────────────
// BYOK — Routing Type Definitions
// ─────────────────────────────────────────────

import type { ProviderId } from '@/providers/types';

/** A detected signal from prompt analysis. */
export interface RoutingSignal {
  /** Human-readable name of the signal. */
  name: string;
  /** Whether this signal was detected. */
  detected: boolean;
  /** Strength / weight of this signal (0–1). */
  strength: number;
}

/** Complete analysis of a prompt. */
export interface PromptAnalysis {
  /** Detected task type. */
  taskType: TaskType;
  /** Individual signals detected in the prompt. */
  signals: RoutingSignal[];
  /** Raw prompt characteristics. */
  characteristics: PromptCharacteristics;
}

/** High-level task type detected from the prompt. */
export type TaskType =
  | 'coding'
  | 'debugging'
  | 'explanation'
  | 'quickQuestion'
  | 'brainstorming'
  | 'research'
  | 'comparison'
  | 'writing'
  | 'summarization'
  | 'longContext'
  | 'imageAnalysis'
  | 'recentEvents'
  | 'general';

/** Measured characteristics of the prompt. */
export interface PromptCharacteristics {
  /** Total character length. */
  length: number;
  /** Word count. */
  wordCount: number;
  /** Whether code fences (```) are present. */
  hasCodeFences: boolean;
  /** Whether inline code (`) is present. */
  hasInlineCode: boolean;
  /** Whether programming keywords are detected. */
  hasProgrammingKeywords: boolean;
  /** Detected programming languages (if any). */
  detectedLanguages: string[];
  /** Whether the prompt contains a question mark. */
  isQuestion: boolean;
  /** Whether attachments are present. */
  hasAttachments: boolean;
  /** Whether the prompt has multiple distinct instructions/parts. */
  isMultiPart: boolean;
  /** Whether research/comparison terminology is present. */
  hasResearchTerms: boolean;
  /** Whether writing/creative terminology is present. */
  hasWritingTerms: boolean;
  /** Whether debugging terminology is present. */
  hasDebuggingTerms: boolean;
  /** Whether the prompt asks about recent/current events (post-2024). */
  needsRecentKnowledge: boolean;
  /** Whether the prompt requires deep math/logic reasoning. */
  needsDeepReasoning: boolean;
}

/** A scoring rule that contributes to provider scores. */
export interface ScoringRule {
  /** Human-readable name. */
  name: string;
  /** The condition to check against the prompt analysis. */
  condition: (analysis: PromptAnalysis) => boolean;
  /** Score adjustments to apply when the condition matches. */
  scores: Partial<Record<ProviderId, number>>;
}
