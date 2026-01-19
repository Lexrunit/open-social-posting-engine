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
 * Instagram Platform Adapter (via Meta Graph API)
 */
export class InstagramAdapter implements PlatformAdapter {
  readonly platform = Platform.INSTAGRAM;
  private readonly apiBase = 'https://graph.facebook.com/v18.0';

  getConstraints(): PlatformConstraints {
    return {
      maxTextLength: 2200,
      maxMediaCount: 10,
      supportedMediaTypes: ['image/jpeg', 'image/png', 'video/mp4'],
      maxImageSize: 8 * 1024 * 1024, // 8MB
      maxVideoSize: 100 * 1024 * 1024, // 100MB
      imageAspectRatios: {
        min: 0.8, // 4:5
        max: 1.91, // 1.91:1
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

    if (mediaCount === 0) {
      errors.push('Instagram requires at least one media item');
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
      if (platformPost.media.length === 0) {
        return {
          success: false,
          error: 'Instagram requires at least one media item',
        };
      }

      // Step 1: Create container
      const containerPayload: any = {
        image_url: platformPost.media[0].url,
        caption: platformPost.content,
        access_token: auth.accessToken,
      };

      const containerResponse = await axios.post(
        `${this.apiBase}/${auth.userId}/media`,
        containerPayload
      );

      const containerId = containerResponse.data.id;

      // Step 2: Publish container
      const publishResponse = await axios.post(
        `${this.apiBase}/${auth.userId}/media_publish`,
        {
          creation_id: containerId,
          access_token: auth.accessToken,
        }
      );

      return {
        success: true,
        platformPostId: publishResponse.data.id,
        platformUrl: `https://www.instagram.com/p/${publishResponse.data.id}`,
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
      await axios.get(`${this.apiBase}/${auth.userId}`, {
        params: {
          fields: 'id,username',
          access_token: auth.accessToken,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async refreshAuth(auth: PlatformAuth): Promise<PlatformAuth> {
    // Instagram uses Facebook's auth, so refresh the same way
    try {
      const response = await axios.get(`${this.apiBase}/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: process.env.INSTAGRAM_APP_ID,
          client_secret: process.env.INSTAGRAM_APP_SECRET,
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
