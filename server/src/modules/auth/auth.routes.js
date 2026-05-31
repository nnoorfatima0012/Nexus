// // //server/src/modules/auth/auth.routes.js

// const express = require("express");
// const { register, login, getMe } = require("./auth.controller");
// const { protect } = require("../../middleware/auth.middleware");
// const { authLimiter } = require("../../middleware/security.middleware");
// const validateRequest = require("../../middleware/validate.middleware");
// const {
//   registerValidator,
//   loginValidator,
// } = require("../../validators/auth.validators");

// const router = express.Router();

// router.post("/register", authLimiter, registerValidator, validateRequest, register);
// router.post("/login", authLimiter, loginValidator, validateRequest, login);
// router.get("/me", protect, getMe);

// module.exports = router;


// // //server/src/modules/auth/auth.routes.js
const express = require("express");

const {
  register,
  login,
  verifyLoginOtp,
  enableTwoFactor,
  disableTwoFactor,
  getMe,
} = require("./auth.controller");

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

router.post("/2fa/verify-login", authLimiter, verifyLoginOtp);
router.post("/2fa/enable", protect, enableTwoFactor);
router.post("/2fa/disable", protect, disableTwoFactor);

router.get("/me", protect, getMe);

module.exports = router;