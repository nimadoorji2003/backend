// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token Payload:", decoded); // Debugging log

    // Fetch user from the database using the decoded ID
    req.user = await User.findById(decoded.id).select("-password");
    console.log("Authenticated User:", req.user); // Debugging log

    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error in protect middleware:", error);
    res.status(401).json({ message: "Unauthorized access" });
  }
};


const isAdmin = (req, res, next) => {
  console.log("Checking if user is admin:", req.user); // Debug log

  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admins only" });
  }
};

module.exports = { protect, isAdmin };
