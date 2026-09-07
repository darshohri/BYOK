// ─────────────────────────────────────────────
// BYOK — Groq Provider
// ─────────────────────────────────────────────
// Uses Groq's OpenAI-compatible REST API.
// All requests use the user's own API key.
// ─────────────────────────────────────────────

import type { AIProvider, ModelInfo, SendMessageParams, AIResponse } from './types';

const GROQ_API_BASE = 'https://api.groq.com/openai/v1';

/**
 * Default models when the API is unavailable.
 */
const DEFAULT_GROQ_MODELS: ModelInfo[] = [
  {
    id: 'llama3-70b-8192',
    name: 'Llama 3 70B',
    provider: 'groq',
    capabilities: ['text', 'reasoning'],
    contextLength: 8192,
    modality: ['text'],
    isFree: true,
    description: 'Versatile large language model on Groq',
  },
  {
    id: 'llama3-8b-8192',
    name: 'Llama 3 8B',
    provider: 'groq',
    capabilities: ['text'],
    contextLength: 8192,
    modality: ['text'],
    isFree: true,
    description: 'Ultra-fast small model',
  },
];

/**
 * Convert BYOK chat messages to OpenAI-compatible format.
 */
export function toOpenAIMessages(messages: SendMessageParams['messages']) {
  return messages.map(m => {
    let textContent = m.content || '';
    const imageParts: any[] = [];

    if (m.attachments) {
      for (const att of m.attachments) {
        if (att.type === 'file') {
          textContent += `\n\n[File: ${att.name}]\n${att.data}`;
        } else if (att.type === 'image') {
          imageParts.push({
            type: 'image_url',
            image_url: { url: att.data }
          });
        }
      }
    }

    if (imageParts.length > 0) {
      return {
        role: m.role,
        content: [
          { type: 'text', text: textContent },
          ...imageParts
        ]
      };
    }

    return {
      role: m.role,
      content: textContent,
    };
  });
}

export const groqProvider: AIProvider = {
  id: 'groq',
  name: 'Groq',

  async validateKey(key: string): Promise<boolean> {
    try {
      const res = await fetch(`${GROQ_API_BASE}/models`, {
        headers: { Authorization: `Bearer ${key}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async listModels(key: string): Promise<ModelInfo[]> {
    try {
      const res = await fetch(`${GROQ_API_BASE}/models`, {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (!res.ok) return DEFAULT_GROQ_MODELS;

      const data = await res.json();
      if (!data.data || !Array.isArray(data.data)) return DEFAULT_GROQ_MODELS;

      // Filter to only English text chat models
      const models: ModelInfo[] = data.data
        .filter((m: any) => {
          const id = (m.id || '').toLowerCase();
          // Exclude audio, speech, vision-only, embedding, guard models
          if (id.includes('whisper') || id.includes('tts') || id.includes('orpheus')) return false;
          if (id.includes('guard') || id.includes('moderation')) return false;
          if (id.includes('vision') && !id.includes('preview')) return false;
          // Exclude non-English models
          if (id.includes('allam') || id.includes('bielik') || id.includes('saiga')) return false;
          if (id.includes('chinese') || id.includes('japanese') || id.includes('ko-')) return false;
          if (id.includes('-ar-') || id.includes('-zh-') || id.includes('-ja-') || id.includes('-ko-')) return false;
          // Exclude image generation models
          if (id.includes('playai') || id.includes('compound')) return false;
          return true;
        })
        .map((m: any) => ({
          id: m.id,
          name: m.id,
          provider: 'groq' as const,
          capabilities: ['text'] as string[],
          contextLength: m.context_window || 8192,
          modality: ['text'] as string[],
          isFree: true,
          description: `${m.id} on Groq`,
        }));

      return models.length > 0 ? models : DEFAULT_GROQ_MODELS;
    } catch {
      return DEFAULT_GROQ_MODELS;
    }
  },

  async sendMessage(params: SendMessageParams): Promise<AIResponse> {
    const { model, messages, apiKey, signal, onChunk } = params;
    const startTime = performance.now();

    const body = {
      model,
      messages: toOpenAIMessages(messages),
      stream: !!onChunk,
    };

    const res = await fetch(`${GROQ_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(
        error.error?.message || `Groq API error: ${res.status}`
      );
    }

    // Streaming
    if (onChunk) {
      return streamOpenAICompatible(res, model, 'groq', startTime, onChunk);
    }

    // Non-streaming
    const data = await res.json();
    let content = data.choices?.[0]?.message?.content || '';
    // Strip <think> tags from the final non-streamed response
    content = content.replace(/<think>[\s\S]*?<\/think>\n?/gi, '').trimStart();
    
    const usage = data.usage;

    return {
      content,
      model,
      provider: 'groq',
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

/**
 * Shared streaming handler for OpenAI-compatible APIs (Groq, OpenRouter).
 */
export async function streamOpenAICompatible(
  res: Response,
  model: string,
  provider: 'groq' | 'openrouter',
  startTime: number,
  onChunk: (chunk: string) => void
): Promise<AIResponse> {
  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let fullContent = '';
  let filteredFullContent = '';
  let tokenUsage: AIResponse['tokenUsage'] = undefined;

  try {
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split(/\r?\n\r?\n/);
      // Keep the last potentially incomplete frame in the buffer
      buffer = frames.pop() || '';

      for (const frame of frames) {
        const trimmed = frame.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;
        const jsonStr = trimmed.replace(/^data:\s*/, '').trim();
        if (jsonStr === '[DONE]') continue;

        try {
          const parsed = JSON.parse(jsonStr);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            fullContent += delta;
            
            // Strip <think>...</think> blocks dynamically
            let currentFiltered = fullContent.replace(/<think>[\s\S]*?<\/think>\n?/gi, '');
            currentFiltered = currentFiltered.replace(/<think>[\s\S]*$/i, ''); // Strip open tag
            
            // Detect if we might be in the middle of receiving '<think>'
            let pendingSuffix = '';
            const lowerFiltered = currentFiltered.toLowerCase();
            const prefixes = ['<think', '<thin', '<thi', '<th', '<t', '<'];
            for (const p of prefixes) {
              if (lowerFiltered.endsWith(p)) {
                pendingSuffix = currentFiltered.slice(-p.length);
                break;
              }
            }
            
            const safeFiltered = currentFiltered.slice(0, currentFiltered.length - pendingSuffix.length);
            
            if (safeFiltered.length > filteredFullContent.length) {
              const newDelta = safeFiltered.slice(filteredFullContent.length);
              filteredFullContent = safeFiltered;
              // Only send if we actually have content to avoid empty initial chunks
              if (newDelta) onChunk(newDelta);
            }
          }
          // Capture usage from the last chunk if available
          if (parsed.usage) {
            tokenUsage = {
              prompt: parsed.usage.prompt_tokens || 0,
              completion: parsed.usage.completion_tokens || 0,
              total: parsed.usage.total_tokens || 0,
            };
          }
        } catch {
          // Skip unparseable chunks
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return {
    content: filteredFullContent, // Return the clean filtered content
    model,
    provider,
    latencyMs: Math.round(performance.now() - startTime),
    tokenUsage,
  };
}
