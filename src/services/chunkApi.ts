import apiClient from './apiClient';
import type { ChunkListResponse, ChunkUploadResponse } from '../types/api';

export const chunkApi = {
  async getUploadedChunks(fileId: string): Promise<number[]> {
    const { data } = await apiClient.get<ChunkListResponse>(`/files/${fileId}/chunks`);
    return data.uploadedChunks ?? [];
  },

  async uploadChunk(
    fileId: string,
    index: number,
    blob: Blob,
    onProgress?: (percent: number) => void
  ): Promise<ChunkUploadResponse> {
    const form = new FormData();
    form.append('file', blob);

    const { data } = await apiClient.post<ChunkUploadResponse>(
      `/files/${fileId}/chunks/${index}`,
      form,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        },
      }
    );
    return data;
  },
};