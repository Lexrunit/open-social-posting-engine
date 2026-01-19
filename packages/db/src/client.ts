import { Client } from 'node-appwrite';

/**
 * Database configuration
 */
export interface DatabaseConfig {
  endpoint: string;
  projectId: string;
  apiKey: string;
  databaseId: string;
}

/**
 * Initialize Appwrite client
 */
export function createDatabaseClient(config: DatabaseConfig): Client {
  const client = new Client();

  client
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setKey(config.apiKey);

  return client;
}

/**
 * Create database client from environment
 */
export function createDatabaseClientFromEnv(): Client {
  return createDatabaseClient({
    endpoint: process.env.APPWRITE_ENDPOINT || '',
    projectId: process.env.APPWRITE_PROJECT_ID || '',
    apiKey: process.env.APPWRITE_API_KEY || '',
    databaseId: process.env.APPWRITE_DATABASE_ID || '',
  });
}
