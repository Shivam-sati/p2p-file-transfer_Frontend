import apiClient from './apiClient';

export const chunkApi = {
  getUploadedChunks: async (fileId: string): Promise<number[]> => {
    try {
      const { data } = await apiClient.get<{ uploadedChunks: number[] }>(`/files/${fileId}/chunks`);
      console.log('Uploaded chunks response:', data);
      return data.uploadedChunks || [];
    } catch (error: any) {
      console.error('Get uploaded chunks error:', error.response?.data);
      return [];
    }
  },

  uploadChunk: async (fileId: string, chunkIndex: number, chunk: Blob, onProgress: (p: number) => void): Promise<void> => {
    const formData = new FormData();
    formData.append('file', chunk);  // Backend expects 'file' not 'chunk'
    
    await apiClient.post(`/files/${fileId}/chunks/${chunkIndex}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        onProgress(percentCompleted);
      },
    });
  },
};
