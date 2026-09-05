const Product = require('../models/product');
const Category = require('../models/category');
const cloudinary = require('../config/cloudinary.js');

// @desc    Update Product Details & Manage Images (Admin Only)
// @route   PUT /api/v1/products/:id
const updateProduct = async (req, res) => {
    try {
        const { name, description, price, stock, categoryId, isFeatured, removedImageIds } = req.body;

        let product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // 1. Verify new Category if categoryId is being changed
        if (categoryId) {
            const categoryExists = await Category.findById(categoryId);
            if (!categoryExists) {
                return res.status(404).json({ message: 'Category not found' });
            }
            product.category = categoryId;
        }

        // 2. Remove specified images from Cloudinary and product.images array
        // Expects removedImageIds as an array of strings or a single JSON string
        if (removedImageIds) {
            const idsToDelete = typeof removedImageIds === 'string' 
                ? JSON.parse(removedImageIds) 
                : removedImageIds;

            if (Array.isArray(idsToDelete) && idsToDelete.length > 0) {
                // Delete from Cloudinary in parallel
                const deletePromises = idsToDelete.map(publicId => 
                    cloudinary.uploader.destroy(publicId)
                );
                await Promise.all(deletePromises);

                // Filter out deleted images from product's array
                product.images = product.images.filter(
                    img => !idsToDelete.includes(img.publicId)
                );
            }
        }

        // 3. Upload new images to Cloudinary (if any were uploaded)
        if (req.files && req.files.length > 0) {
            const newImagePromises = req.files.map(file => {
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

            const newlyUploadedImages = await Promise.all(newImagePromises);
            // Append new images to existing ones
            product.images.push(...newlyUploadedImages);
        }

        // 4. Update text fields if provided
        if (name) product.name = name;
        if (description) product.description = description;
        if (price !== undefined) product.price = Number(price);
        if (stock !== undefined) product.stock = Number(stock);
        if (isFeatured !== undefined) product.isFeatured = Boolean(isFeatured);

        const updatedProduct = await product.save();
        res.status(200).json(updatedProduct);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { updateProduct };