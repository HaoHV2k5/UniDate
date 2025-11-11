import api from "@/api/api";
import type { Album, ApiResponse, Page, RequestAccessResponse } from "@/types/album";

export async function uploadAlbumImages(userId: number, files: File[]): Promise<Album> {
  const form = new FormData();
  form.append("userId", String(userId));
  for (const f of files) form.append("files", f);
  const res = await api.post<ApiResponse<Album>>("/api/albums/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}

export async function viewAlbum(ownerId: number, requesterId: number): Promise<string[]> {
  const res = await api.get<ApiResponse<string[]>>(`/api/albums/${ownerId}`, {
    params: { requesterId },
  });
  return res.data.data || [];
}

export async function requestAlbumAccess(ownerId: number, requesterId: number): Promise<RequestAccessResponse> {
  const res = await api.post<ApiResponse<RequestAccessResponse>>(
    `/api/albums/${ownerId}/request-access`,
    null,
    { params: { requesterId } }
  );
  return res.data.data;
}

export async function approveAlbumRequest(requestId: number, ownerId: number): Promise<RequestAccessResponse> {
  const res = await api.post<ApiResponse<RequestAccessResponse>>(
    `/api/albums/requests/${requestId}/approve`,
    null,
    { params: { ownerId } }
  );
  return res.data.data;
}

export async function rejectAlbumRequest(requestId: number, ownerId: number): Promise<void> {
  await api.post<ApiResponse<void>>(`/api/albums/requests/${requestId}/reject`, null, { params: { ownerId } });
}

export async function getPendingAlbumRequests(page = 0, size = 10): Promise<Page<RequestAccessResponse>> {
  const res = await api.get<ApiResponse<Page<RequestAccessResponse>>>(`/api/albums/pending`, { params: { page, size } });
  return res.data.data;
}

export async function getApprovedAlbumRequests(page = 0, size = 10): Promise<Page<RequestAccessResponse>> {
  const res = await api.get<ApiResponse<Page<RequestAccessResponse>>>(`/api/albums/approved`, { params: { page, size } });
  return res.data.data;
}

