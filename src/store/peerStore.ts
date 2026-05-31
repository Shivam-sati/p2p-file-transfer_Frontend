import { create } from 'zustand';

export type PeerStatus =
  | 'idle'
  | 'checking'
  | 'connecting'
  | 'connected'
  | 'transferring'
  | 'fallback'
  | 'failed';

interface PeerState {
  status:           PeerStatus;
  peerId:           string | null;
  remotePeerId:     string | null;
  p2pAvailable:     boolean;
  transferProgress: number;
  error:            string | null;
}

interface PeerActions {
  setStatus:       (status: PeerStatus) => void;
  setPeerIds:      (local: string, remote: string) => void;
  setP2PAvailable: (available: boolean) => void;
  setProgress:     (progress: number) => void;
  setError:        (error: string) => void;
  reset:           () => void;
}

const INITIAL: PeerState = {
  status:           'idle',
  peerId:           null,
  remotePeerId:     null,
  p2pAvailable:     false,
  transferProgress: 0,
  error:            null,
};

export const usePeerStore = create<PeerState & PeerActions>((set) => ({
  ...INITIAL,

  setStatus:       (status)    => set({ status }),
  setPeerIds:      (peerId, remotePeerId) => set({ peerId, remotePeerId }),
  setP2PAvailable: (p2pAvailable) => set({ p2pAvailable }),
  setProgress:     (transferProgress) => set({ transferProgress }),
  setError:        (error) => set({ error, status: 'failed' }),
  reset:           () => set({ ...INITIAL }),
}));