import Socket from "socket.io-client";

export class SocketService {
  public initialized = false;
  private _socket: SocketIOClient.Socket | null = null;

  public init() {
    this._socket = Socket("http://localhost:3000");
    this.initialized = true;
    return this._socket;
  }

  public get socket() {
    if (!this._socket) {
      return this.init();
    }

    return this._socket;
  }
}

export const socketService = new SocketService();
