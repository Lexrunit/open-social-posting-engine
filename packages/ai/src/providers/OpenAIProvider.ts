import {
  AIProvider,
  AIRequest,
  AIResponse,
  AIOperation,
  Platform,
} from '@open-social/core';
import OpenAI from 'openai';
import { getPrompt } from '../prompts';

/**
 * OpenAI Provider Implementation
 */
export class OpenAIProvider implements AIProvider {
  readonly name = 'openai';
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4-turbo-preview') {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async summarize(
    content: string,
    targetLength: number,
    platform?: Platform
  ): Promise<AIResponse> {
    try {
      const prompt = platform
        ? getPrompt(platform, 'summarize', content, targetLength)
        : `Summarize the following content in approximately ${targetLength} characters:\n\n${content}`;

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional social media content writer.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const result = completion.choices[0]?.message?.content?.trim();

      return {
        success: true,
        result: result || content,
        tokensUsed: completion.usage?.total_tokens,
        model: this.model,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async rewrite(
    content: string,
    tone: string,
    targetLength?: number
  ): Promise<AIResponse> {
    try {
      let prompt = `Rewrite the following content in a ${tone} tone`;
      if (targetLength) {
        prompt += ` and approximately ${targetLength} characters`;
      }
      prompt += `:\n\n${content}`;

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional content rewriter.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 500,
      });

      const result = completion.choices[0]?.message?.content?.trim();

      return {
        success: true,
        result: result || content,
        tokensUsed: completion.usage?.total_tokens,
        model: this.model,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async generateCaption(
    imageUrl: string,
    context?: string
  ): Promise<AIResponse> {
    try {
      const prompt = context
        ? `Generate a social media caption for this image. Context: ${context}`
        : 'Generate an engaging social media caption for this image.';

      const completion = await this.client.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        max_tokens: 300,
      });

      const result = completion.choices[0]?.message?.content?.trim();

      return {
        success: true,
        result: result || '',
        tokensUsed: completion.usage?.total_tokens,
        model: 'gpt-4-vision-preview',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async execute(request: AIRequest): Promise<AIResponse> {
    switch (request.operation) {
      case AIOperation.SUMMARIZE:
        return this.summarize(
          request.content,
          request.targetLength || 280,
          request.platform
        );
      case AIOperation.REWRITE:
        return this.rewrite(
          request.content,
          request.tone || 'professional',
          request.targetLength
        );
      case AIOperation.GENERATE_CAPTION:
        return this.generateCaption(request.content, request.metadata?.context);
      default:
        return {
          success: false,
          error: `Unsupported operation: ${request.operation}`,
        };
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch (error) {
      return false;
    }
  }
}
