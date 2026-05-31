import { create } from 'zustand';

export type UploadPhase =
  | 'idle'
  | 'hashing'
  | 'uploading'
  | 'merging'
  | 'sharing'
  | 'done'
  | 'error';

interface UploadState {
  phase:          UploadPhase;
  isUploading:    boolean;
  progress:       number;
  speedBps:       number;
  etaSeconds:     number;
  chunksUploaded: number;
  totalChunks:    number;
  fileId:         string | null;
  fileName:       string;
  fileSize:       number;
  shareCode:      string | null;
  shareUrl:       string | null;
  error:          string | null;
  isPaused:       boolean;
}

interface UploadActions {
  startUpload:     () => void;
  setUploadInfo:   (info: { fileId: string | null; fileName: string; fileSize: number }) => void;
  updateProgress:  (progress: number) => void;
  updateSpeed:     (speedBps: number, etaSeconds: number) => void;
  updateChunks:    (uploaded: number, total: number) => void;
  setPhase:        (phase: UploadPhase) => void;
  setShareResult:  (code: string, url: string) => void;
  setError:        (error: string) => void;
  pauseUpload:     () => void;
  resumeUpload:    () => void;
  reset:           () => void;
}

const INITIAL: UploadState = {
  phase:          'idle',
  isUploading:    false,
  progress:       0,
  speedBps:       0,
  etaSeconds:     -1,
  chunksUploaded: 0,
  totalChunks:    0,
  fileId:         null,
  fileName:       '',
  fileSize:       0,
  shareCode:      null,
  shareUrl:       null,
  error:          null,
  isPaused:       false,
};

export const useUploadStore = create<UploadState & UploadActions>((set) => ({
  ...INITIAL,

  startUpload: () =>
    set({ ...INITIAL, phase: 'hashing', isUploading: true }),

  setUploadInfo: ({ fileId, fileName, fileSize }) =>
    set({ fileId, fileName, fileSize }),

  updateProgress: (progress) =>
    set({ progress }),

  updateSpeed: (speedBps, etaSeconds) =>
    set({ speedBps, etaSeconds }),

  updateChunks: (chunksUploaded, totalChunks) =>
    set({ chunksUploaded, totalChunks }),

  setPhase: (phase) =>
    set({ phase }),

  setShareResult: (shareCode, shareUrl) =>
    set({ shareCode, shareUrl, phase: 'done', progress: 100 }),

  setError: (error) =>
    set({ error, phase: 'error', isUploading: false }),

  pauseUpload: () =>
    set({ isPaused: true }),

  resumeUpload: () =>
    set({ isPaused: false }),

  reset: () =>
    set({ ...INITIAL }),
}));