// controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (id, isAdmin) => {
  return jwt.sign({ id, isAdmin }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Register user
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    isAdmin: false,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: "Invalid credentials" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude password from the response

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params; // Get user ID from URL parameter

  try {
    // Find user by ID and delete it
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User removed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting user", error: error.message });
  }
};

// Function to get user profile
exports.getUserProfile = async (req, res) => {
  try {
    // Get the user ID from the token
    const token = req.headers.authorization.split(' ')[1]; // Assuming Bearer token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Find user by ID
    const user = await User.findById(userId).select('-otp'); // Excluding OTP

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Mask the password with asterisks based on its length
    const maskedPassword = '*'.repeat(user.password.length);

    // Return the user profile with the masked password
    const userProfile = {
      ...user.toObject(), // Convert mongoose document to plain object
      password: maskedPassword, // Replace the password with masked version
    };

    res.status(200).json(userProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    // Get the user ID from the token
    const token = req.headers.authorization.split(" ")[1]; // Assuming Bearer token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if old password matches
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    // Hash new password and save it
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Replace the old password with the new one (hashed)
    user.password = hashedPassword;
    await user.save();

    // Masking the old and new password before sending any response
    const maskedOldPassword = "*".repeat(oldPassword.length);
    const maskedNewPassword = "*".repeat(newPassword.length);

    res.status(200).json({
      message: "Password updated successfully",
      oldPassword: maskedOldPassword, // Masked version of old password
      newPassword: maskedNewPassword, // Masked version of new password
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfilePicture = async (req, res) => {
  try {
    // Get user ID from the token
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Check if the user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // If a new image file is provided, upload it to Cloudinary
    let profileImage = existingUser.profileImage; // Default to existing image URL
    if (req.file) {
      profileImage = await getImageUrl(req.file.path); // Upload to Cloudinary
    }

    // Update the user's profile image
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage },
      { new: true, select: "-password" } // Return updated user without password
    );

    res.status(200).json({
      message: "Profile picture updated successfully",
      profileImage: updatedUser.profileImage,
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({ error: error.message });
  }
};