import { SignalingMessage } from '../types/api';

class SignalingService {
  private socket: WebSocket | null = null;
  private listeners: ((msg: SignalingMessage) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(fileId: string) {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws/p2p';
    const url = `${wsUrl}?fileId=${fileId}`;
    
    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.listeners.forEach(l => l(msg));
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.socket.onclose = () => {
        console.log('WebSocket closed');
        this.attemptReconnect(fileId);
      };
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
    }
  }

  private attemptReconnect(fileId: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(fileId);
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  onMessage(callback: (msg: SignalingMessage) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  send(message: Omit<SignalingMessage, 'senderId'>) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not open. Message not sent.');
    }
  }

  disconnect() {
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
    this.socket?.close();
  }
}

export const signalingService = new SignalingService();
