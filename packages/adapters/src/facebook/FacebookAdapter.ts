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
 * Facebook Platform Adapter
 */
export class FacebookAdapter implements PlatformAdapter {
  readonly platform = Platform.FACEBOOK;
  private readonly apiBase = 'https://graph.facebook.com/v18.0';

  getConstraints(): PlatformConstraints {
    return {
      maxTextLength: 63206,
      maxMediaCount: 1,
      supportedMediaTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
      maxImageSize: 10 * 1024 * 1024, // 10MB
      maxVideoSize: 1024 * 1024 * 1024, // 1GB
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
        message: platformPost.content,
        access_token: auth.accessToken,
      };

      // Add media if present
      if (platformPost.media.length > 0) {
        payload.url = platformPost.media[0].url;
      }

      const endpoint = platformPost.media.length > 0 ? 'photos' : 'feed';

      const response = await axios.post(
        `${this.apiBase}/${auth.userId}/${endpoint}`,
        payload
      );

      return {
        success: true,
        platformPostId: response.data.id,
        platformUrl: `https://facebook.com/${response.data.id}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  async delete(platformPostId: string, auth: PlatformAuth): Promise<boolean> {
    try {
      await axios.delete(`${this.apiBase}/${platformPostId}`, {
        params: {
          access_token: auth.accessToken,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async verifyAuth(auth: PlatformAuth): Promise<boolean> {
    try {
      await axios.get(`${this.apiBase}/me`, {
        params: {
          access_token: auth.accessToken,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async refreshAuth(auth: PlatformAuth): Promise<PlatformAuth> {
    // Facebook long-lived tokens can be exchanged for new ones
    try {
      const response = await axios.get(`${this.apiBase}/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          fb_exchange_token: auth.accessToken,
        },
      });

      return {
        ...auth,
        accessToken: response.data.access_token,
        expiresAt: new Date(Date.now() + response.data.expires_in * 1000),
      };
    } catch (error: any) {
      throw new Error(`Failed to refresh auth: ${error.message}`);
    }
  }
}
