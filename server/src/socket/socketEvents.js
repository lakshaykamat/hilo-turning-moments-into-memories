module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
    });

    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
      console.log(`User left room: ${roomId}`);
    });

    socket.on("sendMessage", (message) => {
      io.to(message.chatRoom).emit("newMessage", message);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};
