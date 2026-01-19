import {
  MediaProcessor,
  MediaPreset,
  ProcessedMedia,
  Media,
  MediaType,
  Platform,
  ImageProcessingOptions,
} from '@open-social/core';
import sharp from 'sharp';
import axios from 'axios';
import { getDefaultPreset } from './presets';
import { randomUUID } from 'crypto';

/**
 * Sharp-based media processor implementation
 */
export class SharpMediaProcessor implements MediaProcessor {
  async processImage(
    input: Buffer | string,
    platform: Platform,
    options?: ImageProcessingOptions
  ): Promise<ProcessedMedia> {
    const preset = this.getPreset(platform, MediaType.IMAGE);
    
    // Load image
    let image = sharp(typeof input === 'string' ? await this.downloadImage(input) : input);

    // Get metadata
    const metadata = await image.metadata();

    // Apply processing options or use preset
    const width = options?.width || preset.width;
    const height = options?.height || preset.height;
    const format = (options?.format || preset.format) as 'jpeg' | 'png' | 'webp';
    const quality = options?.quality || preset.quality;

    // Resize image
    image = image.resize(width, height, {
      fit: options?.fit || 'cover',
      background: options?.background || { r: 255, g: 255, b: 255, alpha: 1 },
    });

    // Convert format and apply quality
    switch (format) {
      case 'jpeg':
        image = image.jpeg({ quality });
        break;
      case 'png':
        image = image.png({ quality });
        break;
      case 'webp':
        image = image.webp({ quality });
        break;
    }

    // Get processed buffer
    const buffer = await image.toBuffer();

    // Create media entity
    const media: Media = {
      id: randomUUID(),
      type: MediaType.IMAGE,
      url: '', // Will be set by storage layer
      width,
      height,
      size: buffer.length,
      mimeType: `image/${format}`,
      platform,
      createdAt: new Date(),
    };

    return {
      media,
      buffer,
    };
  }

  validateMedia(
    media: Media,
    platform: Platform
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const preset = this.getPreset(platform, media.type);

    // Check file size
    if (media.size && media.size > preset.maxSize) {
      errors.push(
        `File size ${media.size} exceeds maximum ${preset.maxSize} for ${platform}`
      );
    }

    // Check dimensions for images
    if (media.type === MediaType.IMAGE && media.width && media.height) {
      const aspectRatio = media.width / media.height;

      // Platform-specific aspect ratio checks
      if (platform === Platform.INSTAGRAM) {
        if (aspectRatio < 0.8 || aspectRatio > 1.91) {
          errors.push(
            `Aspect ratio ${aspectRatio.toFixed(2)} is outside Instagram's allowed range (0.8 - 1.91)`
          );
        }
      } else if (platform === Platform.X) {
        if (aspectRatio < 0.33 || aspectRatio > 3) {
          errors.push(
            `Aspect ratio ${aspectRatio.toFixed(2)} is outside X's allowed range (1:3 - 3:1)`
          );
        }
      }
    }

    // Check MIME type
    if (!preset.supportedMediaTypes?.includes(media.mimeType)) {
      const presetKey = `${preset.platform}-${preset.type}`;
      errors.push(
        `MIME type ${media.mimeType} not supported for ${presetKey}`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  getPreset(platform: Platform, type: MediaType): MediaPreset {
    return getDefaultPreset(platform, type);
  }

  async getMetadata(
    input: Buffer | string
  ): Promise<{ width: number; height: number; format: string; size: number }> {
    const buffer = typeof input === 'string' ? await this.downloadImage(input) : input;
    const metadata = await sharp(buffer).metadata();

    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
      size: buffer.length,
    };
  }

  async resize(
    input: Buffer | string,
    width: number,
    height: number,
    options?: ImageProcessingOptions
  ): Promise<Buffer> {
    const buffer = typeof input === 'string' ? await this.downloadImage(input) : input;

    return sharp(buffer)
      .resize(width, height, {
        fit: options?.fit || 'cover',
        background: options?.background || { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .toBuffer();
  }

  async compress(
    input: Buffer | string,
    maxSizeKb: number,
    format: string = 'jpeg'
  ): Promise<Buffer> {
    const buffer = typeof input === 'string' ? await this.downloadImage(input) : input;
    const maxSizeBytes = maxSizeKb * 1024;

    let quality = 90;
    let compressed = buffer;

    // Iteratively reduce quality until size is acceptable
    while (compressed.length > maxSizeBytes && quality > 10) {
      const image = sharp(buffer);

      switch (format) {
        case 'jpeg':
          compressed = await image.jpeg({ quality }).toBuffer();
          break;
        case 'png':
          compressed = await image.png({ quality }).toBuffer();
          break;
        case 'webp':
          compressed = await image.webp({ quality }).toBuffer();
          break;
        default:
          compressed = await image.toBuffer();
      }

      quality -= 10;
    }

    return compressed;
  }

  /**
   * Download image from URL
   */
  private async downloadImage(url: string): Promise<Buffer> {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    });
    return Buffer.from(response.data);
  }
}
