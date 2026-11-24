import { LiveFlowPacket } from '../types';

export class TrafficWebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private onPacketCallback: (packet: LiveFlowPacket) => void;
  private onStatusCallback: (connected: boolean) => void;
  private reconnectInterval = 3000;
  private shouldReconnect = true;

  constructor(
    url = 'ws://127.0.0.1:8000/api/v1/stream/ws/traffic',
    onPacket: (packet: LiveFlowPacket) => void,
    onStatus: (connected: boolean) => void
  ) {
    this.url = url;
    this.onPacketCallback = onPacket;
    this.onStatusCallback = onStatus;
  }

  public connect() {
    this.shouldReconnect = true;
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.onStatusCallback(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const packet: LiveFlowPacket = JSON.parse(event.data);
          this.onPacketCallback(packet);
        } catch (e) {
          console.error('Error parsing live packet:', e);
        }
      };

      this.ws.onclose = () => {
        this.onStatusCallback(false);
        if (this.shouldReconnect) {
          setTimeout(() => this.connect(), this.reconnectInterval);
        }
      };

      this.ws.onerror = () => {
        this.onStatusCallback(false);
      };
    } catch (e) {
      this.onStatusCallback(false);
    }
  }

  public disconnect() {
    this.shouldReconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
