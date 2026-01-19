import {
  AIProvider,
  AIRequest,
  AIResponse,
  AIOperation,
  Platform,
} from '@open-social/core';
import axios from 'axios';
import { getPrompt } from '../prompts';

/**
 * Local LLM Provider (e.g., Ollama, LocalAI)
 * Compatible with OpenAI-style APIs
 */
export class LocalLLMProvider implements AIProvider {
  readonly name = 'local-llm';
  private baseUrl: string;
  private model: string;

  constructor(baseUrl: string = 'http://localhost:11434', model: string = 'llama2') {
    this.baseUrl = baseUrl;
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

      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: this.model,
        prompt,
        stream: false,
      });

      return {
        success: true,
        result: response.data.response.trim(),
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

      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: this.model,
        prompt,
        stream: false,
      });

      return {
        success: true,
        result: response.data.response.trim(),
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
        ? `Generate a social media caption for an image. Context: ${context}`
        : 'Generate an engaging social media caption.';

      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: this.model,
        prompt,
        stream: false,
      });

      return {
        success: true,
        result: response.data.response.trim(),
        model: this.model,
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
      const response = await axios.get(`${this.baseUrl}/api/tags`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}
