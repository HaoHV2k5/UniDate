export interface ApiResponse<T> {
  code: number;
  message?: string;
  data: T;
}
export interface Album {
  id?: number;
  userId?: number;
  imageUrls: string[];
}
export interface UserSummary {
  id?: number;
  username?: string;
  fullName?: string;
  email?: string;
  avatar?: string;
}
export interface RequestAccessResponse {
  id: number;
  requester: UserSummary;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface Page<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
