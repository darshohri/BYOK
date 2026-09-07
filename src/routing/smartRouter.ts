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
import { getProvider } from '@/providers/registry';
import { keyStorage, ledgerStorage } from '@/lib/storage';
import { encode } from 'gpt-tokenizer';

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
  /** Threshold of tokens to trigger bypass to large context window. */
  longContextThreshold: number;
  /** Whether the request contains image attachments. */
  hasImage?: boolean;
}

/**
 * Helper to fall back to the legacy regex heuristic.
 */
function evaluateHeuristic(prompt: string, availableProviders: ProviderId[], connections: Record<ProviderId, ProviderConnection>, fallbackProvider: ProviderId): RouterResult {
  const analysis = analyzePrompt(prompt);
  const rawScores = calculateScores(analysis, availableProviders);
  const normalizedScores = normalizeScores(rawScores);
  const confidence = calculateConfidence(rawScores);

  let selectedProvider: ProviderId = availableProviders[0];
  let highestScore = -Infinity;

  for (const provider of availableProviders) {
    if (rawScores[provider] > highestScore) {
      highestScore = rawScores[provider];
      selectedProvider = provider;
    }
  }

  if (confidence < CONFIDENCE_THRESHOLD && availableProviders.includes(fallbackProvider)) {
    selectedProvider = fallbackProvider;
  }

  const selectedModel = connections[selectedProvider].selectedModel || '';
  const taskDesc = TASK_DESCRIPTIONS[analysis.taskType] || 'general-purpose task';

  return {
    provider: selectedProvider,
    model: selectedModel,
    confidence: Math.round(confidence * 100) / 100,
    reason: `Detected ${taskDesc}`,
    scores: normalizedScores,
    category: analysis.taskType,
  };
}

/**
 * Run the Smart Router to select the best provider for a prompt.
 * Uses an LLM classification call with a fallback to the legacy heuristic.
 *
 * Returns null if no providers are connected.
 */
export async function routePrompt(params: SmartRouterParams): Promise<RouterResult | null> {
  const { prompt, connections, fallbackProvider, hasImage } = params;

  // Determine available providers (connected only)
  let availableProviders = (Object.entries(connections) as [ProviderId, ProviderConnection][])
    .filter(([, conn]) => conn.connected)
    .map(([id]) => id as ProviderId);

  // If there's an image, strictly filter out providers whose selected model lacks vision
  if (hasImage) {
    availableProviders = availableProviders.filter(provider => {
      const conn = connections[provider];
      const model = conn.availableModels.find(m => m.id === conn.selectedModel);
      return model?.capabilities.includes('vision');
    });
  }

  // No providers connected (or no vision providers available)
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
      category: 'general',
    };
  }

  // --- Step 4: Token-based long-context routing bypass ---
  try {
    const tokenCount = encode(prompt).length;
    if (tokenCount > params.longContextThreshold) {
      let largestProvider: ProviderId | null = null;
      let maxContext = 0;
      
      for (const provider of availableProviders) {
        const conn = connections[provider];
        if (conn.selectedModel) {
          const modelInfo = conn.availableModels.find(m => m.id === conn.selectedModel);
          if (modelInfo && modelInfo.contextLength > maxContext) {
            maxContext = modelInfo.contextLength;
            largestProvider = provider;
          }
        }
      }
      
      // Only route if we found a provider, and it actually has a meaningfully large context
      if (largestProvider && maxContext > 32000) {
        const model = connections[largestProvider].selectedModel || '';
        return {
          provider: largestProvider,
          model,
          confidence: 1.0,
          reason: `Long context detected (> ${params.longContextThreshold.toLocaleString()} tokens)`,
          scores: { gemini: 0, groq: 0, openrouter: 0, [largestProvider]: 100 },
          category: 'longContext',
        };
      }
    }
  } catch (e) {
    console.warn('[Smart Router] Token counting failed, falling through', e);
  }
  // --- End Step 4 ---

  // Choose the best provider for classification (Prefer fast/cheap: Groq > Gemini > OpenRouter)
  let classifierProvider: ProviderId | null = null;
  if (availableProviders.includes('groq')) classifierProvider = 'groq';
  else if (availableProviders.includes('gemini')) classifierProvider = 'gemini';
  else classifierProvider = availableProviders[0];

  if (!classifierProvider) {
    return evaluateHeuristic(prompt, availableProviders, connections, fallbackProvider);
  }

  const apiKey = await keyStorage.getKey(classifierProvider);
  if (!apiKey) {
    return evaluateHeuristic(prompt, availableProviders, connections, fallbackProvider);
  }

  const providerObj = getProvider(classifierProvider);
  const model = connections[classifierProvider].selectedModel || '';

  const systemPrompt = `You are a strict JSON classifier.
Analyze the user's prompt and categorize it into EXACTLY ONE of the following types:
coding, debugging, explanation, quickQuestion, brainstorming, research, comparison, writing, summarization, longContext, imageAnalysis, recentEvents, general.

Output ONLY valid JSON in this exact format:
{
  "category": "coding",
  "confidence": 0.95,
  "reasoning": "Short explanation"
}`;

  try {
    const response = await providerObj.sendMessage({
      model,
      apiKey,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ]
    });

    // Parse JSON safely
    const content = response.content.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(content);

    if (!result.category || typeof result.confidence !== 'number') {
      throw new Error('Invalid JSON structure');
    }

    // Now map the category to scores as if it was a heuristic analysis
    const mappedAnalysis = {
      taskType: result.category,
      complexity: result.confidence > 0.8 ? 'high' : 'medium',
      requiresRecent: result.category === 'recentEvents',
      requiresReasoning: result.category === 'coding' || result.category === 'debugging' || result.category === 'comparison'
    } as any;

    const rawScores = calculateScores(mappedAnalysis, availableProviders);
    
    // Apply ledger biases
    const bias = await ledgerStorage.getBias(result.category, availableProviders);
    let biasApplied = false;
    let biasReason = '';

    for (const provider of availableProviders) {
      if (bias[provider]) {
        rawScores[provider] += bias[provider];
      }
    }

    const normalizedScores = normalizeScores(rawScores);

    let selectedProvider: ProviderId = availableProviders[0];
    let highestScore = -Infinity;
    for (const provider of availableProviders) {
      if (rawScores[provider] > highestScore) {
        highestScore = rawScores[provider];
        selectedProvider = provider;
      }
    }

    if (bias[selectedProvider]) {
      biasApplied = true;
      const meta = getProvider(selectedProvider).name || selectedProvider;
      biasReason = `Routed to ${meta} based on your past preference for ${result.category} tasks.`;
    }

    if (result.confidence < CONFIDENCE_THRESHOLD && availableProviders.includes(fallbackProvider)) {
      selectedProvider = fallbackProvider;
      biasApplied = false;
    }

    const selectedModel = connections[selectedProvider].selectedModel || '';
    
    return {
      provider: selectedProvider,
      model: selectedModel,
      confidence: result.confidence,
      reason: biasApplied ? biasReason : (result.reasoning || `Detected ${result.category}`),
      scores: normalizedScores,
      classifierLatencyMs: response.latencyMs,
      classifierTokenUsage: response.tokenUsage,
      category: result.category,
      biasApplied,
    };

  } catch (error) {
    console.warn('[Smart Router] LLM classification failed, falling back to heuristic:', error);
    return evaluateHeuristic(prompt, availableProviders, connections, fallbackProvider);
  }
}
