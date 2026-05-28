//server/src/modules/video/socket.js
const setupVideoSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join-room", ({ roomId, userId, userName }) => {
      socket.join(roomId);

      socket.to(roomId).emit("user-joined", {
        socketId: socket.id,
        userId,
        userName,
      });

      socket.emit("joined-room", {
        roomId,
        socketId: socket.id,
      });
    });

    socket.on("offer", ({ roomId, offer }) => {
      socket.to(roomId).emit("offer", {
        offer,
        from: socket.id,
      });
    });

    socket.on("answer", ({ roomId, answer }) => {
      socket.to(roomId).emit("answer", {
        answer,
        from: socket.id,
      });
    });

    socket.on("ice-candidate", ({ roomId, candidate }) => {
      socket.to(roomId).emit("ice-candidate", {
        candidate,
        from: socket.id,
      });
    });

    socket.on("toggle-audio", ({ roomId, isAudioEnabled }) => {
      socket.to(roomId).emit("user-toggle-audio", {
        socketId: socket.id,
        isAudioEnabled,
      });
    });

    socket.on("toggle-video", ({ roomId, isVideoEnabled }) => {
      socket.to(roomId).emit("user-toggle-video", {
        socketId: socket.id,
        isVideoEnabled,
      });
    });

    socket.on("leave-room", ({ roomId }) => {
      socket.leave(roomId);

      socket.to(roomId).emit("user-left", {
        socketId: socket.id,
      });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

module.exports = setupVideoSocket;