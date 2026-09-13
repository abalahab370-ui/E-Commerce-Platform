const mongoose = require("mongoose");
const Category = require("../../models/category");
const Product = require("../../models/product");
const cloudinary = require("../../config/cloudinary");

const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Block deletion if products are currently assigned to this category
    const productCount = await Product.countDocuments({ category: categoryId });
    if (productCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with associated products' 
      });
    }

    // Delete stored banner images from Cloudinary using publicId
    if (Array.isArray(category.bannerImage)) {
      for (const img of category.bannerImage) {
        if (img && img.publicId) {
          await cloudinary.uploader.destroy(img.publicId);
        }
      }
    }

    // Delete the category document from MongoDB
    await Category.deleteOne({ _id: categoryId });

    return res.status(200).json({ message: 'Category deleted successfully' });

  } catch (err) {
    console.error(`Error deleting category: ${err}`);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = deleteCategory;