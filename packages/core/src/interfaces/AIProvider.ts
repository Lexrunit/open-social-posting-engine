import { Platform } from '../value-objects/Platform';

/**
 * AI operation types
 */
export enum AIOperation {
  SUMMARIZE = 'summarize',
  REWRITE = 'rewrite',
  GENERATE_CAPTION = 'generate_caption',
  TRANSLATE = 'translate',
}

/**
 * AI request parameters
 */
export interface AIRequest {
  operation: AIOperation;
  content: string;
  platform?: Platform;
  targetLength?: number;
  tone?: 'professional' | 'casual' | 'friendly' | 'formal';
  language?: string;
  metadata?: Record<string, any>;
}

/**
 * AI response
 */
export interface AIResponse {
  success: boolean;
  result?: string;
  error?: string;
  tokensUsed?: number;
  model?: string;
}

/**
 * Core interface for AI providers
 * Abstracts AI operations from specific providers
 */
export interface AIProvider {
  readonly name: string;

  /**
   * Summarize content for a specific platform
   */
  summarize(
    content: string,
    targetLength: number,
    platform?: Platform
  ): Promise<AIResponse>;

  /**
   * Rewrite content with specified tone and length
   */
  rewrite(
    content: string,
    tone: string,
    targetLength?: number
  ): Promise<AIResponse>;

  /**
   * Generate caption from image URL
   */
  generateCaption(imageUrl: string, context?: string): Promise<AIResponse>;

  /**
   * Execute generic AI operation
   */
  execute(request: AIRequest): Promise<AIResponse>;

  /**
   * Check if provider is available and configured
   */
  isAvailable(): Promise<boolean>;
}
