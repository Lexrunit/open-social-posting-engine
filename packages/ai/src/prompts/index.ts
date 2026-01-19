import { Platform } from '@open-social/core';

/**
 * Platform-specific prompts for LinkedIn
 */
export const linkedInPrompts = {
  summarize: (content: string, targetLength: number) => `
You are a professional LinkedIn content writer. Summarize the following content into a compelling LinkedIn post of approximately ${targetLength} characters.

Guidelines:
- Professional tone
- Include relevant emojis sparingly
- Add 2-3 relevant hashtags at the end
- Make it engaging and conversation-starting
- Focus on value and insights

Content:
${content}

LinkedIn Post:`,

  rewrite: (content: string, tone: string) => `
Rewrite the following content for LinkedIn in a ${tone} tone.

Guidelines:
- Professional and authentic
- Clear call-to-action or thought-provoking question
- Include relevant hashtags
- Optimize for engagement

Original content:
${content}

Rewritten for LinkedIn:`,
};

/**
 * Platform-specific prompts for X (Twitter)
 */
export const xPrompts = {
  summarize: (content: string, targetLength: number) => `
You are a social media expert. Summarize the following content into a compelling X (Twitter) post of maximum ${targetLength} characters.

Guidelines:
- Concise and punchy
- Use emojis strategically
- Include 1-2 relevant hashtags
- Make every word count
- Hook the reader immediately

Content:
${content}

X Post:`,

  rewrite: (content: string, tone: string) => `
Rewrite the following content for X (Twitter) in a ${tone} tone. Keep it under 280 characters.

Guidelines:
- Short and impactful
- Include relevant hashtags
- Engaging and shareable
- Clear message

Original content:
${content}

Rewritten for X:`,
};

/**
 * Platform-specific prompts for Instagram
 */
export const instagramPrompts = {
  summarize: (content: string, targetLength: number) => `
You are an Instagram content creator. Create an engaging Instagram caption of approximately ${targetLength} characters from the following content.

Guidelines:
- Warm and authentic tone
- Use line breaks for readability
- Include relevant emojis throughout
- Add 5-10 relevant hashtags at the end
- Make it visually appealing
- Encourage engagement

Content:
${content}

Instagram Caption:`,

  rewrite: (content: string, tone: string) => `
Rewrite the following content as an Instagram caption in a ${tone} tone.

Guidelines:
- Engaging and visual
- Use emojis naturally
- Include relevant hashtags
- Encourage comments and shares
- Authentic voice

Original content:
${content}

Instagram Caption:`,

  generateCaption: (context?: string) => `
Generate an engaging Instagram caption for an image${context ? ` about ${context}` : ''}.

Guidelines:
- Authentic and relatable
- Include relevant emojis
- Add 5-8 relevant hashtags
- Encourage engagement
- Keep it concise but meaningful

Caption:`,
};

/**
 * Platform-specific prompts for Facebook
 */
export const facebookPrompts = {
  summarize: (content: string, targetLength: number) => `
You are a Facebook content creator. Transform the following content into an engaging Facebook post of approximately ${targetLength} characters.

Guidelines:
- Conversational and friendly tone
- Use emojis naturally
- Include a call-to-action
- Make it shareable
- Encourage discussion

Content:
${content}

Facebook Post:`,

  rewrite: (content: string, tone: string) => `
Rewrite the following content for Facebook in a ${tone} tone.

Guidelines:
- Community-focused
- Encourage comments and shares
- Clear and accessible
- Include question or CTA

Original content:
${content}

Facebook Post:`,
};

/**
 * Get platform-specific prompt
 */
export function getPrompt(
  platform: Platform,
  operation: 'summarize' | 'rewrite' | 'generateCaption',
  ...args: any[]
): string {
  switch (platform) {
    case Platform.LINKEDIN:
      return linkedInPrompts[operation](...args);
    case Platform.X:
      return xPrompts[operation](...args);
    case Platform.INSTAGRAM:
      return instagramPrompts[operation](...args);
    case Platform.FACEBOOK:
      return facebookPrompts[operation](...args);
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}
