export const typeDefs = `#graphql
  type Query {
    post(id: ID!): Post
    posts(userId: ID!, limit: Int): [Post!]!
    me: User
  }

  type Mutation {
    createPost(input: CreatePostInput!): Post!
    schedulePost(input: SchedulePostInput!): Post!
    cancelPost(id: ID!): Boolean!
    deletePost(id: ID!): Boolean!
  }

  type Post {
    id: ID!
    userId: ID!
    content: String!
    originalContent: String
    media: [Media!]!
    status: PostStatus!
    platformPosts: [PlatformPost!]!
    schedule: Schedule
    metadata: JSON
    createdAt: String!
    updatedAt: String!
  }

  type PlatformPost {
    id: ID!
    postId: ID!
    platform: Platform!
    content: String!
    media: [Media!]!
    status: PostStatus!
    platformPostId: String
    platformUrl: String
    error: String
    publishedAt: String
    createdAt: String!
    updatedAt: String!
  }

  type Media {
    id: ID!
    type: MediaType!
    url: String!
    originalUrl: String
    width: Int
    height: Int
    size: Int
    mimeType: String!
    altText: String
    platform: Platform
    createdAt: String!
  }

  type Schedule {
    scheduledAt: String
    timezone: String!
    isImmediate: Boolean!
    isScheduled: Boolean!
  }

  type User {
    id: ID!
    email: String!
    name: String
    createdAt: String!
  }

  input CreatePostInput {
    content: String!
    platforms: [Platform!]!
    mediaUrls: [String!]
    aiOptions: AIOptionsInput
    metadata: JSON
  }

  input SchedulePostInput {
    content: String!
    platforms: [Platform!]!
    scheduledAt: String!
    timezone: String
    mediaUrls: [String!]
    aiOptions: AIOptionsInput
    metadata: JSON
  }

  input AIOptionsInput {
    summarize: Boolean
    rewrite: Boolean
    tone: String
  }

  enum Platform {
    LINKEDIN
    X
    FACEBOOK
    INSTAGRAM
  }

  enum PostStatus {
    DRAFT
    SCHEDULED
    QUEUED
    PUBLISHING
    PUBLISHED
    FAILED
    CANCELLED
  }

  enum MediaType {
    IMAGE
    VIDEO
    GIF
  }

  scalar JSON
`;
