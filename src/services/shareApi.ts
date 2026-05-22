import apiClient from './apiClient';
import { ShareConfig, ShareInfo } from '../types/api';

export const shareApi = {
  createShare: async (fileId: string, config: ShareConfig): Promise<ShareInfo> => {
    const { data } = await apiClient.post<ShareInfo>(`/files/${fileId}/share`, config);
    return data;
  },

  validateCode: async (code: string, password?: string): Promise<ShareInfo> => {
    const { data } = await apiClient.get<ShareInfo>(`/share/${code}`, {
      params: password ? { password } : {},
    });
    return data;
  },

  getDownloadUrl: (code: string) => `/api/v1/share/${code}/download`,
};
