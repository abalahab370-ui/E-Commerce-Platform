const Product = require('../models/Product');
const Category = require('../models/Category');
const cloudinary = require('../config/cloudinary');

// @desc Create Product (Admin Only)
// @route POST /api/v1/products
const createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, categoryId, isFeatured } = req.body;

        if (!name || !description || !price || !stock || !categoryId) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        // 1. Verify the assigned Category actually exists
        const categoryExists = await Category.findById(categoryId);
        if (!categoryExists) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // 2. Upload images to Cloudinary (if any were uploaded)
        let uploadedImages = [];
        if (req.files && req.files.length > 0) {
            const imageUploadPromises = req.files.map(file => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: 'ecommerce_products' },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve({
                                url: result.secure_url,
                                publicId: result.public_id
                            });
                        }
                    );
                    stream.end(file.buffer);
                });
            });

            uploadedImages = await Promise.all(imageUploadPromises);
        }

        // 3. Save product to MongoDB
        const newProduct = await Product.create({
            name,
            description,
            price: Number(price),
            stock: Number(stock),
            category: categoryId,
            isFeatured: isFeatured || false,
            images: uploadedImages
        });

        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createProduct };