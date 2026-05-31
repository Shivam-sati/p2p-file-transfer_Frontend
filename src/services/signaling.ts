import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { SignalingMessage } from '../types/api';
type MessageHandler = (msg: SignalingMessage) => void;

class SignalingService {
  private client:   Client | null = null;
  private peerId:   string        = crypto.randomUUID();
  private roomId:   string        = '';
  private handlers: MessageHandler[] = [];

  getPeerId(): string { return this.peerId; }

  connect(roomId: string): Promise<void> {
    this.roomId = roomId;

    return new Promise((resolve, reject) => {
      this.client = new Client({
        webSocketFactory: () => new SockJS('/ws/signaling'),
        reconnectDelay: 0,
        onStompError: () => reject(new Error('Signaling WebSocket failed')),
        onConnect: () => {
          this.client!.subscribe(
            `/topic/peer/${this.peerId}`,
            (frame) => {
              try {
                const msg: SignalingMessage = JSON.parse(frame.body);
                this.handlers.forEach(h => h(msg));
              } catch (_) {}
            }
          );
          // Join the room
          this.send({ type: 'join', roomId, fromPeerId: this.peerId, toPeerId: null, payload: null });
          resolve();
        },
      });
      this.client.activate();
    });
  }

  send(msg: SignalingMessage): void {
    if (!this.client?.connected) return;
    this.client.publish({
      destination: '/app/signal',
      body: JSON.stringify(msg),
    });
  }

  onMessage(handler: MessageHandler): () => void {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter(h => h !== handler);
    };
  }

  disconnect(): void {
    if (this.client?.connected) {
      this.send({
        type: 'leave',
        roomId: this.roomId,
        fromPeerId: this.peerId,
        toPeerId: null,
        payload: null,
      });
    }
    try { this.client?.deactivate(); } catch (_) {}
    this.client   = null;
    this.handlers = [];
  }
}

// Singleton — one signaling connection per browser tab
export const signalingService = new SignalingService();