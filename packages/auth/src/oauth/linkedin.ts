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
 * LinkedIn OAuth handler
 */
export class LinkedInOAuth {
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
      scope: this.config.scope.join(' '),
    });

    return `${this.config.authUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCode(code: string): Promise<PlatformAuth> {
    const response = await axios.post(
      this.config.tokenUrl,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // Get user info
    const userResponse = await axios.get('https://api.linkedin.com/v2/me', {
      headers: {
        Authorization: `Bearer ${response.data.access_token}`,
      },
    });

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresAt: new Date(Date.now() + response.data.expires_in * 1000),
      scope: response.data.scope?.split(' '),
      userId: userResponse.data.id,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<PlatformAuth> {
    const response = await axios.post(
      this.config.tokenUrl,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token || refreshToken,
      expiresAt: new Date(Date.now() + response.data.expires_in * 1000),
      scope: response.data.scope?.split(' '),
      userId: '', // Will be set from stored auth
    };
  }
}

/**
 * Factory for LinkedIn OAuth
 */
export function createLinkedInOAuth(): LinkedInOAuth {
  return new LinkedInOAuth({
    clientId: process.env.LINKEDIN_CLIENT_ID || '',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
    redirectUri: process.env.LINKEDIN_REDIRECT_URI || '',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    scope: ['r_liteprofile', 'r_emailaddress', 'w_member_social'],
  });
}
