import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './schema/resolvers';
import { Platform } from '@open-social/core';
import {
  XAdapter,
  LinkedInAdapter,
  FacebookAdapter,
  InstagramAdapter,
} from '@open-social/adapters';
import { AIService } from '@open-social/ai';
import { SharpMediaProcessor } from '@open-social/media';
import { PostQueue } from '@open-social/queue';
import { APIKeyManager } from '@open-social/auth';
import { createDatabaseClientFromEnv, PostRepository } from '@open-social/db';
import { InMemoryEventBus, WebhookManager } from '@open-social/events';

// Load environment variables
config();

/**
 * Initialize services
 */
function initializeServices() {
  // Initialize platform adapters
  const adapters = new Map([
    [Platform.X, new XAdapter()],
    [Platform.LINKEDIN, new LinkedInAdapter()],
    [Platform.FACEBOOK, new FacebookAdapter()],
    [Platform.INSTAGRAM, new InstagramAdapter()],
  ]);

  // Initialize AI service
  const aiService = process.env.OPENAI_API_KEY
    ? AIService.withOpenAI(
        process.env.OPENAI_API_KEY,
        process.env.OPENAI_MODEL
      )
    : AIService.withoutAI();

  // Initialize media processor
  const mediaProcessor = new SharpMediaProcessor();

  // Initialize queue
  const queue = new PostQueue({
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    },
  });

  // Initialize auth
  const apiKeyManager = new APIKeyManager();

  // Initialize database
  const dbClient = createDatabaseClientFromEnv();
  const postRepository = new PostRepository(
    dbClient,
    process.env.APPWRITE_DATABASE_ID || ''
  );

  // Initialize event bus
  const eventBus = new InMemoryEventBus();
  const webhookManager = new WebhookManager();

  // Connect event bus to webhooks
  Object.values(Platform).forEach((platform) => {
    eventBus.on('post.published' as any, async (event) => {
      await webhookManager.deliverToAll(event);
    });
  });

  return {
    adapters,
    aiService,
    mediaProcessor,
    queue,
    apiKeyManager,
    postRepository,
    eventBus,
    webhookManager,
  };
}

/**
 * Create context for GraphQL resolvers
 */
function createContext(services: any) {
  return async ({ req }: { req: express.Request }) => {
    // Extract authentication
    const authHeader = req.headers.authorization;
    let user = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');

      // Try API key
      const apiKeyResult = services.apiKeyManager.validateKey(token);
      if (apiKeyResult.valid) {
        user = { id: apiKeyResult.userId };
      } else {
        // Try JWT
        const jwtResult = services.apiKeyManager.verifyJWT(token);
        if (jwtResult.valid) {
          user = { id: jwtResult.userId };
        }
      }
    }

    return {
      user,
      ...services,
    };
  };
}

/**
 * Main application entry point
 */
async function main() {
  const app = express();
  const port = parseInt(process.env.API_PORT || '4000');

  // Initialize services
  const services = initializeServices();

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  // Apply middleware
  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server, {
      context: createContext(services),
    })
  );

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Start server
  app.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
    console.log(`📊 Health check at http://localhost:${port}/health`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await services.queue.close();
    process.exit(0);
  });
}

// Run the application
main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
