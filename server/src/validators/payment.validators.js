//server/src/validators/payment.validators.js
const { body, param } = require("express-validator");

const amountValidator = body("amount")
  .isFloat({ gt: 0 })
  .withMessage("Amount must be greater than 0")
  .toFloat();

const stripeCheckoutValidator = [
  amountValidator,
  body("note")
    .optional()
    .trim()
    .isLength({ max: 250 })
    .withMessage("Note cannot exceed 250 characters"),
];

const withdrawValidator = [
  amountValidator,
  body("note")
    .optional()
    .trim()
    .isLength({ max: 250 })
    .withMessage("Note cannot exceed 250 characters"),
];

const transferValidator = [
  amountValidator,

  body("toUser")
    .isMongoId()
    .withMessage("Valid receiver user ID is required"),

  body("note")
    .optional()
    .trim()
    .isLength({ max: 250 })
    .withMessage("Note cannot exceed 250 characters"),
];

const stripeSessionValidator = [
  param("sessionId")
    .notEmpty()
    .withMessage("Stripe session ID is required")
    .isLength({ min: 10 })
    .withMessage("Invalid Stripe session ID"),
];

module.exports = {
  stripeCheckoutValidator,
  withdrawValidator,
  transferValidator,
  stripeSessionValidator,
};