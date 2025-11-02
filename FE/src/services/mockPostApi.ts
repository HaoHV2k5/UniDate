import { mockPosts, generateMorePosts, Post } from "@/data/mockPosts";

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchPosts = async (lastId?: number, size: number = 10): Promise<Post[]> => {
  // Simulate network delay
  await delay(800);

  if (!lastId) {
    // Return first batch
    return mockPosts.slice(0, size);
  }

  // Return next batch after lastId
  const lastIndex = mockPosts.findIndex((post) => post.id === lastId);
  
  if (lastIndex === -1 || lastIndex === mockPosts.length - 1) {
    // Generate more posts if we've run out
    const newPosts = generateMorePosts(lastId + 1, size);
    return newPosts;
  }

  const nextPosts = mockPosts.slice(lastIndex + 1, lastIndex + 1 + size);
  
  // If we don't have enough posts, generate more
  if (nextPosts.length < size) {
    const additional = generateMorePosts(
      mockPosts[mockPosts.length - 1].id + 1,
      size - nextPosts.length
    );
    return [...nextPosts, ...additional];
  }

  return nextPosts;
};
