const express = require("express");

const {
  getConversations,
  getMessagesWithUser,
  // sendMessage,
  markConversationAsRead,
} = require("./message.controller");

const { protect } = require("../../middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.get("/conversations", getConversations);
router.get("/:userId", getMessagesWithUser);
// router.post("/:userId", sendMessage);
router.patch("/:userId/read", markConversationAsRead);

module.exports = router;