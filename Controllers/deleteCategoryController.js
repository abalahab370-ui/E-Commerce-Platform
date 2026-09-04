const mongoose = require("mongoose");
const Category = require("../models/category");
const Product = require("../models/products");

const deleteCategory = async (req, res) => {
  try {
    // First the admin Should Send the id of the category that he want to delete , But at this point there is already iteams releated to this category So we have to decide wather we cant to delete them too cuz that is a conflict So maybe Updating a Category At this Point Would be Better then Deleting it !
    const { categoryId } = req.params; // Changed to req.params for route matching (/categories/:categoryId)
    
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // we have to check if there are Product related to this category !
    // Using countDocuments is faster than find() as it doesn't pull full product arrays into memory
    const productCount = await Product.countDocuments({ category: categoryId });
    if (productCount > 0) {
      // it think we can also do : if (!products) ! 
      // Note: in JS, empty arrays [] are truthy, so checking (productCount > 0) is required
      return res.status(400).json({ message: 'Cannot delete category with associated products' });
    }

    // else we can delete this category : 
    const result = await Category.deleteOne({ _id: categoryId });
    return res.status(200).json({ message: 'Category deleted successfully' });

  } catch (err) {
    console.error(`Sir we have an error in deleting category : ${err}`);
    return res.status(500).json({ message: 'Internal Server ERROR' });
  }
};

module.exports = deleteCategory ; 