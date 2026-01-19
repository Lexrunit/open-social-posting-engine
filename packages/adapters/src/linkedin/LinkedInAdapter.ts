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
 * LinkedIn Platform Adapter
 */
export class LinkedInAdapter implements PlatformAdapter {
  readonly platform = Platform.LINKEDIN;
  private readonly apiBase = 'https://api.linkedin.com/v2';

  getConstraints(): PlatformConstraints {
    return {
      maxTextLength: 3000,
      maxMediaCount: 9,
      supportedMediaTypes: ['image/jpeg', 'image/png', 'image/gif'],
      maxImageSize: 10 * 1024 * 1024, // 10MB
      maxVideoSize: 200 * 1024 * 1024, // 200MB
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
        author: `urn:li:person:${auth.userId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: platformPost.content,
            },
            shareMediaCategory: platformPost.media.length > 0 ? 'IMAGE' : 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      };

      // Add media if present
      if (platformPost.media.length > 0) {
        payload.specificContent['com.linkedin.ugc.ShareContent'].media =
          platformPost.media.map((m) => ({
            status: 'READY',
            media: m.url,
          }));
      }

      const response = await axios.post(`${this.apiBase}/ugcPosts`, payload, {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
      });

      const postId = response.data.id;
      const postUrl = `https://www.linkedin.com/feed/update/${postId}`;

      return {
        success: true,
        platformPostId: postId,
        platformUrl: postUrl,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async delete(platformPostId: string, auth: PlatformAuth): Promise<boolean> {
    try {
      await axios.delete(`${this.apiBase}/ugcPosts/${platformPostId}`, {
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
      await axios.get(`${this.apiBase}/me`, {
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
    // LinkedIn tokens are long-lived (60 days), but can be refreshed
    if (!auth.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(
        'https://www.linkedin.com/oauth/v2/accessToken',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: auth.refreshToken,
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
