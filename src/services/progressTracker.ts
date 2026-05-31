import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { ProgressEvent } from '../types/api';

type ProgressHandler = (event: ProgressEvent) => void;

export class ProgressTracker {
  private client:     Client | null = null;
  private fileId:     string;
  private onProgress: ProgressHandler;
  private onComplete: ProgressHandler;
  private onFailed:   ProgressHandler;

  constructor(
    fileId: string,
    {
      onProgress = () => {},
      onComplete = () => {},
      onFailed   = () => {},
    }: {
      onProgress?: ProgressHandler;
      onComplete?: ProgressHandler;
      onFailed?:   ProgressHandler;
    }
  ) {
    this.fileId     = fileId;
    this.onProgress = onProgress;
    this.onComplete = onComplete;
    this.onFailed   = onFailed;
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client = new Client({
        webSocketFactory: () => new SockJS('/ws/signaling'),
        reconnectDelay: 0,
        onStompError: () => reject(new Error('ProgressTracker WebSocket failed')),
        onConnect: () => {
          this.client!.subscribe(
            `/topic/progress/${this.fileId}`,
            (frame) => {
              const event: ProgressEvent = JSON.parse(frame.body);
              switch (event.status) {
                case 'ACTIVE':
                case 'MERGING':
                  this.onProgress(event);
                  break;
                case 'COMPLETE':
                  this.onComplete(event);
                  this.stop();
                  break;
                case 'FAILED':
                  this.onFailed(event);
                  this.stop();
                  break;
              }
            }
          );
          resolve();
        },
      });
      this.client.activate();
    });
  }

  stop(): void {
    try { this.client?.deactivate(); } catch (_) {}
    this.client = null;
  }
}