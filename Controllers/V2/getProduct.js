const Category = require('../../models/category');
const Product = require('../../models/product');

// @desc Get All Products (Public + Dynamic Search, Filter, Sort, Paginate)
// @route GET /api/v1/products
const getProducts = async (req, res) => {
    try {
        const {
            search,
            category,
            minPrice,
            maxPrice,
            sort,
            page = 1,
            limit = 10
        } = req.query;

        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.max(1, Number(limit));
        const skip = (pageNum - 1) * limitNum;

        // 1. Build primary filter object
        const filter = {};

        // Primary Keyword Search (MongoDB Text Index)
        if (search && search.trim() !== '') {
            filter.$text = { $search: search.trim() };
        }

        // Explicit Category Slug Filter (e.g., from dropdown)
        if (category) {
            const categoryDoc = await Category.findOne({ slug: category });
            if (categoryDoc) {
                filter.category = categoryDoc._id;
            } else {
                return res.json({ products: [], page: pageNum, pages: 0, total: 0 });
            }
        }

        // Price Range Filter
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        // 2. Build Query & Sorting
        let query = Product.find(filter).populate('category', 'name slug');

        if (sort === 'price_asc') {
            query = query.sort({ price: 1 });
        } else if (sort === 'price_desc') {
            query = query.sort({ price: -1 });
        } else if (search && search.trim() !== '') {
            query = query
                .select({ score: { $meta: 'textScore' } })
                .sort({ score: { $meta: 'textScore' } });
        } else {
            query = query.sort({ createdAt: -1 });
        }

        query = query.skip(skip).limit(limitNum);

        // 3. Execute Primary Query
        let [products, totalProducts] = await Promise.all([
            query,
            Product.countDocuments(filter)
        ]);

        // 4. FALLBACK: Run only if 0 TOTAL products were matched across the entire database
        if (totalProducts === 0 && search && search.trim() !== '' && !category) {
            const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            // Find matching category IDs using standard $regex syntax
            const matchingCategories = await Category.find({
                $or: [
                    { name: { $regex: safeSearch, $options: 'i' } },
                    { slug: { $regex: safeSearch, $options: 'i' } }
                ]
            }).select('_id');

            if (matchingCategories.length > 0) {
                const categoryIds = matchingCategories.map(c => c._id);

                // Build fallback filter while maintaining price filters
                const fallbackFilter = { category: { $in: categoryIds } };
                if (minPrice || maxPrice) fallbackFilter.price = filter.price;

                // Build paginated & sorted fallback query
                let fallbackQuery = Product.find(fallbackFilter).populate('category', 'name slug');

                if (sort === 'price_asc') fallbackQuery = fallbackQuery.sort({ price: 1 });
                else if (sort === 'price_desc') fallbackQuery = fallbackQuery.sort({ price: -1 });
                else fallbackQuery = fallbackQuery.sort({ createdAt: -1 });

                fallbackQuery = fallbackQuery.skip(skip).limit(limitNum);

                // Execute fallback query
                [products, totalProducts] = await Promise.all([
                    fallbackQuery,
                    Product.countDocuments(fallbackFilter)
                ]);
            }
        }

        // 5. Send Response
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

module.exports = getProducts;