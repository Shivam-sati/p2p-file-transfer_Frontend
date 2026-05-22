import { useState, useEffect, useCallback, useRef } from 'react';
import { signalingService } from '../services/signaling';

export const useWebRTC = (fileId: string, isSender: boolean) => {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'failed'>('idle');
  const [transferProgress, setTransferProgress] = useState(0);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);

  const initPeer = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        signalingService.send({
          type: 'candidate',
          payload: event.candidate,
          receiverId: '', // Server handles routing
          senderId: '' // Added by server
        } as any);
      }
    };

    pc.onconnectionstatechange = () => {
      setConnectionStatus(pc.connectionState as any);
    };

    peerConnection.current = pc;
    return pc;
  }, []);

  useEffect(() => {
    if (!fileId) return;

    signalingService.connect(fileId);
    const cleanup = signalingService.onMessage(async (msg) => {
      if (msg.type === 'offer') {
        const pc = peerConnection.current || initPeer();
        await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        signalingService.send({ type: 'answer', payload: answer, receiverId: msg.senderId });
      } else if (msg.type === 'answer') {
        await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(msg.payload));
      } else if (msg.type === 'candidate') {
        await peerConnection.current?.addIceCandidate(new RTCIceCandidate(msg.payload));
      }
    });

    return () => {
      cleanup();
      signalingService.disconnect();
      peerConnection.current?.close();
    };
  }, [fileId, initPeer]);

  const startTransfer = useCallback(async () => {
    setConnectionStatus('connecting');
    const pc = initPeer();
    
    const dc = pc.createDataChannel('fileTransfer');
    dataChannel.current = dc;
    
    dc.onopen = () => setConnectionStatus('connected');
    dc.onmessage = (e) => {
      // Handle incoming file chunks (if receiver)
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    signalingService.send({ type: 'offer', payload: offer, receiverId: '' });
  }, [initPeer]);

  return { connectionStatus, transferProgress, startTransfer };
};
