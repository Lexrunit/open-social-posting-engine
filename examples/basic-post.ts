/**
 * Example: Basic Post Creation
 * 
 * This example shows how to create and publish a post to multiple platforms.
 */

import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
  headers: {
    Authorization: 'Bearer osp_your_api_key_here',
  },
});

const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      content
      status
      platformPosts {
        platform
        status
        platformUrl
      }
      createdAt
    }
  }
`;

async function createPost() {
  try {
    const result = await client.mutate({
      mutation: CREATE_POST,
      variables: {
        input: {
          content: `Just shipped a new feature! 🚀
          
Check it out and let me know what you think.

#development #coding #tech`,
          platforms: ['LINKEDIN', 'X'],
          aiOptions: {
            summarize: true,
            tone: 'professional',
          },
        },
      },
    });

    console.log('Post created:', result.data.createPost);
  } catch (error) {
    console.error('Error creating post:', error);
  }
}

createPost();
