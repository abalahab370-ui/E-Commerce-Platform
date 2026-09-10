const Product = require("../../models/product") ;

// Get single product by ID
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');
        if (!product) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = getProductById ;