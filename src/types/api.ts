export interface FileInitRequest {
  originalName:   string;
  fileSize:       number;
  mimeType:       string;
  totalChunks:    number;
  checksumSha256: string;
}

export interface FileInitResponse {
  fileId:         string;
  chunkSizeBytes: number;
  totalChunks:    number;
  status:         FileStatus;
  uploadedChunks: number[];
}

export interface FileStatusResponse {
  fileId:         string;
  originalName:   string;
  fileSize:       number;
  mimeType:       string;
  status:         FileStatus;
  totalChunks:    number;
  uploadedChunks: number;
  createdAt:      string;
  expiresAt:      string | null;
}

export interface ChunkUploadResponse {
  chunkIndex:    number;
  status:        string;
  uploadedCount: number;
  totalChunks:   number;
}

export interface ChunkListResponse {
  fileId:         string;
  uploadedChunks: number[];
  totalChunks:    number;
  status:         FileStatus;
}

export interface MergeResponse {
  fileId:   string;
  status:   string;
  message:  string;
}

export type FileStatus = 'UPLOADING' | 'MERGING' | 'READY' | 'FAILED' | 'DELETED';


export interface ShareCreateRequest {
  expiryHours?:  number;
  maxDownloads?: number;
  password?:     string;
}

export interface ShareInfoResponse {
  code:              string;
  shareUrl:          string;
  fileName:          string;
  fileSize:          number;
  mimeType:          string;
  passwordProtected: boolean;
  maxDownloads:      number | null;
  downloadCount:     number;
  expiresAt:         string | null;
}

export interface AnalyticsDashboardResponse {
  totalUploads:          number;
  totalDownloads:        number;
  failedUploads:         number;
  failedDownloads:       number;
  p2pConnections:        number;
  p2pFallbacks:          number;
  p2pSuccessRatePercent: number;
  avgSpeedBps:           number;
  avgSpeedMbps:          number;
  peakSpeedBps:          number;
  totalBytesUploaded:    number;
  totalBytesDownloaded:  number;
  transfersByMode:       Record<string, number>;
  periodFrom:            string;
  periodTo:              string;
}

export interface AnalyticsEventResponse {
  id:           string;
  sessionId:    string | null;
  eventType:    string;
  bytesAtEvent: number;
  speedBps:     number | null;
  transferMode: string | null;
  errorCode:    string | null;
  recordedAt:   string;
}

export type AnalyticsRange = '1h' | '24h' | '7d' | '30d';


export interface P2PStatusResponse {
  p2pAvailable: boolean;
  peerCount:    number;
  fileId:       string;
}


export interface ProgressEvent {
  fileId:          string;
  direction:       'UPLOAD' | 'DOWNLOAD';
  status:          'ACTIVE' | 'MERGING' | 'COMPLETE' | 'FAILED';
  bytesTransferred: number;
  totalBytes:       number;
  percentComplete:  number;
  speedBps:         number;
  etaSeconds:       number;
  chunksUploaded:   number;
  totalChunks:      number;
  message:          string;
}


export interface SignalingMessage {
  type:        string;
  roomId:      string;
  fromPeerId:  string;
  toPeerId:    string | null;
  payload:     string | null;
}
export interface ApiError {
  type:      string;
  title:     string;
  status:    number;
  detail:    string;
  timestamp: string;
}