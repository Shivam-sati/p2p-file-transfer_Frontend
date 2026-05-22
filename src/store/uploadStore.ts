import { create } from 'zustand';

interface UploadState {
  fileId: string | null;
  fileName: string | null;
  fileSize: number;
  progress: number;
  isUploading: boolean;
  isPaused: boolean;
  error: string | null;
  
  setUploadInfo: (info: { fileId: string; fileName: string; fileSize: number }) => void;
  updateProgress: (progress: number) => void;
  startUpload: () => void;
  pauseUpload: () => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  fileId: null,
  fileName: null,
  fileSize: 0,
  progress: 0,
  isUploading: false,
  isPaused: false,
  error: null,

  setUploadInfo: (info) => set(info),
  updateProgress: (progress) => set({ progress }),
  startUpload: () => set({ isUploading: true, isPaused: false, error: null }),
  pauseUpload: () => set({ isUploading: false, isPaused: true }),
  setError: (error) => set({ error, isUploading: false }),
  reset: () => set({ fileId: null, fileName: null, fileSize: 0, progress: 0, isUploading: false, isPaused: false, error: null }),
}));
