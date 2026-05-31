import apiClient from './apiClient';
import type { ShareInfoResponse, ShareCreateRequest } from '../types/api';

export const shareApi = {
  async createShare(
    fileId: string,
    options: ShareCreateRequest = { expiryHours: 72 }
  ): Promise<ShareInfoResponse> {
    const { data } = await apiClient.post<ShareInfoResponse>(
      `/files/${fileId}/share`,
      options
    );
    return data;
  },

  async resolveShare(code: string): Promise<ShareInfoResponse> {
    const { data } = await apiClient.get<ShareInfoResponse>(`/share/${code}`);
    return data;
  },

  getDownloadUrl(code: string): string {
    return `/api/v1/share/${code}/download`;
  },
};