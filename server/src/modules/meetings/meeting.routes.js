// //server/src/modules/meetings/meeting.routes.js
// const express = require("express");

// const {
//   createMeeting,
//   getMyMeetings,
//   getMeetingById,
//   acceptMeeting,
//   rejectMeeting,
//   cancelMeeting,
// } = require("./meeting.controller");

// const { protect } = require("../../middleware/auth.middleware");

// const router = express.Router();

// router.use(protect);

// router.post("/", createMeeting);
// router.get("/", getMyMeetings);
// router.get("/:id", getMeetingById);
// router.patch("/:id/accept", acceptMeeting);
// router.patch("/:id/reject", rejectMeeting);
// router.patch("/:id/cancel", cancelMeeting);

// module.exports = router;

const express = require("express");

const {
  createMeeting,
  getMyMeetings,
  acceptMeeting,
  rejectMeeting,
  cancelMeeting,
} = require("./meeting.controller");

const { protect } = require("../../middleware/auth.middleware");
const validateRequest = require("../../middleware/validate.middleware");
const {
  createMeetingValidator,
  meetingIdValidator,
} = require("../../validators/meeting.validators");

const router = express.Router();

router.use(protect);

router.post("/", createMeetingValidator, validateRequest, createMeeting);
router.get("/", getMyMeetings);

router.patch("/:id/accept", meetingIdValidator, validateRequest, acceptMeeting);
router.patch("/:id/reject", meetingIdValidator, validateRequest, rejectMeeting);
router.patch("/:id/cancel", meetingIdValidator, validateRequest, cancelMeeting);

module.exports = router;
