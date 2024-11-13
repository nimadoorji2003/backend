// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

// Register Route
router.post("/register", registerUser);

// Login Route
router.post("/login", loginUser);


module.exports = router;
