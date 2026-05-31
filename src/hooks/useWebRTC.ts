import { useState, useEffect, useCallback, useRef } from 'react';
import { signalingService } from '../services/signaling';
import { usePeerStore }     from '../store/peerStore';
import type { SignalingMessage } from '../types/api';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

const CHUNK_SIZE   = 64 * 1024;   // 64 KB per data channel message
const MAX_BUFFERED = 1024 * 1024; // Pause if buffer > 1 MB (back-pressure)
const FALLBACK_MS  = 15_000;      // Fall back after 15 s if no P2P connection

interface UseWebRTCOptions {
  fileId:      string;
  isSender:    boolean;
  file?:       File;             
  onProgress?: (pct: number, speedBps: number) => void;
  onComplete?: (fileName: string, size: number) => void;
  onFallback?: (reason: string) => void;
}

export const useWebRTC = ({
  fileId, isSender, file,
  onProgress, onComplete, onFallback,
}: UseWebRTCOptions) => {
  const { setStatus, setProgress, setError, setPeerIds } = usePeerStore();

  const pcRef           = useRef<RTCPeerConnection | null>(null);
  const dcRef           = useRef<RTCDataChannel | null>(null);
  const remotePeerRef   = useRef<string>('');
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Received data (receiver side)
  const receivedChunksRef = useRef<ArrayBuffer[]>([]);
  const receivedBytesRef  = useRef(0);
  const totalBytesRef     = useRef(0);
  const metaRef           = useRef<{ name: string; size: number; type: string } | null>(null);

  const clearFallbackTimer = () => {
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  };

  const activateFallback = useCallback((reason: string) => {
    clearFallbackTimer();
    pcRef.current?.close();
    signalingService.send({
      type: 'fallback', roomId: fileId,
      fromPeerId: signalingService.getPeerId(),
      toPeerId: remotePeerRef.current,
      payload: reason,
    });
    setStatus('fallback');
    onFallback?.(reason);
    signalingService.disconnect();
  }, [fileId, setStatus, onFallback]);

  const createPC = useCallback((): RTCPeerConnection => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = ({ candidate }) => {
      if (candidate && remotePeerRef.current) {
        signalingService.send({
          type: 'ice', roomId: fileId,
          fromPeerId: signalingService.getPeerId(),
          toPeerId:   remotePeerRef.current,
          payload:    JSON.stringify(candidate),
        });
      }
    };

    pc.onconnectionstatechange = () => {
      const s = pc.connectionState;
      if (s === 'connected') {
        clearFallbackTimer();
        setStatus('connected');
      } else if (s === 'failed' || s === 'disconnected') {
        activateFallback(`Connection ${s}`);
      }
    };

    pcRef.current = pc;
    return pc;
  }, [fileId, setStatus, activateFallback]);

  const setupSenderChannel = useCallback((dc: RTCDataChannel, fileToSend: File) => {
    dc.binaryType = 'arraybuffer';
    dcRef.current = dc;

    dc.onopen = async () => {
      setStatus('transferring');
      // Send file metadata first
      dc.send(JSON.stringify({ name: fileToSend.name, size: fileToSend.size, type: fileToSend.type }));

      let offset = 0;
      const total = fileToSend.size;
      const startTime = Date.now();

      while (offset < total) {
        // Back-pressure
        if (dc.bufferedAmount > MAX_BUFFERED) {
          await new Promise<void>(res => {
            dc.bufferedAmountLowThreshold = MAX_BUFFERED / 2;
            dc.onbufferedamountlow = () => res();
          });
        }
        const buf    = await fileToSend.slice(offset, offset + CHUNK_SIZE).arrayBuffer();
        dc.send(buf);
        offset += buf.byteLength;
        const pct   = (offset / total) * 100;
        const speed = offset / ((Date.now() - startTime) / 1000);
        setProgress(pct);
        onProgress?.(pct, speed);
      }

      dc.send(JSON.stringify({ type: 'done' }));
      setStatus('idle');
      onComplete?.(fileToSend.name, fileToSend.size);
      signalingService.disconnect();
    };

    dc.onerror = () => activateFallback('Data channel error');
  }, [setStatus, setProgress, onProgress, onComplete, activateFallback]);

  const setupReceiverChannel = useCallback((dc: RTCDataChannel) => {
    dc.binaryType = 'arraybuffer';
    dcRef.current = dc;
    let metaReceived = false;

    dc.onmessage = ({ data }) => {
      if (!metaReceived) {
        try {
          metaRef.current  = JSON.parse(data as string);
          totalBytesRef.current = metaRef.current!.size;
          metaReceived = true;
        } catch { metaReceived = true; }
        return;
      }

      if (typeof data === 'string') {
        try {
          const ctrl = JSON.parse(data);
          if (ctrl.type === 'done' && metaRef.current) {
            const blob = new Blob(receivedChunksRef.current, { type: metaRef.current.type });
            const url  = URL.createObjectURL(blob);
            const a    = Object.assign(document.createElement('a'), {
              href: url, download: metaRef.current.name,
            });
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setStatus('idle');
            onComplete?.(metaRef.current.name, receivedBytesRef.current);
            signalingService.disconnect();
          }
        } catch {}
        return;
      }

      receivedChunksRef.current.push(data as ArrayBuffer);
      receivedBytesRef.current  += (data as ArrayBuffer).byteLength;
      const pct = (receivedBytesRef.current / totalBytesRef.current) * 100;
      setProgress(pct);
      onProgress?.(pct, 0);
    };

    dc.onerror = () => activateFallback('Data channel error');
  }, [setStatus, setProgress, onProgress, onComplete, activateFallback]);

  const handleSignal = useCallback(async (msg: SignalingMessage) => {
    switch (msg.type) {
      case 'peer-ready': {
        remotePeerRef.current = msg.fromPeerId;
        setPeerIds(signalingService.getPeerId(), msg.fromPeerId);
        if (isSender && file) {
          const pc = createPC();
          const dc = pc.createDataChannel('fileTransfer', { ordered: true });
          setupSenderChannel(dc, file);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          signalingService.send({
            type: 'offer', roomId: fileId,
            fromPeerId: signalingService.getPeerId(),
            toPeerId:   remotePeerRef.current,
            payload:    JSON.stringify(offer),
          });
        }
        break;
      }
      case 'offer': {
        remotePeerRef.current = msg.fromPeerId;
        setPeerIds(signalingService.getPeerId(), msg.fromPeerId);
        const pc = createPC();
        pc.ondatachannel = ({ channel }) => setupReceiverChannel(channel);
        await pc.setRemoteDescription(JSON.parse(msg.payload!));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        signalingService.send({
          type: 'answer', roomId: fileId,
          fromPeerId: signalingService.getPeerId(),
          toPeerId:   remotePeerRef.current,
          payload:    JSON.stringify(answer),
        });
        break;
      }
      case 'answer':
        await pcRef.current?.setRemoteDescription(JSON.parse(msg.payload!));
        break;
      case 'ice':
        await pcRef.current?.addIceCandidate(JSON.parse(msg.payload!));
        break;
      case 'fallback':
        activateFallback('Remote peer fell back');
        break;
    }
  }, [fileId, isSender, file, createPC, setupSenderChannel, setupReceiverChannel, setPeerIds, activateFallback]);

  const connect = useCallback(async () => {
    setStatus('connecting');
    await signalingService.connect(fileId);
    const cleanup = signalingService.onMessage(handleSignal);

    fallbackTimerRef.current = setTimeout(
      () => activateFallback('P2P connection timeout'),
      FALLBACK_MS
    );

    return cleanup;
  }, [fileId, setStatus, handleSignal, activateFallback]);

  const disconnect = useCallback(() => {
    clearFallbackTimer();
    pcRef.current?.close();
    signalingService.disconnect();
  }, []);

  return { connect, disconnect };
};