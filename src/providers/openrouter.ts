// ─────────────────────────────────────────────
// BYOK — OpenRouter Provider
// ─────────────────────────────────────────────
// Uses OpenRouter's OpenAI-compatible REST API.
// The model catalog is fetched dynamically — never permanently hardcoded.
// An OpenRouter API key is a PROVIDER credential, not a model credential.
// The actual model is specified separately in the API request body.
// ─────────────────────────────────────────────

import type { AIProvider, ModelInfo, SendMessageParams, AIResponse } from './types';
import { streamOpenAICompatible, toOpenAIMessages } from './groq';

const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1';

export const openrouterProvider: AIProvider = {
  id: 'openrouter',
  name: 'OpenRouter',

  async validateKey(key: string): Promise<boolean> {
    try {
      const res = await fetch(`${OPENROUTER_API_BASE}/auth/key`, {
        headers: { Authorization: `Bearer ${key}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async listModels(key: string): Promise<ModelInfo[]> {
    try {
      const res = await fetch(`${OPENROUTER_API_BASE}/models`, {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (!res.ok) return [];

      const data = await res.json();
      if (!data.data || !Array.isArray(data.data)) return [];

      const models: ModelInfo[] = data.data
        .map((m: any) => {
          const isFree =
            (m.pricing && parseFloat(m.pricing.prompt) === 0 && parseFloat(m.pricing.completion) === 0) ||
            m.id?.includes(':free');

          return {
            id: m.id,
            name: m.name || m.id,
            provider: 'openrouter' as const,
            capabilities: inferOpenRouterCapabilities(m),
            contextLength: m.context_length || 4096,
            modality: inferOpenRouterModality(m),
            isFree,
            description: m.description || '',
          };
        });

      const allowedPrefixes = [
        'google/', 'meta-llama/', 'anthropic/', 
        'openai/', 'mistralai/', 'cohere/',
        'x-ai/', 'deepseek/', 'microsoft/',
        'nvidia/', 'nousresearch/', 'qwen/',
        'huggingfaceh4/', 'phind/', 'openchat/',
        'teknium/', 'cognitivecomputations/',
        'lizpreciatior/', 'neversleep/',
        'undi95/', 'gryphe/', 'pygmalionai/',
        'mancer/', 'thedrummer/', 'sao10k/',
        'aetherwiing/', 'nothingiisreal/',
        'sophosympatheia/', 'eva-unit-01/',
        'featherless/', 'moonshotai/',
        'ai21/', 'databricks/', 'allenai/',
        'liquid/', 'together/', 'perplexity/',
        'z-ai/', 'minimax/', 'poolside/',
      ];

      return models.filter(m => {
        if (!m.isFree) return false;
        const id = m.id.toLowerCase();
        
        // Exclude utility models
        if (id.includes('guard') || id.includes('moderation') || id.includes('embed')) return false;
        
        // Exclude non-English and experimental models
        if (id.includes('allam') || id.includes('bielik') || id.includes('saiga')) return false;
        if (id.includes('chinese') || id.includes('japanese') || id.includes('ko-')) return false;
        if (id.includes('-ar-') || id.includes('-zh-') || id.includes('-ja-') || id.includes('-ko-')) return false;
        if (id.includes('gemma-4')) return false;

        // Exclude specific requested models without touching others
        if (id.includes('nemotron') && (id.includes('safety') || id.includes('3.5') || id.includes('3-5'))) return false;
        if (id.includes('lyria')) return false;

        // Exclude broken free models
        if (id.includes('laguna-s') || id.includes('glm-5.2')) return false;

        // Whitelist known vendor prefixes
        return allowedPrefixes.some(prefix => id.startsWith(prefix));
      });
    } catch {
      return [];
    }
  },

  async sendMessage(params: SendMessageParams): Promise<AIResponse> {
    const { model, messages, apiKey, signal, onChunk } = params;
    const startTime = performance.now();

    const body = {
      model,
      messages: toOpenAIMessages(messages),
      stream: !!onChunk,
      max_tokens: 4096,
      include_reasoning: true,
    };

    const res = await fetch(`${OPENROUTER_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'BYOK',
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(
        error.error?.message || `OpenRouter API error: ${res.status}`
      );
    }

    // Streaming
    if (onChunk) {
      return streamOpenAICompatible(res, model, 'openrouter', startTime, onChunk);
    }

    // Non-streaming
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    const usage = data.usage;

    return {
      content,
      model,
      provider: 'openrouter',
      latencyMs: Math.round(performance.now() - startTime),
      tokenUsage: usage
        ? {
            prompt: usage.prompt_tokens || 0,
            completion: usage.completion_tokens || 0,
            total: usage.total_tokens || 0,
          }
        : undefined,
    };
  },
};

/** Infer capabilities from OpenRouter model metadata. */
function inferOpenRouterCapabilities(model: any): ModelInfo['capabilities'] {
  const caps: ModelInfo['capabilities'] = ['text'];
  const id = model.id?.toLowerCase() || '';

  if (id.includes('minimax/minimax-m3') || id.includes('nemotron-3-nano-omni')) {
    caps.push('vision');
  }
  if ((model.context_length || 0) > 100000) {
    caps.push('longContext');
  }
  if (id.includes('o1') || id.includes('reasoning')) {
    caps.push('reasoning');
  }
  return caps;
}

/** Infer modality from OpenRouter model metadata. */
function inferOpenRouterModality(model: any): ModelInfo['modality'] {
  const modalities: ModelInfo['modality'] = ['text'];
  const id = model.id?.toLowerCase() || '';

  if (id.includes('minimax/minimax-m3') || id.includes('nemotron-3-nano-omni')) {
    modalities.push('image');
  }
  return modalities;
}
