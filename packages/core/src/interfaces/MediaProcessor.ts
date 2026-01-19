import { Platform } from '../value-objects/Platform';
import { Media, MediaType } from '../entities/Media';

/**
 * Image processing operations
 */
export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  format?: 'jpeg' | 'png' | 'webp';
  quality?: number;
  background?: string;
}

/**
 * Platform-specific media presets
 */
export interface MediaPreset {
  platform: Platform;
  type: MediaType;
  width: number;
  height: number;
  format: string;
  quality: number;
  maxSize: number;
}

/**
 * Media processing result
 */
export interface ProcessedMedia {
  media: Media;
  buffer?: Buffer;
  url?: string;
}

/**
 * Core interface for media processing
 */
export interface MediaProcessor {
  /**
   * Process image according to platform requirements
   */
  processImage(
    input: Buffer | string,
    platform: Platform,
    options?: ImageProcessingOptions
  ): Promise<ProcessedMedia>;

  /**
   * Validate media meets platform constraints
   */
  validateMedia(
    media: Media,
    platform: Platform
  ): {
    valid: boolean;
    errors: string[];
  };

  /**
   * Get platform-specific media preset
   */
  getPreset(platform: Platform, type: MediaType): MediaPreset;

  /**
   * Extract metadata from image
   */
  getMetadata(input: Buffer | string): Promise<{
    width: number;
    height: number;
    format: string;
    size: number;
  }>;

  /**
   * Resize image to specific dimensions
   */
  resize(
    input: Buffer | string,
    width: number,
    height: number,
    options?: ImageProcessingOptions
  ): Promise<Buffer>;

  /**
   * Compress image to target size
   */
  compress(
    input: Buffer | string,
    maxSizeKb: number,
    format?: string
  ): Promise<Buffer>;
}
