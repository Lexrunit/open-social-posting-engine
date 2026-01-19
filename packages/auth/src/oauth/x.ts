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
 * X (Twitter) OAuth 2.0 handler
 */
export class XOAuth {
  constructor(private config: OAuthConfig) {}

  /**
   * Get authorization URL with PKCE
   */
  getAuthUrl(state: string, codeChallenge: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      state,
      scope: this.config.scope.join(' '),
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return `${this.config.authUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCode(
    code: string,
    codeVerifier: string
  ): Promise<PlatformAuth> {
    const response = await axios.post(
      this.config.tokenUrl,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: this.config.clientId,
        redirect_uri: this.config.redirectUri,
        code_verifier: codeVerifier,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // Get user info
    const userResponse = await axios.get('https://api.twitter.com/2/users/me', {
      headers: {
        Authorization: `Bearer ${response.data.access_token}`,
      },
    });

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresAt: new Date(Date.now() + response.data.expires_in * 1000),
      scope: response.data.scope?.split(' '),
      userId: userResponse.data.data.id,
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
 * Factory for X OAuth
 */
export function createXOAuth(): XOAuth {
  return new XOAuth({
    clientId: process.env.X_CLIENT_ID || '',
    clientSecret: process.env.X_CLIENT_SECRET || '',
    redirectUri: process.env.X_REDIRECT_URI || '',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
  });
}
