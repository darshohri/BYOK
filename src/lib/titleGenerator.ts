import { getProvider } from '@/providers/registry';
import type { ProviderId } from '@/providers/types';
import { useChatStore } from '@/store/chat';

export async function generateChatTitle(
  convId: string,
  userMessage: string,
  providerId: ProviderId,
  model: string,
  apiKey: string
) {
  try {
    useChatStore.getState().setGeneratingTitleId(convId);
    
    const provider = getProvider(providerId);
    const controller = new AbortController();

    const response = await provider.sendMessage({
      model,
      messages: [
        { 
          role: 'system', 
          content: 'You are a highly skilled title generator for a chat app. Based on the user\'s prompt, generate a concise, descriptive title (2 to 5 words). The title must summarize the core topic or intent. Return ONLY the title text, capitalized like a Book Title. Do NOT use quotes, punctuation at the end, or markdown formatting.' 
        },
        { role: 'user', content: userMessage }
      ],
      apiKey,
      signal: controller.signal
    });

    if (response.content) {
      let title = response.content.trim();
      // Remove trailing/leading quotes and markdown bold/italic characters
      title = title.replace(/^["'*#]+|["'*#]+$/g, '');
      title = title.trim();
      
      // Enforce length limit just in case
      if (title.length > 50) {
        title = title.slice(0, 47) + '...';
      }

      useChatStore.getState().renameConversation(convId, title);
    }
  } catch (error) {
    console.error('Failed to auto-generate title:', error);
    // Silent fail
  } finally {
    useChatStore.getState().setGeneratingTitleId(null);
  }
}
