// ─────────────────────────────────────────────
// BYOK — Signal Detection
// ─────────────────────────────────────────────
// Analyzes user prompts to detect task type and characteristics.
// Entirely local — no API calls. No AI model used.
// ─────────────────────────────────────────────

import type {
  PromptAnalysis,
  PromptCharacteristics,
  TaskType,
  RoutingSignal,
} from './types';

// ─── Keyword Sets ───────────────────────────

const PROGRAMMING_KEYWORDS = new Set([
  'function', 'const', 'let', 'var', 'class', 'interface', 'import', 'export',
  'return', 'async', 'await', 'promise', 'typescript', 'javascript', 'python',
  'java', 'rust', 'golang', 'react', 'vue', 'angular', 'node', 'npm', 'api',
  'endpoint', 'database', 'sql', 'query', 'schema', 'component', 'hook',
  'state', 'props', 'render', 'compile', 'build', 'deploy', 'docker',
  'kubernetes', 'git', 'branch', 'merge', 'commit', 'refactor', 'optimize',
  'algorithm', 'data structure', 'binary', 'array', 'object', 'string',
  'regex', 'html', 'css', 'dom', 'http', 'rest', 'graphql', 'websocket',
  'middleware', 'server', 'client', 'backend', 'frontend', 'fullstack',
  'framework', 'library', 'package', 'module', 'dependency', 'test',
  'unittest', 'integration', 'mock', 'stub', 'assertion',
]);

const PROGRAMMING_LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'rust', 'go', 'golang',
  'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'haskell',
  'elixir', 'dart', 'lua', 'perl', 'r', 'matlab', 'sql', 'bash', 'shell',
  'powershell', 'html', 'css', 'scss', 'sass',
];

const DEBUGGING_TERMS = [
  'error', 'bug', 'fix', 'debug', 'issue', 'problem', 'crash', 'exception',
  'stack trace', 'traceback', 'undefined', 'null', 'nan', 'broken',
  'not working', 'fails', 'failing', 'wrong output', 'unexpected',
  'TypeError', 'ReferenceError', 'SyntaxError', 'RuntimeError',
  'segfault', 'memory leak', 'race condition', 'deadlock',
];

const RESEARCH_TERMS = [
  'compare', 'comparison', 'difference', 'vs', 'versus', 'pros and cons',
  'advantages', 'disadvantages', 'trade-off', 'tradeoff', 'benchmark',
  'evaluate', 'review', 'analysis', 'research', 'study', 'investigate',
  'explore', 'alternatives', 'options', 'best practices', 'recommend',
  'state of the art', 'latest', 'trend', 'overview',
];

const WRITING_TERMS = [
  'write', 'essay', 'article', 'blog', 'post', 'story', 'creative',
  'poem', 'poetry', 'fiction', 'narrative', 'draft', 'compose', 'rewrite',
  'edit', 'proofread', 'tone', 'style', 'copywriting', 'content',
  'headline', 'tagline', 'slogan', 'pitch', 'email', 'letter',
  'speech', 'presentation', 'script',
];

const RECENT_KNOWLEDGE_PATTERNS = [
  /\b202[4-9]\b/, /\b203\d\b/,  // Years 2024-2039
  /\bthis year\b/i, /\blast year\b/i, /\bthis month\b/i,
  /\brecently\b/i, /\bcurrent\b/i, /\blatest\b/i, /\btoday\b/i,
  /\bright now\b/i, /\bup to date\b/i, /\bnew release\b/i,
  /\bjust (happened|released|launched|announced)\b/i,
];

const RECENT_EVENT_TERMS = [
  'news', 'oscar', 'election', 'world cup', 'olympics', 'super bowl',
  'grammy', 'emmy', 'nobel', 'ballon d\'or', 'champions league',
  'president', 'prime minister', 'ceo', 'stock price', 'ipo',
  'latest version', 'just released', 'new update',
];

const DEEP_REASONING_TERMS = [
  'prove', 'proof', 'theorem', 'lemma', 'corollary', 'derive',
  'calculus', 'integral', 'derivative', 'differential equation',
  'linear algebra', 'eigenvalue', 'matrix', 'determinant',
  'probability', 'statistics', 'bayesian', 'regression',
  'trapezoid', 'geometry', 'trigonometry', 'logarithm',
  'step by step', 'show your work', 'solve for',
  'logical reasoning', 'formal logic', 'induction',
];

const QUICK_QUESTION_PATTERNS = [
  /^what is /i,
  /^what are /i,
  /^who is /i,
  /^when did /i,
  /^where is /i,
  /^how many /i,
  /^how much /i,
  /^define /i,
  /^is it true /i,
  /^can you tell me /i,
  /^what does .+ mean/i,
];

// ─── Analysis Functions ─────────────────────

/**
 * Analyze a prompt to extract characteristics and signals.
 * This is the main entry point for the signal detection system.
 */
export function analyzePrompt(prompt: string): PromptAnalysis {
  const characteristics = extractCharacteristics(prompt);
  const taskType = detectTaskType(characteristics, prompt);
  const signals = detectSignals(characteristics, taskType);

  return { taskType, signals, characteristics };
}

/**
 * Extract measurable characteristics from a prompt.
 */
function extractCharacteristics(prompt: string): PromptCharacteristics {
  const lower = prompt.toLowerCase();
  const words = prompt.split(/\s+/).filter(w => w.length > 0);

  // Code detection
  const hasCodeFences = /```[\s\S]*?```/.test(prompt) || /~~~[\s\S]*?~~~/.test(prompt);
  const hasInlineCode = /`[^`]+`/.test(prompt);

  // Programming keywords
  const hasProgrammingKeywords = words.some(w =>
    PROGRAMMING_KEYWORDS.has(w.toLowerCase().replace(/[^a-z]/g, ''))
  );

  // Detect specific programming languages
  const detectedLanguages = PROGRAMMING_LANGUAGES.filter(lang =>
    lower.includes(lang)
  );

  // Multi-part detection (numbered lists, bullet points, multiple questions)
  const isMultiPart =
    /\d+\.\s/.test(prompt) ||
    /[-•]\s/.test(prompt) ||
    (prompt.match(/\?/g) || []).length > 1;

  // Term detection
  const hasResearchTerms = RESEARCH_TERMS.some(t => lower.includes(t));
  const hasWritingTerms = WRITING_TERMS.some(t => lower.includes(t));
  const hasDebuggingTerms = DEBUGGING_TERMS.some(t => lower.includes(t));

  return {
    length: prompt.length,
    wordCount: words.length,
    hasCodeFences,
    hasInlineCode,
    hasProgrammingKeywords,
    detectedLanguages,
    isQuestion: prompt.includes('?'),
    hasAttachments: false, // Will be set by caller when attachments exist
    isMultiPart,
    hasResearchTerms,
    hasWritingTerms,
    hasDebuggingTerms,
    needsRecentKnowledge:
      RECENT_KNOWLEDGE_PATTERNS.some(p => p.test(prompt)) ||
      RECENT_EVENT_TERMS.some(t => lower.includes(t)),
    needsDeepReasoning:
      DEEP_REASONING_TERMS.some(t => lower.includes(t)),
  };
}

/**
 * Detect the primary task type from characteristics.
 */
function detectTaskType(chars: PromptCharacteristics, prompt: string): TaskType {
  const lower = prompt.toLowerCase();

  // Debugging takes precedence when code + error terms are present
  if (chars.hasDebuggingTerms && (chars.hasCodeFences || chars.hasProgrammingKeywords)) {
    return 'debugging';
  }

  // Coding: code fences or strong programming signal
  if (chars.hasCodeFences || (chars.hasProgrammingKeywords && chars.detectedLanguages.length > 0)) {
    return 'coding';
  }

  // Summarization
  if (lower.includes('summarize') || lower.includes('summary') || lower.includes('tldr') || lower.includes('tl;dr')) {
    return 'summarization';
  }

  // Long context (very long prompts)
  if (chars.length > 3000 || chars.wordCount > 500) {
    return 'longContext';
  }

  // Research / comparison
  if (chars.hasResearchTerms) {
    return 'research';
  }

  // Writing / creative
  if (chars.hasWritingTerms && !chars.hasProgrammingKeywords) {
    return 'writing';
  }

  // Explanation (explain X, how does X work, etc.)
  if (/explain|how does|how do|what happens when|walk me through/i.test(lower)) {
    return 'explanation';
  }

  // Quick factual question
  if (chars.isQuestion && chars.wordCount < 15 && QUICK_QUESTION_PATTERNS.some(p => p.test(prompt))) {
    // If it needs recent knowledge, override to recentEvents instead
    if (chars.needsRecentKnowledge) return 'recentEvents';
    return 'quickQuestion';
  }

  // Recent events (even if not a quick question)
  if (chars.needsRecentKnowledge) {
    return 'recentEvents';
  }

  // Brainstorming
  if (/ideas|brainstorm|suggest|creative|come up with|think of/i.test(lower)) {
    return 'brainstorming';
  }

  // Comparison
  if (/compare|vs|versus|difference between/i.test(lower)) {
    return 'comparison';
  }

  return 'general';
}

/**
 * Generate routing signals from detected characteristics and task type.
 */
function detectSignals(chars: PromptCharacteristics, taskType: TaskType): RoutingSignal[] {
  const signals: RoutingSignal[] = [];

  // Coding signal
  signals.push({
    name: 'coding',
    detected: taskType === 'coding' || taskType === 'debugging',
    strength: chars.hasCodeFences ? 1.0 : chars.hasProgrammingKeywords ? 0.7 : 0,
  });

  // Debugging signal
  signals.push({
    name: 'debugging',
    detected: taskType === 'debugging',
    strength: taskType === 'debugging' ? 0.9 : 0,
  });

  // Long context signal
  signals.push({
    name: 'longContext',
    detected: chars.length > 2000 || chars.wordCount > 300,
    strength: Math.min(chars.length / 5000, 1.0),
  });

  // Quick question signal
  signals.push({
    name: 'quickQuestion',
    detected: taskType === 'quickQuestion',
    strength: taskType === 'quickQuestion' ? 0.9 : 0,
  });

  // Short prompt signal (≤ 50 chars → favor speed)
  signals.push({
    name: 'shortPrompt',
    detected: chars.length <= 50 && chars.wordCount <= 10,
    strength: chars.length <= 50 ? 0.8 : 0,
  });

  // Research signal
  signals.push({
    name: 'research',
    detected: taskType === 'research' || taskType === 'comparison',
    strength: chars.hasResearchTerms ? 0.8 : 0,
  });

  // Writing signal
  signals.push({
    name: 'writing',
    detected: taskType === 'writing',
    strength: chars.hasWritingTerms ? 0.7 : 0,
  });

  // Multi-part complexity signal
  signals.push({
    name: 'multiPart',
    detected: chars.isMultiPart,
    strength: chars.isMultiPart ? 0.6 : 0,
  });

  // Summarization signal
  signals.push({
    name: 'summarization',
    detected: taskType === 'summarization',
    strength: taskType === 'summarization' ? 0.8 : 0,
  });

  // Recent knowledge signal — heavily favors Gemini (latest training data)
  signals.push({
    name: 'recentKnowledge',
    detected: chars.needsRecentKnowledge,
    strength: chars.needsRecentKnowledge ? 1.0 : 0,
  });

  // Deep reasoning signal — favors Gemini and larger OpenRouter models
  signals.push({
    name: 'deepReasoning',
    detected: chars.needsDeepReasoning,
    strength: chars.needsDeepReasoning ? 0.9 : 0,
  });

  return signals;
}
