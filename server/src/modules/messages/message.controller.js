const Message = require("./message.model");
const User = require("../users/user.model");
const { createNotification } = require("../notifications/notification.service");

const populateMessage = [
  { path: "sender", select: "name email role avatarUrl isOnline" },
  { path: "receiver", select: "name email role avatarUrl isOnline" },
];

const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id.toString();

    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .populate(populateMessage)
      .sort({ createdAt: -1 });

    const conversationMap = new Map();

    messages.forEach((message) => {
      const senderId = message.sender._id.toString();
      const receiverId = message.receiver._id.toString();

      const otherUser =
        senderId === currentUserId ? message.receiver : message.sender;

      const otherUserId = otherUser._id.toString();

      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          user: otherUser,
          lastMessage: message,
          unreadCount: 0,
          updatedAt: message.createdAt,
        });
      }

      if (receiverId === currentUserId && !message.isRead) {
        conversationMap.get(otherUserId).unreadCount += 1;
      }
    });

    return res.status(200).json({
      success: true,
      count: conversationMap.size,
      conversations: Array.from(conversationMap.values()),
    });
  } catch (error) {
    console.error("GET CONVERSATIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get conversations",
      error: error.message,
    });
  }
};

const getMessagesWithUser = async (req, res) => {
  try {
    const otherUserId = req.params.userId;

    const otherUser = await User.findById(otherUserId).select(
      "name email role avatarUrl isOnline",
    );

    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await Message.updateMany(
      {
        sender: otherUserId,
        receiver: req.user._id,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
    );

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user._id },
      ],
    })
      .populate(populateMessage)
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: messages.length,
      otherUser,
      messages,
    });
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get messages",
      error: error.message,
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const receiverId = req.params.userId;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a message to yourself",
      });
    }

    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content: content.trim(),
    });

    const populatedMessage = await Message.findById(message._id).populate(
      populateMessage,
    );

    const io = req.app.get("io");

    if (io) {
      io.to(`user:${receiverId}`).emit("receive-message", populatedMessage);
    }

    await createNotification({
      recipient: receiverId,
      sender: req.user._id,
      type: "message_received",
      title: "New message",
      message: `${req.user.name} sent you a message`,
      entityType: "user",
      entityId: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      chatMessage: populatedMessage,
    });
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

const markConversationAsRead = async (req, res) => {
  try {
    const otherUserId = req.params.userId;

    await Message.updateMany(
      {
        sender: otherUserId,
        receiver: req.user._id,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
    );

    return res.status(200).json({
      success: true,
      message: "Conversation marked as read",
    });
  } catch (error) {
    console.error("MARK MESSAGES READ ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
      error: error.message,
    });
  }
};

module.exports = {
  getConversations,
  getMessagesWithUser,
  sendMessage,
  markConversationAsRead,
};