import { getProvider } from '@/providers/registry';
import type { ProviderId } from '@/providers/types';
import { useChatStore } from '@/store/chat';
import { keyStorage } from '@/lib/storage';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateChatTitle(
  convId: string,
  userMessage: string,
  providerId: ProviderId,
  model: string,
  apiKey: string
) {
  try {
    useChatStore.getState().setGeneratingTitleId(convId);
    
    let success = false;
    
    // Wait a brief moment to allow the main chat stream to cleanly disconnect and avoid strict concurrent rate limits (e.g. Gemini free tier)
    await delay(500);

    // Attempt 1: Try Gemini if available
    const geminiKey = await keyStorage.getKey('gemini');
    if (geminiKey) {
      try {
        const title = await attemptGeneration('gemini', 'gemini-1.5-flash', geminiKey, userMessage);
        if (title) {
          useChatStore.getState().renameConversation(convId, title);
          success = true;
          return;
        }
      } catch (err) {
        console.warn('Gemini title generation failed, falling back to current provider', err);
      }
    }

    // Attempt 2: Fallback to the current provider that is handling the chat
    if (!success) {
      try {
        // Wait again before falling back to ensure we don't hit rapid rate limits
        await delay(1500);
        const title = await attemptGeneration(providerId, model, apiKey, userMessage);
        if (title) {
          useChatStore.getState().renameConversation(convId, title);
        }
      } catch (err) {
        console.error(`Fallback title generation with ${providerId} failed:`, err);
      }
    }
  } catch (error) {
    console.error('Failed to auto-generate title:', error);
  } finally {
    useChatStore.getState().setGeneratingTitleId(null);
  }
}

async function attemptGeneration(providerId: ProviderId, model: string, apiKey: string, userMessage: string): Promise<string | null> {
  const provider = getProvider(providerId);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  const response = await provider.sendMessage({
    model,
    messages: [
      { role: 'system', content: 'You are a highly skilled title generator for a chat app. Based on the user\'s prompt, generate a concise, descriptive title (2 to 5 words). The title must abstractly summarize the core topic or intent. Do NOT just repeat or capitalize the user\'s prompt. Return ONLY the title text, capitalized like a Book Title. Do NOT use quotes, punctuation at the end, or markdown formatting.' },
      { role: 'user', content: userMessage }
    ],
    apiKey,
    signal: controller.signal
  });
  
  clearTimeout(timeoutId);

  if (response.content) {
    let title = response.content.trim();
    title = title.replace(/^["'*#]+|["'*#]+$/g, '').trim();
    if (title.length > 50) {
      title = title.slice(0, 47) + '...';
    }
    return title;
  }
  return null;
}
