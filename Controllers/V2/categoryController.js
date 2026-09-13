const Category = require('../../models/category');
const cloudinary = require("../../config/cloudinary");

// Helper to handle Cloudinary stream uploads from a memory buffer
const uploadFromBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'storedz/categories' },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    stream.end(buffer);
  });
};

// @desc Create Category (Admin Only)
// @route POST /api/v1/categories
const createCategory = async (req, res) => {
    try {
        const { 
            name, 
            description, 
            isFeatured, 
            featuredTitle, 
            featuredSubtitle, 
            buttonText 
         } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        // Clean slug formatting
        const slug = name.toLowerCase().trim().replace(/\s+/g, '-');

        // Handle image upload to Cloudinary if Multer captured a file in memory
        let bannerImage = [];
        if (req.file && req.file.buffer) {
            const uploadResult = await uploadFromBuffer(req.file.buffer);
            bannerImage = [{
                url: uploadResult.secure_url,
                publicId: uploadResult.public_id
            }];
        }

        // Create new category document
        const category = await Category.create({
            name,
            slug,
            description,
            isFeatured: isFeatured === 'true' || isFeatured === true,
            featuredTitle,
            featuredSubtitle,
            buttonText,
            bannerImage
        });

        res.status(201).json(category);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Category already exists' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc Get All Categories (Public)
// @route GET /api/v1/categories
const getAllCategories = async (req, res) => {
    try {
        // Alphabetical sorting of the categories
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createCategory, getAllCategories };