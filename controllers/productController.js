// Required modules and model
const Product = require("../models/Product");
const getImageUrl = require("../utils/cloudinary");
const mongoose = require("mongoose");

exports.addProduct = async (req, res) => {
  try {
    const file = req.file;
    const imageUrl = await getImageUrl(file.path);

    // Extract data from the request body
    const { name, price, stock } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: "Product name is required." });
    }
    console.log(name)

    // Create a new product document with the provided data
    const newProduct = new Product({
      image: imageUrl,
      name,
      price,
      stock,
    });
    console.log(imageUrl)

    // Save the new product document to the database
    await newProduct.save();

    // Respond with success message
    res.status(201).json({ data: newProduct, status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message});
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};

// Get a product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching product", error: error.message });
  }
};

// update product Logic
exports.updateProduct = async (req, res) => {
  const { productId } = req.params; // Use productId instead of id

  try {
    // Check and convert the ID to ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid product ID format." });
    }

    // Fetch the existing product
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found." });
    }

    // Extract data from the request body
    const { name, price, stock } = req.body;
    const file = req.file; // Get the file from multer

    // Update the image if a new image file is provided
    let imageUrl = existingProduct.image; // Use existing image URL by default
    if (file) {
      imageUrl = await getImageUrl(file.path);
    }

    // Update the product details
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        image: imageUrl,
        name: name || existingProduct.name, // Fallback to existing value if not provided
        price: price || existingProduct.price,
        stock: stock || existingProduct.stock,
      },
      { new: true } // Return the updated document
    );

    res
      .status(200)
      .json({ message: "Product updated successfully", updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete the associated image on Cloudinary
    await cloudinary.uploader.destroy(product.imageId);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
};
