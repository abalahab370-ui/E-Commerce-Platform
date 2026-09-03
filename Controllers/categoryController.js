const Category = require('../models/category');

// @desc Create Category (Admin Only)
// @route POST /api/v1/categories
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ message: 'Category name is required' });

        const slug = name.toLowerCase().split(' ').join('-');
        
        const category = await Category.create({ name, slug, description });
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
            //alphabitique sorting of the categories :
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createCategory, getAllCategories };