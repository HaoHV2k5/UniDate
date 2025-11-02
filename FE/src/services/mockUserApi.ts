import { mockPosts, Post } from "@/data/mockPosts";
import { mockUsers, UserProfile } from "@/data/mockUserData";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Get user posts
export const fetchUserPosts = async (
  userId: string,
  page: number = 0,
  size: number = 10
): Promise<Post[]> => {
  await delay(600);

  // Filter posts by userId
  const userPosts = mockPosts.filter((post) => post.author.id === userId);
  const start = page * size;
  const end = start + size;

  return userPosts.slice(start, end);
};

// Delete post
export const deletePost = async (postId: number): Promise<{ success: boolean }> => {
  await delay(400);

  // Mock success
  return { success: true };
};

// Update user privacy
export const updateUserVisibility = async (
  userId: string,
  isPrivate: boolean
): Promise<UserProfile> => {
  await delay(500);

  const user = mockUsers[userId];
  if (user) {
    user.isPrivate = isPrivate;
    return user;
  }

  throw new Error("User not found");
};
