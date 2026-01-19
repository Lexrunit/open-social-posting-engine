import { Platform, PlatformAuth } from '@open-social/core';
import axios from 'axios';

/**
 * OAuth configuration for a platform
 */
export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authUrl: string;
  tokenUrl: string;
  scope: string[];
}

/**
 * Meta (Facebook/Instagram) OAuth handler
 */
export class MetaOAuth {
  constructor(private config: OAuthConfig) {}

  /**
   * Get authorization URL
   */
  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      state,
      scope: this.config.scope.join(','),
    });

    return `${this.config.authUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCode(code: string): Promise<PlatformAuth> {
    const response = await axios.get(this.config.tokenUrl, {
      params: {
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
        code,
      },
    });

    // Exchange for long-lived token
    const longLivedResponse = await axios.get(
      'https://graph.facebook.com/v18.0/oauth/access_token',
      {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          fb_exchange_token: response.data.access_token,
        },
      }
    );

    // Get user info
    const userResponse = await axios.get(
      'https://graph.facebook.com/v18.0/me',
      {
        params: {
          access_token: longLivedResponse.data.access_token,
        },
      }
    );

    return {
      accessToken: longLivedResponse.data.access_token,
      expiresAt: new Date(
        Date.now() + longLivedResponse.data.expires_in * 1000
      ),
      userId: userResponse.data.id,
    };
  }
}

/**
 * Factory for Facebook OAuth
 */
export function createFacebookOAuth(): MetaOAuth {
  return new MetaOAuth({
    clientId: process.env.FACEBOOK_APP_ID || '',
    clientSecret: process.env.FACEBOOK_APP_SECRET || '',
    redirectUri: process.env.FACEBOOK_REDIRECT_URI || '',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    scope: ['pages_manage_posts', 'pages_read_engagement'],
  });
}

/**
 * Factory for Instagram OAuth
 */
export function createInstagramOAuth(): MetaOAuth {
  return new MetaOAuth({
    clientId: process.env.INSTAGRAM_APP_ID || '',
    clientSecret: process.env.INSTAGRAM_APP_SECRET || '',
    redirectUri: process.env.INSTAGRAM_REDIRECT_URI || '',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    scope: [
      'instagram_basic',
      'instagram_content_publish',
      'pages_read_engagement',
    ],
  });
}
