const mongoose = require("mongoose");
const Category = require("../../models/category");
const Product = require("../../models/product");
const cloudinary = require("../../config/cloudinary");

// Helper function to handle Cloudinary stream uploads from memory buffer
const uploadFromBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "storedz/categories" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    stream.end(buffer);
  });
};

const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description, isFeatured, featuredTitle, featuredSubtitle, buttonText } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if a new image buffer exists in memory
    if (req.file && req.file.buffer) {
      // 1. Destroy existing category images from Cloudinary
      const existingImages = Array.isArray(category.bannerImage) 
        ? category.bannerImage 
        : category.bannerImage ? [category.bannerImage] : [];

      for (const img of existingImages) {
        if (img && img.publicId) {
          await cloudinary.uploader.destroy(img.publicId);
        }
      }

      // 2. Upload memory buffer to Cloudinary
      const uploadResult = await uploadFromBuffer(req.file.buffer);

      // 3. Save the returned secure_url and public_id
      category.bannerImage = [{
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id
      }];
    }

    if (name) {
      category.name = name;
      category.slug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    if (description !== undefined) category.description = description;
    if (isFeatured !== undefined) category.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (featuredTitle !== undefined) category.featuredTitle = featuredTitle;
    if (featuredSubtitle !== undefined) category.featuredSubtitle = featuredSubtitle;
    if (buttonText !== undefined) category.buttonText = buttonText;

    const result = await category.save();

    return res.status(200).json({ 
      message: 'Category updated successfully', 
      updatedCategory: result 
    });

  } catch (err) {
    console.error(`Error updating category: ${err}`);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = updateCategory;