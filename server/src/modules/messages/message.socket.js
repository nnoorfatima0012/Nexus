const jwt = require("jsonwebtoken");
const User = require("../users/user.model");
const Message = require("./message.model");
const { createNotification } = require("../notifications/notification.service");

const populateMessage = async (messageId) => {
  return Message.findById(messageId)
    .populate("sender", "name email role avatarUrl isOnline")
    .populate("receiver", "name email role avatarUrl isOnline");
};

const setupMessageSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      if (socket.user) {
        return next();
      }

      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Socket authentication token missing"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("Socket user not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Socket authentication failed"));
    }
  });

  io.on("connection", async (socket) => {
    if (!socket.user) return;

    const userId = socket.user._id.toString();

    socket.join(`user:${userId}`);

    await User.findByIdAndUpdate(userId, { isOnline: true });

    socket.broadcast.emit("chat-user-online", {
      userId,
      name: socket.user.name,
    });

    socket.on("send-message", async (payload, callback) => {
      try {
        const { receiverId, content } = payload || {};

        if (!receiverId || !content || !content.trim()) {
          const response = {
            success: false,
            message: "Receiver and message content are required",
          };

          if (callback) callback(response);
          return;
        }

        if (receiverId === userId) {
          const response = {
            success: false,
            message: "You cannot send a message to yourself",
          };

          if (callback) callback(response);
          return;
        }

        const receiver = await User.findById(receiverId);

        if (!receiver) {
          const response = {
            success: false,
            message: "Receiver not found",
          };

          if (callback) callback(response);
          return;
        }

        const message = await Message.create({
          sender: userId,
          receiver: receiverId,
          content: content.trim(),
        });

        const populatedMessage = await populateMessage(message._id);

        io.to(`user:${receiverId}`).emit("receive-message", populatedMessage);

        socket.emit("message-sent", populatedMessage);

        await createNotification({
          recipient: receiverId,
          sender: userId,
          type: "message_received",
          title: "New message",
          message: `${socket.user.name} sent you a message`,
          entityType: "user",
          entityId: userId,
        });

        if (callback) {
          callback({
            success: true,
            message: "Message sent successfully",
            chatMessage: populatedMessage,
          });
        }
      } catch (error) {
        console.error("SOCKET SEND MESSAGE ERROR:", error);

        if (callback) {
          callback({
            success: false,
            message: "Failed to send message",
            error: error.message,
          });
        }
      }
    });

    socket.on("typing-start", ({ receiverId }) => {
      if (!receiverId) return;

      socket.to(`user:${receiverId}`).emit("typing-start", {
        userId,
        name: socket.user.name,
      });
    });

    socket.on("typing-stop", ({ receiverId }) => {
      if (!receiverId) return;

      socket.to(`user:${receiverId}`).emit("typing-stop", {
        userId,
      });
    });

    socket.on("mark-messages-read", async ({ senderId }) => {
      if (!senderId) return;

      await Message.updateMany(
        {
          sender: senderId,
          receiver: userId,
          isRead: false,
        },
        {
          isRead: true,
          readAt: new Date(),
        },
      );

      io.to(`user:${senderId}`).emit("messages-read", {
        byUserId: userId,
      });
    });

    socket.on("disconnect", async () => {
      await User.findByIdAndUpdate(userId, { isOnline: false });

      socket.broadcast.emit("chat-user-offline", {
        userId,
      });
    });
  });
};

module.exports = setupMessageSocket;