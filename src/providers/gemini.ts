// ─────────────────────────────────────────────
// BYOK — Google Gemini Provider
// ─────────────────────────────────────────────
// Uses the Gemini REST API directly from the browser.
// All requests use the user's own API key.
// ─────────────────────────────────────────────

import type { AIProvider, ModelInfo, SendMessageParams, AIResponse } from './types';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1';

/**
 * Default models to expose when the API doesn't return a usable list.
 * These are starting defaults — the actual list comes from the API.
 */
const DEFAULT_GEMINI_MODELS: ModelInfo[] = [
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'gemini',
    capabilities: ['text', 'vision', 'reasoning', 'tools', 'structuredOutput'],
    contextLength: 1048576,
    modality: ['text', 'image'],
    isFree: true,
    description: 'Fast, efficient model for everyday tasks',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'gemini',
    capabilities: ['text', 'vision', 'longContext', 'reasoning', 'tools', 'structuredOutput'],
    contextLength: 2097152,
    modality: ['text', 'image'],
    description: 'Most capable Gemini model for complex tasks',
  },
  {
    id: 'gemini-1.5-flash-8b',
    name: 'Gemini 1.5 Flash-8B',
    provider: 'gemini',
    capabilities: ['text', 'vision', 'tools'],
    contextLength: 1048576,
    modality: ['text', 'image'],
    isFree: true,
    description: 'Lightweight model for low latency',
  },
];

/**
 * Convert BYOK chat messages to Gemini API format.
 */
function toGeminiContents(messages: SendMessageParams['messages']) {
  return messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
}

/**
 * Extract system instruction from messages if present.
 */
function getSystemInstruction(messages: SendMessageParams['messages']): string | undefined {
  const systemMsg = messages.find(m => m.role === 'system');
  return systemMsg?.content;
}

export const geminiProvider: AIProvider = {
  id: 'gemini',
  name: 'Gemini',

  async validateKey(key: string): Promise<boolean> {
    try {
      const res = await fetch(`${GEMINI_API_BASE}/models?key=${key}`);
      return res.ok;
    } catch {
      return false;
    }
  },

  async listModels(key: string): Promise<ModelInfo[]> {
    try {
      const res = await fetch(`${GEMINI_API_BASE}/models?key=${key}`);
      if (!res.ok) return DEFAULT_GEMINI_MODELS;

      const data = await res.json();
      if (!data.models || !Array.isArray(data.models)) return DEFAULT_GEMINI_MODELS;

      const models: ModelInfo[] = data.models
        .filter((m: any) =>
          m.name &&
          m.supportedGenerationMethods?.includes('generateContent') &&
          // Only include standard text/chat models
          m.name.includes('gemini') &&
          !m.name.includes('-image') &&
          !m.name.includes('-vision') &&
          !m.name.includes('3.7') &&
          !m.name.includes('2.5') &&
          !m.name.includes('exp')
        )
        .map((m: any) => {
          const id = m.name.replace('models/', '');
          return {
            id,
            name: m.displayName || id,
            provider: 'gemini' as const,
            capabilities: inferGeminiCapabilities(m),
            contextLength: m.inputTokenLimit || 32768,
            modality: inferGeminiModality(m),
            description: m.description || '',
            isFree: true,
          };
        });

      return models.length > 0 ? models : DEFAULT_GEMINI_MODELS;
    } catch {
      return DEFAULT_GEMINI_MODELS;
    }
  },

  async sendMessage(params: SendMessageParams): Promise<AIResponse> {
    const { model, messages, apiKey, signal, onChunk } = params;
    const startTime = performance.now();

    const systemInstruction = getSystemInstruction(messages);
    const contents = toGeminiContents(messages);

    const body: any = { contents };
    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    // Enable thought streaming for Gemini 3.x models so the user doesn't stare at a blank screen for 60 seconds
    if (model.includes('gemini-3')) {
      body.generationConfig = {
        thinkingConfig: {
          includeThoughts: true
        }
      };
    }

    // Use streaming if onChunk is provided
    if (onChunk) {
      return streamGeminiResponse(model, body, apiKey, startTime, signal, onChunk);
    }

    // Non-streaming fallback
    const res = await fetch(
      `${GEMINI_API_BASE}/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal,
      }
    );

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error?.message || `Gemini API error: ${res.status}`);
    }

    const data = await res.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const usage = data.usageMetadata;

    return {
      content,
      model,
      provider: 'gemini',
      latencyMs: Math.round(performance.now() - startTime),
      tokenUsage: usage
        ? {
          prompt: usage.promptTokenCount || 0,
          completion: usage.candidatesTokenCount || 0,
          total: usage.totalTokenCount || 0,
        }
        : undefined,
    };
  },
};

/**
 * Handle streaming response from Gemini.
 */
async function streamGeminiResponse(
  model: string,
  body: any,
  apiKey: string,
  startTime: number,
  signal: AbortSignal | undefined,
  onChunk: (chunk: string) => void
): Promise<AIResponse> {
  const res = await fetch(
    `${GEMINI_API_BASE}/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    }
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error?.message || `Gemini API error: ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let fullContent = '';
  let tokenUsage: AIResponse['tokenUsage'] = undefined;
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Extract all complete SSE frames (separated by double newline)
      const frames = buffer.split(/\r?\n\r?\n/);

      // The last element is either an incomplete frame or empty string, keep it in the buffer
      buffer = frames.pop() || '';

      for (const frame of frames) {
        const trimmed = frame.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;

        // Remove 'data:' and leading spaces
        const jsonStr = trimmed.replace(/^data:\s*/, '').trim();
        if (!jsonStr || jsonStr === '[DONE]') continue;

        try {
          const parsed = JSON.parse(jsonStr);
          const parts = parsed.candidates?.[0]?.content?.parts;
          
          if (Array.isArray(parts)) {
            for (const part of parts) {
              // Thoughts might be in part.text (with a flag) or in part.thought directly
              const chunkText = part.thought || part.text;
              if (chunkText) {
                // If it's explicitly marked as a thought, we could format it, 
                // but for now we just stream it so the UI doesn't hang.
                const formatted = part.thought ? `\n> 💭 ${chunkText.replace(/\n/g, '\n> ')}\n` : chunkText;
                fullContent += formatted;
                onChunk(formatted);
              }
            }
          }
          
          // Capture usage from last chunk
          if (parsed.usageMetadata) {
            tokenUsage = {
              prompt: parsed.usageMetadata.promptTokenCount || 0,
              completion: parsed.usageMetadata.candidatesTokenCount || 0,
              total: parsed.usageMetadata.totalTokenCount || 0,
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
  content: fullContent,
  model,
  provider: 'gemini',
  latencyMs: Math.round(performance.now() - startTime),
  tokenUsage,
};
}

/** Infer capabilities from Gemini model metadata. */
function inferGeminiCapabilities(model: any): ModelInfo['capabilities'] {
  const caps: ModelInfo['capabilities'] = ['text'];
  const name = (model.name || '').toLowerCase();
  if (name.includes('vision') || model.supportedGenerationMethods?.includes('generateContent')) {
    caps.push('vision');
  }
  if ((model.inputTokenLimit || 0) > 100000) {
    caps.push('longContext');
  }
  if (name.includes('pro') || name.includes('2.5')) {
    caps.push('reasoning');
  }
  return caps;
}

/** Infer modality from Gemini model metadata. */
function inferGeminiModality(model: any): ModelInfo['modality'] {
  const modalities: ModelInfo['modality'] = ['text'];
  const name = (model.name || '').toLowerCase();
  if (name.includes('vision') || name.includes('gemini')) {
    modalities.push('image');
  }
  return modalities;
}
