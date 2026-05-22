import { create } from 'zustand';

interface PeerState {
  peers: Record<string, { status: string; progress: number }>;
  setPeerStatus: (fileId: string, status: string) => void;
  setPeerProgress: (fileId: string, progress: number) => void;
}

export const usePeerStore = create<PeerState>((set) => ({
  peers: {},
  setPeerStatus: (fileId, status) => set((state) => ({
    peers: { ...state.peers, [fileId]: { ...state.peers[fileId], status } }
  })),
  setPeerProgress: (fileId, progress) => set((state) => ({
    peers: { ...state.peers, [fileId]: { ...state.peers[fileId], progress } }
  })),
}));
