import { AIProvider } from '@open-social/core';
import { OpenAIProvider } from './providers/OpenAIProvider';
import { LocalLLMProvider } from './providers/LocalLLMProvider';

/**
 * AI Service - Factory and manager for AI providers
 */
export class AIService {
  private provider: AIProvider | null = null;

  /**
   * Initialize with OpenAI provider
   */
  static withOpenAI(apiKey: string, model?: string): AIService {
    const service = new AIService();
    service.provider = new OpenAIProvider(apiKey, model);
    return service;
  }

  /**
   * Initialize with local LLM provider
   */
  static withLocalLLM(baseUrl?: string, model?: string): AIService {
    const service = new AIService();
    service.provider = new LocalLLMProvider(baseUrl, model);
    return service;
  }

  /**
   * Initialize with custom provider
   */
  static withProvider(provider: AIProvider): AIService {
    const service = new AIService();
    service.provider = provider;
    return service;
  }

  /**
   * Initialize without AI (pass-through mode)
   */
  static withoutAI(): AIService {
    return new AIService();
  }

  /**
   * Get the current provider
   */
  getProvider(): AIProvider | null {
    return this.provider;
  }

  /**
   * Check if AI is available
   */
  async isAvailable(): Promise<boolean> {
    if (!this.provider) return false;
    return this.provider.isAvailable();
  }
}

export * from './providers/OpenAIProvider';
export * from './providers/LocalLLMProvider';
export * from './prompts';
