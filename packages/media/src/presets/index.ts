import { Platform, MediaType, MediaPreset } from '@open-social/core';

/**
 * Platform-specific media presets
 */
export const presets: Record<string, MediaPreset> = {
  // LinkedIn presets
  'linkedin-image': {
    platform: Platform.LINKEDIN,
    type: MediaType.IMAGE,
    width: 1200,
    height: 627,
    format: 'jpeg',
    quality: 85,
    maxSize: 10 * 1024 * 1024,
  },
  'linkedin-square': {
    platform: Platform.LINKEDIN,
    type: MediaType.IMAGE,
    width: 1080,
    height: 1080,
    format: 'jpeg',
    quality: 85,
    maxSize: 10 * 1024 * 1024,
  },

  // X (Twitter) presets
  'x-image': {
    platform: Platform.X,
    type: MediaType.IMAGE,
    width: 1200,
    height: 675,
    format: 'jpeg',
    quality: 85,
    maxSize: 5 * 1024 * 1024,
  },
  'x-square': {
    platform: Platform.X,
    type: MediaType.IMAGE,
    width: 1080,
    height: 1080,
    format: 'jpeg',
    quality: 85,
    maxSize: 5 * 1024 * 1024,
  },

  // Instagram presets
  'instagram-square': {
    platform: Platform.INSTAGRAM,
    type: MediaType.IMAGE,
    width: 1080,
    height: 1080,
    format: 'jpeg',
    quality: 90,
    maxSize: 8 * 1024 * 1024,
  },
  'instagram-portrait': {
    platform: Platform.INSTAGRAM,
    type: MediaType.IMAGE,
    width: 1080,
    height: 1350,
    format: 'jpeg',
    quality: 90,
    maxSize: 8 * 1024 * 1024,
  },
  'instagram-landscape': {
    platform: Platform.INSTAGRAM,
    type: MediaType.IMAGE,
    width: 1080,
    height: 566,
    format: 'jpeg',
    quality: 90,
    maxSize: 8 * 1024 * 1024,
  },

  // Facebook presets
  'facebook-image': {
    platform: Platform.FACEBOOK,
    type: MediaType.IMAGE,
    width: 1200,
    height: 630,
    format: 'jpeg',
    quality: 85,
    maxSize: 10 * 1024 * 1024,
  },
  'facebook-square': {
    platform: Platform.FACEBOOK,
    type: MediaType.IMAGE,
    width: 1080,
    height: 1080,
    format: 'jpeg',
    quality: 85,
    maxSize: 10 * 1024 * 1024,
  },
};

/**
 * Get default preset for platform and media type
 */
export function getDefaultPreset(
  platform: Platform,
  type: MediaType
): MediaPreset {
  const key = `${platform}-${type}`;
  return presets[key] || presets[`${platform}-image`];
}

/**
 * Get all presets for a platform
 */
export function getPlatformPresets(platform: Platform): MediaPreset[] {
  return Object.values(presets).filter((p) => p.platform === platform);
}
