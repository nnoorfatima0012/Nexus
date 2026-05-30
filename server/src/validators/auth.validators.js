//server/src/validators/auth.validators.js
const { body } = require("express-validator");

const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 80 })
    .withMessage("Name must be between 2 and 80 characters"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("role")
    .isIn(["entrepreneur", "investor"])
    .withMessage("Role must be entrepreneur or investor"),
];

const loginValidator = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),

  body("role")
    .isIn(["entrepreneur", "investor"])
    .withMessage("Role must be entrepreneur or investor"),
];

module.exports = {
  registerValidator,
  loginValidator,
};