const Category = require('../models/category') ;
const Product = require('../models/products') ;

// @desc Get All Products (Public + Dynamic Search, Filter, Sort, Paginate)
// @route GET /api/v1/products
const getProducts = async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice, sort, page = 1, limit = 10 } = req.query;

        // 1. Build basic filter object
        const filter = {};

        // Keyword Search (uses compound text index in Product model)
        if (search) {
            filter.$text = { $search: search };
        }

        // Filter by Category Slug
        if (category) {
            const categoryDoc = await Category.findOne({ slug: category });
            if (categoryDoc) {
                filter.category = categoryDoc._id;
            } else {
                // If category slug doesn't exist, return empty results early
                return res.json({ products: [], page: Number(page), pages: 0, total: 0 });
            }
        }

        // Price Range Filter ($gte = Greater Than or Equal, $lte = Less Than or Equal)
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        // 2. Initialize Mongoose Query instance
        let query = Product.find(filter).populate('category', 'name slug');

        // 3. Apply Sorting
        if (sort === 'price_asc') {
            query = query.sort({ price: 1 });
        } else if (sort === 'price_desc') {
            query = query.sort({ price: -1 });
        } else {
            query = query.sort({ createdAt: -1 }); // Default to newest
        }

        // 4. Apply Pagination
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.max(1, Number(limit));
        const skip = (pageNum - 1) * limitNum;

        query = query.skip(skip).limit(limitNum);

        // 5. Execute product query & total count in parallel
        const [products, totalProducts] = await Promise.all([
            query,
            Product.countDocuments(filter)
        ]);

        res.json({
            products,
            page: pageNum,
            pages: Math.ceil(totalProducts / limitNum),
            total: totalProducts
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
