import Socket from "socket.io-client";

export class SocketService {
  private _socket: SocketIOClient.Socket | null = null;

  public init() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    this._socket = Socket(require("../config/urls").socketIo);
    return this._socket;
  }

  public get socket() {
    if (!this._socket) {
      throw new Error("Socket not created !");
    }

    return this._socket;
  }
}

export const socketService = new SocketService();
