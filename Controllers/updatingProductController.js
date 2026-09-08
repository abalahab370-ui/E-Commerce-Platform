const Product = require('../models/product');
const Category = require('../models/category');
const cloudinary = require('../config/cloudinary.js');

// @desc    Update Product Details & Manage Images (Admin Only)
// @route   PATCH /api/v1/products/:id
const updateProduct = async (req, res) => {
    try {
        const { name, description, price, stock, categoryId, isFeatured, removedImageIds, variants } = req.body;

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // 1. Verify Category if categoryId is being changed
        if (categoryId) {
            const categoryExists = await Category.findById(categoryId);
            if (!categoryExists) {
                return res.status(404).json({ message: 'Category not found' });
            }
            product.category = categoryId;
        }

        // 2. Remove specified images from Cloudinary & product array
        if (removedImageIds) {
            let idsToDelete = [];
            try {
                idsToDelete = typeof removedImageIds === 'string' 
                    ? JSON.parse(removedImageIds) 
                    : removedImageIds;
            } catch {
                return res.status(400).json({ message: 'Invalid format for removedImageIds' });
            }

            if (Array.isArray(idsToDelete) && idsToDelete.length > 0) {
                const deletePromises = idsToDelete.map(publicId => 
                    cloudinary.uploader.destroy(publicId)
                );
                await Promise.all(deletePromises);

                product.images = product.images.filter(
                    img => !idsToDelete.includes(img.publicId)
                );
            }
        }

        // 3. Upload new images to Cloudinary (if any)
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
            product.images.push(...newlyUploadedImages);
        }

        // 4. Update shared text fields (DRY)
        if (name) product.name = name.trim();
        if (description) product.description = description.trim();
        if (price !== undefined) product.price = Number(price);
        if (isFeatured !== undefined) {
            product.isFeatured = isFeatured === 'true' || isFeatured === true;
        }

        // 5. Update inventory based on database document type
        if (product.hasVariants) {
            // Variant product branch
            if (variants) {
                let parsedVariants = variants;
                if (typeof variants === 'string') {
                    try {
                        parsedVariants = JSON.parse(variants);
                    } catch {
                        return res.status(400).json({ message: 'Invalid variants JSON format' });
                    }
                }
                if (Array.isArray(parsedVariants)) {
                    product.variants = parsedVariants;
                }
            }
        } else {
            // Standard product branch
            if (stock !== undefined) {
                product.stock = Number(stock);
            }
        }

        const updatedProduct = await product.save();
        res.status(200).json(updatedProduct);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = updateProduct;