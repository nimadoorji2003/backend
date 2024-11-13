const express = require("express");
const router = express.Router();
const multer = require("../utils/multer");

const productController = require("../controllers/productController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

// Log statements to debug
console.log("protect:", protect);
console.log("isAdmin:", isAdmin);
console.log("addProduct:", productController.addProduct);

// POST route to add a new product
router.post(
  "/product",
  protect,
  isAdmin,
  multer.single("image"),
  productController.addProduct
);

// GET route to fetch all products
router.get("/products", productController.getAllProducts);

// GET route to fetch a single product by ID
router.get("/product/:id", productController.getProductById);

// PUT route to update a product
router.put(
  "/product/:productId",
  multer.single("image"),
  productController.updateProduct
);

// DELETE route to delete a product
router.delete("/product/:id", productController.deleteProduct);

module.exports = router;
