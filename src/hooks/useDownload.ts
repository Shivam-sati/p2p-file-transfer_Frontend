import { useState, useCallback } from 'react';
import { shareApi }   from '../services/shareApi';
import apiClient      from '../services/apiClient';
import type { ShareInfoResponse } from '../types/api';

type DownloadPhase = 'idle' | 'resolving' | 'ready' | 'downloading' | 'done' | 'error';

interface DownloadState {
  phase:    DownloadPhase;
  info:     ShareInfoResponse | null;
  progress: number;
  error:    string | null;
}

export function useDownload() {
  const [state, setState] = useState<DownloadState>({
    phase: 'idle', info: null, progress: 0, error: null,
  });

  const set = (patch: Partial<DownloadState>) =>
    setState(prev => ({ ...prev, ...patch }));

  const resolveCode = useCallback(async (code: string) => {
    set({ phase: 'resolving', error: null });
    try {
      const info = await shareApi.resolveShare(code);
      set({ phase: 'ready', info });
    } catch (err: any) {
      set({
        phase: 'error',
        error: err.response?.data?.detail || 'Share code not found or expired',
      });
    }
  }, []);

  const downloadFromServer = useCallback((code: string) => {
    set({ phase: 'downloading', progress: 50 });
    const url = shareApi.getDownloadUrl(code);
    const a   = Object.assign(document.createElement('a'), { href: url });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => set({ phase: 'done', progress: 100 }), 1000);
  }, []);

  const reset = useCallback(() => {
    setState({ phase: 'idle', info: null, progress: 0, error: null });
  }, []);

  return { state, resolveCode, downloadFromServer, reset };
}