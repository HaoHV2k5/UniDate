export interface ApiResponse<T> {
  code: number;
  message?: string;
  data: T;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  phone?: string;
  fullName?: string;
  gender?: string;
  // BE formats as dd/MM/yyyy; keep as string for display
  yob?: string;
  avatar?: string;
  address?: string;
}

export interface UserCreatePayload {
  username: string; // also used as email on BE
  password: string;
  confirmPassword: string;
  fullName?: string;
  gender?: string;
  role?: string; // default USER on BE if missing
}

export interface UserUpdatePayload {
  fullName?: string;
  gender?: string;
  role?: string;
}

// Minimal Spring Page shape we rely on for counts
export interface Paged<T> {
  content: T[];
  totalElements: number;
  // optional extras from Spring that we ignore in FE logic
  totalPages?: number;
  size?: number;
  number?: number;
}

export interface CommentResponse {
  id: number;
  content: string;
  createdAt: string; // LocalDateTime serialized
  userId: number;
  userName: string;
  avatar?: string;
  imageUrls?: string[];
}

export interface LikeResponse {
  id: number;
  title: string;
  ownerPost: string;
  createdAt: string;
  updatedAt?: string;
}
