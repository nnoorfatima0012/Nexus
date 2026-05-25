//server/src/modules/users/user.routes.js

const express = require("express");
const {
  getCurrentUser,
  updateCurrentUser,
  getUserById,
  getInvestors,
  getEntrepreneurs
} = require("./user.controller");

const { protect } = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/me", protect, getCurrentUser);
router.put("/me", protect, updateCurrentUser);

router.get("/investors", protect, getInvestors);
router.get("/entrepreneurs", protect, getEntrepreneurs);

router.get("/:id", protect, getUserById);

module.exports = router;