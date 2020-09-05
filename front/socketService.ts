import Socket from "socket.io-client";

export class SocketService {
  private _socket: SocketIOClient.Socket | null = null;

  public init() {
    this._socket = Socket(require("./urls").socketIo);
    return this._socket;
  }

  public get socket() {
    if (!this._socket) {
      throw new Error("Socket not connected !");
    }

    return this._socket;
  }
}

export const socketService = new SocketService();
