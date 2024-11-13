// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    image: { type: String, required: false, default: "default.png" }, // New field for profile image
    otp: { type: String, required: false, default: "none" }, // New field for OTP
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
