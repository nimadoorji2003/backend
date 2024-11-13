// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  stock: Number,
  image: String, // Add this if missing, for the Cloudinary URL
});

module.exports = mongoose.model("Product", productSchema);
