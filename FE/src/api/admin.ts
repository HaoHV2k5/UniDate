import api from "./api";
import type { ApiResponse, Paged, UserCreatePayload, UserResponse, UserUpdatePayload, CommentResponse, LikeResponse } from "@/types/api";

export async function getUsers(): Promise<UserResponse[]> {
  const res = await api.get<ApiResponse<UserResponse[]>>("/api/users");
  return res.data.data ?? [];
}

export async function getUserById(id: number): Promise<UserResponse> {
  const res = await api.get<ApiResponse<UserResponse>>(`/api/users/admin/${id}`);
  return res.data.data;
}

export async function createUser(payload: UserCreatePayload): Promise<UserResponse> {
  const res = await api.post<ApiResponse<UserResponse>>("/api/users/admin", payload);
  return res.data.data;
}

export async function updateUser(id: number, payload: UserUpdatePayload): Promise<UserResponse> {
  const res = await api.put<ApiResponse<UserResponse>>(`/api/users/admin/${id}`, payload);
  return res.data.data;
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete<ApiResponse<void>>(`/api/users/admin/${id}`);
}

// Admin metrics helpers: read totalElements from paged endpoints using size=1
export async function getAdminReactionsCount(): Promise<number> {
  const res = await api.get<ApiResponse<Paged<unknown>>>(
    "/api/post/reactions/history/admin",
    { params: { page: 0, size: 1 } }
  );
  return res.data.data?.totalElements ?? 0;
}

export async function getAdminCommentsCount(): Promise<number> {
  const res = await api.get<ApiResponse<Paged<unknown>>>(
    "/api/post/comments/admin",
    { params: { page: 0, size: 1 } }
  );
  return res.data.data?.totalElements ?? 0;
}

export async function getAdminReactions(page = 0, size = 10): Promise<Paged<LikeResponse>> {
  const res = await api.get<ApiResponse<Paged<LikeResponse>>>("/api/post/reactions/history/admin", { params: { page, size } });
  return res.data.data;
}

export async function getAdminComments(page = 0, size = 10): Promise<Paged<CommentResponse>> {
  const res = await api.get<ApiResponse<Paged<CommentResponse>>>("/api/post/comments/admin", { params: { page, size } });
  return res.data.data;
}

export async function getAdminCommentsByUser(userId: number, page = 0, size = 10): Promise<Paged<CommentResponse>> {
  const res = await api.get<ApiResponse<Paged<CommentResponse>>>(`/api/post/user/${userId}/comments`, { params: { page, size } });
  return res.data.data;
}
