/**
 * Example: Schedule Post with Media
 * 
 * This example demonstrates scheduling a post with images for future publishing.
 */

import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
  headers: {
    Authorization: 'Bearer osp_your_api_key_here',
  },
});

const SCHEDULE_POST = gql`
  mutation SchedulePost($input: SchedulePostInput!) {
    schedulePost(input: $input) {
      id
      content
      status
      schedule {
        scheduledAt
        timezone
        isScheduled
      }
      media {
        url
        type
      }
      createdAt
    }
  }
`;

async function schedulePost() {
  try {
    // Schedule post for tomorrow at 9 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const result = await client.mutate({
      mutation: SCHEDULE_POST,
      variables: {
        input: {
          content: `Monday motivation! 💪
          
Here's what I learned this week about building scalable systems.

#mondaymotivation #tech #learning`,
          platforms: ['LINKEDIN', 'X', 'INSTAGRAM'],
          scheduledAt: tomorrow.toISOString(),
          timezone: 'America/New_York',
          mediaUrls: [
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg',
          ],
          aiOptions: {
            summarize: true,
            rewrite: true,
            tone: 'friendly',
          },
          metadata: {
            campaign: 'monday-series',
            tags: ['motivation', 'tech'],
          },
        },
      },
    });

    console.log('Post scheduled:', result.data.schedulePost);
    console.log('Will publish at:', result.data.schedulePost.schedule.scheduledAt);
  } catch (error) {
    console.error('Error scheduling post:', error);
  }
}

schedulePost();
