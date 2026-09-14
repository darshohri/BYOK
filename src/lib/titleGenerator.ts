import { getProvider } from '@/providers/registry';
import type { ProviderId } from '@/providers/types';
import { useChatStore } from '@/store/chat';
import { keyStorage } from '@/lib/storage';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const TITLE_SYSTEM_PROMPT =
  'You are a chat title generator. Given a user message, produce a short, descriptive title (2–6 words) that captures the core topic or intent. ' +
  'Rules: Do NOT repeat the message verbatim. Summarize the topic abstractly. Capitalize like a Book Title. ' +
  'Return ONLY the title — no quotes, no punctuation at the end, no markdown, no explanation.';

/**
 * Generate a high-quality AI-powered title for a chat conversation.
 * Tries providers in priority order: Groq (fastest) → Gemini → current provider.
 * If all AI attempts fail, falls back to a smart local truncation.
 */
export async function generateChatTitle(
  convId: string,
  userMessage: string,
  providerId: ProviderId,
  model: string,
  apiKey: string
) {
  try {
    useChatStore.getState().setGeneratingTitleId(convId);

    // Brief delay to let the main chat stream start cleanly
    await delay(300);

    // Build ordered list of providers to try
    const attempts: { providerId: ProviderId; model: string; apiKey: string }[] = [];

    // 1. Groq — fastest inference, ideal for quick title gen
    const groqKey = await keyStorage.getKey('groq');
    if (groqKey) {
      attempts.push({ providerId: 'groq', model: 'openai/gpt-oss-20b', apiKey: groqKey });
    }

    // 2. Gemini — reliable and free
    const geminiKey = await keyStorage.getKey('gemini');
    if (geminiKey) {
      attempts.push({ providerId: 'gemini', model: 'gemini-1.5-flash', apiKey: geminiKey });
    }

    // 3. Current provider as final AI attempt (skip if already queued above)
    if (providerId !== 'groq' && providerId !== 'gemini') {
      attempts.push({ providerId, model, apiKey });
    }

    for (const attempt of attempts) {
      try {
        const title = await attemptGeneration(attempt.providerId, attempt.model, attempt.apiKey, userMessage);
        if (title && title.length > 1) {
          useChatStore.getState().renameConversation(convId, title);
          return; // Success — done
        }
      } catch (err) {
        console.warn(`Title gen with ${attempt.providerId}/${attempt.model} failed, trying next...`, err);
        // Small delay before retrying with a different provider
        await delay(300);
      }
    }

    // All AI attempts failed — use smart local fallback
    const fallback = localFallbackTitle(userMessage);
    useChatStore.getState().renameConversation(convId, fallback);
  } catch (error) {
    console.error('Failed to auto-generate title:', error);
  } finally {
    useChatStore.getState().setGeneratingTitleId(null);
  }
}

async function attemptGeneration(
  providerId: ProviderId,
  model: string,
  apiKey: string,
  userMessage: string
): Promise<string | null> {
  const provider = getProvider(providerId);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await provider.sendMessage({
      model,
      messages: [
        { role: 'system', content: TITLE_SYSTEM_PROMPT },
        { role: 'user', content: userMessage.slice(0, 500) } // Limit input to save tokens
      ],
      apiKey,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.content) {
      let title = response.content.trim();
      // Strip quotes, markdown, asterisks, hashes
      title = title.replace(/^["""'*#`\-–—]+|["""'*#`\-–—.!?]+$/g, '').trim();
      // Remove any leading "Title:" prefix the model might add
      title = title.replace(/^(title|topic|subject|chat)\s*[:：]\s*/i, '').trim();
      // Take only the first line if multi-line
      title = title.split('\n')[0].trim();

      if (title.length > 50) {
        title = title.slice(0, 47) + '...';
      }

      return title.length > 1 ? title : null;
    }
    return null;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Smart local fallback: extract the first meaningful phrase from the message.
 * Much better than raw truncation.
 */
function localFallbackTitle(content: string): string {
  const cleaned = content.trim().replace(/\s+/g, ' ');

  // If it's a question, use the question up to 50 chars
  const questionMatch = cleaned.match(/^(.+?\?)/);
  if (questionMatch && questionMatch[1].length <= 50) {
    return questionMatch[1];
  }

  // Extract first sentence/clause
  const sentenceMatch = cleaned.match(/^(.+?[.!?])\s/);
  if (sentenceMatch && sentenceMatch[1].length <= 50) {
    return sentenceMatch[1];
  }

  // Just truncate cleanly at word boundary
  if (cleaned.length <= 40) return cleaned;
  const truncated = cleaned.slice(0, 40);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 15 ? truncated.slice(0, lastSpace) : truncated) + '...';
}
