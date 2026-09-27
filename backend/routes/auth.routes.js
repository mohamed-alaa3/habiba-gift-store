const express = require("express");
const authController = require("../controllers/auth.controller");
const authenticate = require("../middleware/authenticate");
const { authLimiter } = require("../middleware/rateLimit");
const {
  registerValidator,
  loginValidator,
  updateMeValidator,
  changePasswordValidator,
} = require("../validators/auth.validator");

const router = express.Router();

// Public
router.post(
  "/register",
  authLimiter,
  registerValidator,
  authController.register,
);
router.post("/login", authLimiter, loginValidator, authController.login);

// Protected
router.get("/me", authenticate, authController.me);
router.patch("/me", authenticate, updateMeValidator, authController.updateMe);
router.patch(
  "/change-password",
  authenticate,
  authLimiter,
  changePasswordValidator,
  authController.changePassword,
);

module.exports = router;
