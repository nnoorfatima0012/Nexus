//server/src/modules/notifications/notification.service.js
const Notification = require("./notification.model");

const createNotification = async ({
  recipient,
  sender = null,
  type = "system",
  title,
  message,
  entityType = "system",
  entityId = null,
}) => {
  try {
    if (!recipient || !title || !message) {
      return null;
    }

    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      entityType,
      entityId,
    });

    return notification;
  } catch (error) {
    console.error("Notification creation failed:", error.message);
    return null;
  }
};

module.exports = {
  createNotification,
};