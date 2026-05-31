import { useCallback, useRef } from 'react';
import { fileApi }    from '../services/fileApi';
import { chunkApi }   from '../services/chunkApi';
import { shareApi }   from '../services/shareApi';
import { ProgressTracker } from '../services/progressTracker';
import { useUploadStore }  from '../store/uploadStore';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB — must match backend chunk-size-bytes

async function computeSha256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hash   = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export const useUploader = () => {
  const {
    startUpload, setUploadInfo, updateProgress,
    updateSpeed, updateChunks, setPhase,
    setShareResult, setError, reset,
  } = useUploadStore();

  const abortedRef = useRef(false);
  const trackerRef = useRef<ProgressTracker | null>(null);

  const cancelUpload = useCallback(() => {
    abortedRef.current = true;
    trackerRef.current?.stop();
    reset();
  }, [reset]);

  const uploadFile = useCallback(async (file: File) => {
    abortedRef.current = false;
    trackerRef.current?.stop();

    startUpload();
    setUploadInfo({ fileId: null, fileName: file.name, fileSize: file.size });

    let checksumSha256: string;
    try {
      checksumSha256 = await computeSha256(file);
    } catch {
      setError('Failed to compute file checksum');
      return null;
    }
    if (abortedRef.current) return null;

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    setPhase('uploading');
    updateChunks(0, totalChunks);

    let fileId: string;
    try {
      fileId = await fileApi.init(
        file.name, file.size,
        file.type || 'application/octet-stream',
        totalChunks, checksumSha256
      );
      setUploadInfo({ fileId, fileName: file.name, fileSize: file.size });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to initialise upload');
      return null;
    }
    if (abortedRef.current) return null;

    trackerRef.current = new ProgressTracker(fileId, {
      onProgress: (e) => {
        updateProgress(e.percentComplete);
        updateSpeed(e.speedBps, e.etaSeconds);
        updateChunks(e.chunksUploaded, e.totalChunks);
        if (e.status === 'MERGING') setPhase('merging');
      },
      onComplete: () => {
        // share code creation happens below — tracker just confirms server is done
      },
      onFailed: (e) => setError(e.message || 'Server-side processing failed'),
    });

    try {
      await trackerRef.current.start();
    } catch {
      // WebSocket unavailable — progress will come from polling only, not fatal
    }

    let uploadedSet: Set<number>;
    try {
      const indices = await chunkApi.getUploadedChunks(fileId);
      uploadedSet   = new Set(indices);
      updateChunks(uploadedSet.size, totalChunks);
      updateProgress(Math.round((uploadedSet.size / totalChunks) * 95));
    } catch {
      uploadedSet = new Set();
    }
    if (abortedRef.current) return null;

    let uploadedCount = uploadedSet.size;
    for (let i = 0; i < totalChunks; i++) {
      if (abortedRef.current) return null;
      if (uploadedSet.has(i)) continue;

      const start = i * CHUNK_SIZE;
      const end   = Math.min(start + CHUNK_SIZE, file.size);
      const blob  = file.slice(start, end);

      try {
        await chunkApi.uploadChunk(fileId, i, blob);
        uploadedCount++;
        updateChunks(uploadedCount, totalChunks);
        updateProgress(Math.round((uploadedCount / totalChunks) * 95));
      } catch (err: any) {
        setError(err.response?.data?.detail || `Failed to upload chunk ${i}`);
        return null;
      }
    }
    if (abortedRef.current) return null;
    setPhase('merging');
    updateProgress(96);
    try {
      await fileApi.mergeChunks(fileId);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to trigger merge');
      return null;
    }

    for (let attempt = 0; attempt < 60; attempt++) {
      if (abortedRef.current) return null;
      await new Promise(r => setTimeout(r, 2000));
      try {
        const status = await fileApi.getStatus(fileId);
        if (status.status === 'READY') break;
        if (status.status === 'FAILED') {
          setError('File assembly failed — checksum mismatch or I/O error');
          return null;
        }
      } catch { /* keep polling */ }
    }
    if (abortedRef.current) return null;

    setPhase('sharing');
    updateProgress(99);
    try {
      const share = await shareApi.createShare(fileId, { expiryHours: 72 });
      setShareResult(share.code, share.shareUrl);
      trackerRef.current?.stop();
      return fileId;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create share code');
      return null;
    }
  }, [
    startUpload, setUploadInfo, updateProgress,
    updateSpeed, updateChunks, setPhase,
    setShareResult, setError,
  ]);

  return { uploadFile, cancelUpload };
};