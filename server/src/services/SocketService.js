const { Server } = require("socket.io");

class SocketService {
  constructor(httpServer) {
    if (!SocketService.instance) {
      this._io = new Server(httpServer, {
        cors: {
          origin: [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://synctalk.vercel.app",
          ], // Adjust according to your needs
          methods: ["GET", "POST"],
        },
      });

      this._initialize();
      SocketService.instance = this;
    }

    return SocketService.instance;
  }

  get io() {
    return this._io;
  }

  _initialize() {
    this._io.on("connection", (socket) => {
      console.log("A user connected");

      // Handle join room
      socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
      });

      // Handle leave room
      socket.on("leaveRoom", (roomId) => {
        socket.leave(roomId);
        console.log(`User left room: ${roomId}`);
      });

      // Handle send message
      socket.on("sendMessage", (message) => {
        this._io.to(message.chatRoom).emit("newMessage", message);
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log("A user disconnected");
      });
    });
  }
}

module.exports = SocketService;
