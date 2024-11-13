// routes/passwordRoutes.js
const express = require("express");
const router = express.Router();
const {
  forgotPassword,
  verifyOTP,
  resetPassword,
} = require("../controllers/passwordController");

// Forgot Password Route
router.post("/forgot-password", forgotPassword);

// Verify OTP Route
router.post("/verify-otp", verifyOTP);

// Reset Password Route
router.post("/reset-password", resetPassword);

module.exports = router;
