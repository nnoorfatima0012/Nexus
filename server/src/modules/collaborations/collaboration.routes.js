const express = require("express");

const {
  createCollaboration,
  getMyCollaborations,
  getSentCollaborations,
  getReceivedCollaborations,
  getCollaborationStatusWithUser,
  acceptCollaboration,
  rejectCollaboration,
  cancelCollaboration,
} = require("./collaboration.controller");

const { protect } = require("../../middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.post("/", createCollaboration);
router.get("/", getMyCollaborations);
router.get("/sent", getSentCollaborations);
router.get("/received", getReceivedCollaborations);
router.get("/user/:userId/status", getCollaborationStatusWithUser);

router.patch("/:id/accept", acceptCollaboration);
router.patch("/:id/reject", rejectCollaboration);
router.patch("/:id/cancel", cancelCollaboration);

module.exports = router;