// //server/src/modules/auth/auth.routes.js
// const express = require("express");
// const { register, login, getMe } = require("./auth.controller");
// const { protect } = require("../../middleware/auth.middleware");

// const router = express.Router();

// router.post("/register", register);
// router.post("/login", login);
// router.get("/me", protect, getMe);

// module.exports = router;

const express = require("express");
const { register, login, getMe } = require("./auth.controller");
const { protect } = require("../../middleware/auth.middleware");
const { authLimiter } = require("../../middleware/security.middleware");
const validateRequest = require("../../middleware/validate.middleware");
const {
  registerValidator,
  loginValidator,
} = require("../../validators/auth.validators");

const router = express.Router();

router.post("/register", authLimiter, registerValidator, validateRequest, register);
router.post("/login", authLimiter, loginValidator, validateRequest, login);
router.get("/me", protect, getMe);

module.exports = router;