const mongoose = require("mongoose") ;
const Category = require("../models/category") ;
const Product = require("../models/products") ;

const updateCategory = async (req, res) => {
  try {
    // So Updating the category Would be a better option rather then deleting the category , admin is the only one who can update tho !
    // first we have to check for the existing of this category : 
    const { categoryId } = req.params;
    const { name, description } = req.body; // Using req.body for JSON updates

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category Not found' });
    }

    // else it exist So we Update it , and there is No need to update products category cuz it use Id and Rel to category So it gonna be updated Also :
    if (name) {
      category.name = name;
      // Clean slug generation (handles special characters and extra spaces)
      const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      category.slug = slug;
    }

    if (description !== undefined) {
      category.description = description;
    }

    // Saving the New Version :
    const result = await category.save();

    return res.status(200).json({ 
      message: 'category updated succesfully', 
      updatedCategory: result 
    });

  } catch (err) {
    console.error(`Sir we have an error in Updating category : ${err}`);
    return res.status(500).json({ message: 'Internal Server ERROR' });
  }
};

module.exports = updateCategory ;