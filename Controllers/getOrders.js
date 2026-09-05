const Order = require("../models/order");

// @desc    Get Orders for Dashboard (Filtered by Status, Search, and Pagination)
// @route   GET /api/v1/orders
const getOrders = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 15 } = req.query;

        const filter = {};

        // 1. Filter by Order Status Tab (e.g., 'Pending_Confirmation', 'Confirmed', 'Shipped', etc.)
        if (status) {
            filter.status = status;
        }

        // 2. Search by Customer Full Name or Phone Number using your $regex style
        if (search) {
            // Escape special regex characters to prevent crashes from raw user input
            const safeSearch = search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

            filter.$or = [
                { 'shippingDetails.fullName': { $regex: safeSearch, $options: 'i' } },
                { 'shippingDetails.phone': { $regex: safeSearch, $options: 'i' } }
            ];
        }

        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.max(1, Number(limit));
        const skip = (pageNum - 1) * limitNum;

        // Sorting: FIFO (Oldest first) for Pending calls so rep handles oldest orders first
        const sortDirection = status === 'Pending_Confirmation' ? 1 : -1;

        const [orders, totalOrders] = await Promise.all([
            Order.find(filter)
                .sort({ createdAt: sortDirection })
                .skip(skip)
                .limit(limitNum),
            Order.countDocuments(filter)
        ]);

        res.status(200).json({
            orders,
            page: pageNum,
            pages: Math.ceil(totalOrders / limitNum),
            totalOrders
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = getOrders ;