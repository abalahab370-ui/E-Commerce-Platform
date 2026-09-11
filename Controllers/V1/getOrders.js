const Order = require("../../models/order");

// @desc    Get Orders for Dashboard (Filtered strictly within active Status Tab)
// @route   GET /api/v1/orders
const getOrders = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 15 } = req.query;

        const filter = {};

        // 1. Always enforce the selected status tab
        if (status) {
            filter.status = status;
        }

        // 2. Apply $text search scoped STRICTLY inside that status tab
        if (search && search.trim() !== '') {
            filter.$text = {
                $search: search.trim(),
                $caseSensitive: false,
                $diacriticSensitive: false
            };
        }

        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.max(1, Number(limit));
        const skip = (pageNum - 1) * limitNum;

        // FIFO for pending orders, LIFO for finished statuses
        const sortDirection = status === 'Pending_Confirmation' ? 1 : -1;

        const [orders, totalOrders] = await Promise.all([
            Order.find(filter)
                .sort({ createdAt: sortDirection })
                .skip(skip)
                .limit(limitNum)
                .populate("items.product"),
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

module.exports = getOrders;