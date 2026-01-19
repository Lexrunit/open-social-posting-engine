import {
  PlatformAdapter,
  PlatformAuth,
  PlatformConstraints,
  PublishResult,
  Platform,
  PlatformPost,
} from '@open-social/core';
import axios from 'axios';

/**
 * X (Twitter) Platform Adapter
 */
export class XAdapter implements PlatformAdapter {
  readonly platform = Platform.X;
  private readonly apiBase = 'https://api.twitter.com/2';

  getConstraints(): PlatformConstraints {
    return {
      maxTextLength: 280,
      maxMediaCount: 4,
      supportedMediaTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
      maxImageSize: 5 * 1024 * 1024, // 5MB
      maxVideoSize: 512 * 1024 * 1024, // 512MB
      imageAspectRatios: {
        min: 1 / 3,
        max: 3 / 1,
      },
    };
  }

  validateContent(
    content: string,
    mediaCount: number
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const constraints = this.getConstraints();

    if (content.length > constraints.maxTextLength) {
      errors.push(
        `Content exceeds maximum length of ${constraints.maxTextLength} characters`
      );
    }

    if (mediaCount > constraints.maxMediaCount) {
      errors.push(
        `Media count exceeds maximum of ${constraints.maxMediaCount}`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async publish(
    platformPost: PlatformPost,
    auth: PlatformAuth
  ): Promise<PublishResult> {
    try {
      const payload: any = {
        text: platformPost.content,
      };

      // Add media if present
      if (platformPost.media.length > 0) {
        payload.media = {
          media_ids: platformPost.media.map((m) => m.id),
        };
      }

      const response = await axios.post(`${this.apiBase}/tweets`, payload, {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        success: true,
        platformPostId: response.data.data.id,
        platformUrl: `https://twitter.com/i/web/status/${response.data.data.id}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
      };
    }
  }

  async delete(platformPostId: string, auth: PlatformAuth): Promise<boolean> {
    try {
      await axios.delete(`${this.apiBase}/tweets/${platformPostId}`, {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async verifyAuth(auth: PlatformAuth): Promise<boolean> {
    try {
      await axios.get(`${this.apiBase}/users/me`, {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async refreshAuth(auth: PlatformAuth): Promise<PlatformAuth> {
    // X uses OAuth 2.0 with refresh tokens
    if (!auth.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(
        'https://api.twitter.com/2/oauth2/token',
        new URLSearchParams({
          refresh_token: auth.refreshToken,
          grant_type: 'refresh_token',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return {
        ...auth,
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || auth.refreshToken,
        expiresAt: new Date(Date.now() + response.data.expires_in * 1000),
      };
    } catch (error: any) {
      throw new Error(`Failed to refresh auth: ${error.message}`);
    }
  }
}
