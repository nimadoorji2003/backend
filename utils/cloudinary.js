const cloudinary = require("cloudinary").v2;
require("dotenv").config({ path: "./.env" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getImageUrl = async (imageFile) => {
  try {
    const cloud = await cloudinary.uploader.upload(imageFile);
    return cloud.secure_url;
  } catch (error) {
    throw error;
  }
};

module.exports = getImageUrl;
