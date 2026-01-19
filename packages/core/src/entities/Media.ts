import { Platform } from '../value-objects/Platform';

/**
 * Media type enumeration
 */
export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  GIF = 'gif',
}

/**
 * Media entity
 */
export interface Media {
  id: string;
  type: MediaType;
  url: string;
  originalUrl?: string;
  width?: number;
  height?: number;
  size?: number;
  mimeType: string;
  altText?: string;
  platform?: Platform;
  createdAt: Date;
}

/**
 * Media factory
 */
export class MediaFactory {
  static create(data: {
    id: string;
    type: MediaType;
    url: string;
    mimeType: string;
    originalUrl?: string;
    width?: number;
    height?: number;
    size?: number;
    altText?: string;
    platform?: Platform;
  }): Media {
    return {
      ...data,
      createdAt: new Date(),
    };
  }
}
