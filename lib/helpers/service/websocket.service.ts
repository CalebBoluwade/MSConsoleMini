import { db } from "./db/db.service";

type WebSocketCallback = (data: WebSocketMessage) => void;

export class DeviceWebSocketService {
  private static instance: DeviceWebSocketService;
  private socket: WebSocket | null = null;
  private readonly subscribers = new Map<string, WebSocketCallback[]>();
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 3000;
  private readonly url: string;
  private isInitialized = false;
  private _isConnected = false;
  private readonly initialDataResolvers = {
    devices: [] as ((value: BaseMonitor[]) => void)[],
    groups: [] as ((value: MonitorGroup[]) => void)[],
  };

  private constructor(url: string) {
    this.url = url;
    this.connect();
  }

  public static getInstance(url: string): DeviceWebSocketService {
    if (!DeviceWebSocketService.instance) {
      DeviceWebSocketService.instance = new DeviceWebSocketService(url);
    }
    return DeviceWebSocketService.instance;
  }

  private async connect() {
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log("WebSocket connected");
      this._isConnected = true;
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = async (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        if (typeof window !== "undefined") {
          await db.initialize();

          console.log(message, Array.isArray(message))
          if (Array.isArray(message)) {
            await db.addDevices(message);
            return;
          }
        }

        switch (message.type) {
          case "initialDevices":
            this.initialDataResolvers.devices.forEach((r) => r(message.data));
            this.initialDataResolvers.devices = [];
            break;

          case "initialGroups":
            this.initialDataResolvers.groups.forEach((r) => r(message.data));
            this.initialDataResolvers.groups = [];
            this.isInitialized = true;
            break;

          default:
            this.notifySubscribers(message.type, message);
            break;
        }
      } catch (err) {
        console.error("WebSocket message error:", event.data, err);
      }
    };

    this.socket.onclose = () => {
      this._isConnected = false;
      console.warn("WebSocket disconnected");
      this.handleReconnect();
    };

    this.socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };
  }

   // Public getter (read-only outside the class)
  public get isConnected(): boolean {
    return this._isConnected;
  }

  public handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnect attempt ${this.reconnectAttempts}`);
      setTimeout(() => this.connect(), this.reconnectDelay);
    } else {
      console.error("Max reconnect attempts reached.");
    }
  }

  async getInitialData(): Promise<{
    devices: BaseMonitor[];
    groups: MonitorGroup[];
  }> {
    if (this.isInitialized) {
      return { devices: [], groups: [] };
    }

    const devices = new Promise<BaseMonitor[]>((res) => {
      this.initialDataResolvers.devices.push(res);
    });

    const groups = new Promise<MonitorGroup[]>((res) => {
      this.initialDataResolvers.groups.push(res);
    });

    return Promise.all([devices, groups]).then(([devices, groups]) => ({
      devices,
      groups,
    }));
  }

  public send(type: string, message: WebSocketMessage) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, message }));
    } else {
      console.warn("WebSocket not ready, message not sent:", message);
    }
  }

  public subscribe(type: string, callback: WebSocketCallback): () => void {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, []);
    }
    this.subscribers.get(type)!.push(callback);
    return () => this.unsubscribe(type, callback);
  }

  private unsubscribe(type: string, callback: WebSocketCallback) {
    const callbacks = this.subscribers.get(type);
    if (callbacks) {
      this.subscribers.set(
        type,
        callbacks.filter((cb) => cb !== callback)
      );
    }
  }

  private notifySubscribers(type: string, data: WebSocketMessage) {
    this.subscribers.get(type)?.forEach((cb) => cb(data));
  }

  public close() {
    this.socket?.close();
  }
}

export const webSocketService = DeviceWebSocketService.getInstance(
  process.env.NEXT_PUBLIC_WS_SYNTHETIC_URL!
);
