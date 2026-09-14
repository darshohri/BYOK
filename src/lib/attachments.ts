import type { Attachment } from '@/providers/types';
import heic2any from 'heic2any';

// 5MB limit for text files to accommodate larger context windows
const MAX_TEXT_FILE_SIZE = 5 * 1024 * 1024; 

export class AttachmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AttachmentError';
  }
}

/**
 * Process a list of files into base64 attachments.
 * Resizes images to max 1024x1024 and extracts text from supported text files.
 */
export async function processAttachments(files: FileList | File[]): Promise<Attachment[]> {
  const attachments: Attachment[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const isHeic = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');

    if (file.type.startsWith('image/') || isHeic) {
      let imageFile = file;
      if (isHeic) {
        try {
          const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 });
          const blobArray = Array.isArray(blob) ? blob : [blob];
          imageFile = new File([blobArray[0]], file.name.replace(/\.heic|\.heif/i, '.jpg'), { type: 'image/jpeg' });
        } catch (err) {
          throw new AttachmentError(`Failed to convert HEIC image: ${file.name}`);
        }
      }

      const data = await processImage(imageFile);
      attachments.push({
        type: 'image',
        name: imageFile.name,
        mimeType: 'image/jpeg', // we convert to jpeg
        data
      });
    } else {
      // Treat as text file
      if (file.size > MAX_TEXT_FILE_SIZE) {
        throw new AttachmentError(`File ${file.name} is too large. Max size is 5MB.`);
      }
      const text = await file.text();
      attachments.push({
        type: 'file',
        name: file.name,
        mimeType: file.type || 'text/plain',
        data: text // for files we just store the raw text string
      });
    }
  }

  return attachments;
}

/**
 * Resize and compress an image file using an off-screen canvas.
 * Returns a base64 data URL.
 */
function processImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        const MAX_DIM = 1024;
        
        if (width > MAX_DIM || height > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        // Output as jpeg for broader compatibility across models (some OpenRouter models hate webp)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85); 
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
