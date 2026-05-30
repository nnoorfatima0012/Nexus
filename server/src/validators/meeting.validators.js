//server/src/validators/meeting.validators.js
const { body, param } = require("express-validator");

const createMeetingValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Meeting title is required")
    .isLength({ max: 120 })
    .withMessage("Title cannot exceed 120 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("requestedTo")
    .isMongoId()
    .withMessage("Valid requested user ID is required"),

  body("date")
    .isISO8601()
    .withMessage("Valid meeting date is required"),

  body("startTime")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Start time must be in HH:mm format"),

  body("endTime")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("End time must be in HH:mm format"),
];

const meetingIdValidator = [
  param("id").isMongoId().withMessage("Valid meeting ID is required"),
];

module.exports = {
  createMeetingValidator,
  meetingIdValidator,
};