import apiClient from './apiClient';
import type {
  FileInitResponse,
  FileStatusResponse,
  MergeResponse,
} from '../types/api';

export const fileApi = {
  async init(
    originalName: string,
    fileSize: number,
    mimeType: string,
    totalChunks: number,
    checksumSha256: string
  ): Promise<string> {
    const { data } = await apiClient.post<FileInitResponse>('/files/init', {
      originalName,
      fileSize,
      mimeType: mimeType || 'application/octet-stream',
      totalChunks,
      checksumSha256,
    });
    return data.fileId;
  },

  async getStatus(fileId: string): Promise<FileStatusResponse> {
    const { data } = await apiClient.get<FileStatusResponse>(`/files/${fileId}`);
    return data;
  },

  async mergeChunks(fileId: string): Promise<MergeResponse> {
    const { data } = await apiClient.post<MergeResponse>(`/files/${fileId}/merge`);
    return data;
  },

  async deleteFile(fileId: string): Promise<void> {
    await apiClient.delete(`/files/${fileId}`);
  },
};