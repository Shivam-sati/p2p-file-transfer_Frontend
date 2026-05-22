export interface FileMetadata {
  fileId: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  status: 'INITIALIZING' | 'UPLOADING' | 'MERGING' | 'READY' | 'ERROR' | 'DELETED';
  totalChunks: number;
  uploadedChunks: number;
  createdAt: string;
  expiresAt: string;
}

export interface ChunkInfo {
  chunkIndex: number;
  status: 'UPLOADED' | 'PENDING' | 'ERROR';
  uploadedCount: number;
  totalChunks: number;
}

export interface ShareConfig {
  password?: string;
  expiryHours?: number;
  maxDownloads?: number;
}

export interface ShareInfo {
  code: string;
  shareUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  passwordProtected: boolean;
  maxDownloads?: number;
  downloadCount: number;
  expiresAt: string;
}

export interface AnalyticsDashboard {
  totalUploads: number;
  totalDownloads: number;
  failedUploads: number;
  failedDownloads: number;
  p2pConnections: number;
  p2pFallbacks: number;
  p2pSuccessRatePercent: number;
  avgSpeedBps: number;
  avgSpeedMbps: number;
  peakSpeedBps: number;
  totalBytesUploaded: number;
  totalBytesDownloaded: number;
  transfersByMode: Record<string, number>;
  periodFrom: string;
  periodTo: string;
}

export interface TransferEvent {
  id: string;
  sessionId: string;
  eventType: string;
  bytesAtEvent: number;
  speedBps?: number;
  transferMode?: 'P2P' | 'SERVER';
  errorCode?: string;
  recordedAt: string;
}

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'candidate';
  payload: any;
  senderId: string;
  receiverId: string;
}
