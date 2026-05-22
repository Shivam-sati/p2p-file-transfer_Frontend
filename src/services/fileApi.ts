import apiClient from './apiClient';
import { FileMetadata } from '../types/api';

export const fileApi = {
  init: async (name: string, size: number, type: string, totalChunks: number, checksumSha256: string): Promise<string> => {
    try {
      const { data } = await apiClient.post<{ fileId: string }>('/files/init', {
        originalName: name,
        fileSize: size,
        mimeType: type,
        totalChunks,
        checksumSha256
      });
      return data.fileId;
    } catch (error: any) {
      console.error('File init error:', error.response?.data);
      console.error('Request payload:', { originalName: name, fileSize: size, mimeType: type, totalChunks, checksumSha256 });
      throw error;
    }
  },

  getMetadata: async (fileId: string): Promise<FileMetadata> => {
    const { data } = await apiClient.get<FileMetadata>(`/files/${fileId}`);
    return data;
  },

  deleteFile: async (fileId: string): Promise<void> => {
    await apiClient.delete(`/files/${fileId}`);
  },

  mergeChunks: async (fileId: string): Promise<void> => {
    await apiClient.post(`/files/${fileId}/merge`);
  },
};
