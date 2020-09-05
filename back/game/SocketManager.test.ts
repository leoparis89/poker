import { SocketManager } from "./SocketManager";
import { makeSocket } from "../_fixtures";

describe("UserSockets", () => {
  describe("addSocket", () => {
    it("should add sockets to user entry", () => {
      const socket1 = makeSocket("my-user");
      const socket2 = makeSocket("my-user");
      const userSockets = new SocketManager();
      userSockets.addSocket(socket1);
      userSockets.addSocket(socket2);
      expect(userSockets.sockets.get("my-user")).toEqual([socket1, socket2]);
    });
  });

  describe("remove socket", () => {
    it("should remove socket and player entry", () => {
      const socket1 = makeSocket("my-user");
      const socket2 = makeSocket("my-user");
      const userSockets = new SocketManager();
      userSockets.addSocket(socket1);
      userSockets.addSocket(socket2);
      expect(userSockets.sockets.get("my-user")).toEqual([socket1, socket2]);

      userSockets.removeSocket(socket1);
      userSockets.removeSocket(socket2);
      expect(userSockets.sockets.get("my-user")).toEqual(undefined);
    });
  });

  describe("emitToPlayers", () => {
    it("should emit to all the sockets of the players", () => {
      const socket1 = makeSocket("my-user1");
      const socket2 = makeSocket("my-user1");
      const socket3 = makeSocket("my-user2");
      const socket4 = makeSocket("my-user3");
      const userSockets = new SocketManager();
      userSockets.addSocket(socket1);
      userSockets.addSocket(socket2);
      userSockets.addSocket(socket3);
      userSockets.addSocket(socket4);

      userSockets.emitToUsers(
        ["my-user1", "my-user2", "my-user3"],
        "hello-topic",
        "world-payload"
      );

      expect(socket1.emit).toHaveBeenCalledWith("hello-topic", "world-payload");
      expect(socket2.emit).toHaveBeenCalledWith("hello-topic", "world-payload");
      expect(socket3.emit).toHaveBeenCalledWith("hello-topic", "world-payload");
      expect(socket4.emit).toHaveBeenCalledWith("hello-topic", "world-payload");
    });
  });
});
