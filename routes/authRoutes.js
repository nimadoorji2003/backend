// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getAllUsers, deleteUser } = require("../controllers/authController");
const authController = require("../controllers/authController");
const {
  protect,
  isAdmin,
  authenticateToken,
} = require("../middleware/authMiddleware");

// Register Route
router.post("/register", registerUser);

// Login Route
router.post("/login", loginUser);

router.get("/users", getAllUsers);

router.delete("/users/:id", deleteUser);

// Route to get user profile
router.get('/profile', authenticateToken, authController.getUserProfile);

// Route to update profile picture
router.post('/update-profile-picture', authenticateToken, authController.updateProfilePicture);

// Route to change password
router.post('/change-password', authenticateToken, authController.changePassword);


module.exports = router;
