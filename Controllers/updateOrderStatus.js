const Order = require("../models/order") ;

// @desc    Update Order Status & Restock on Cancellation (Admin Only)
// @route   PATCH /api/v1/orders/:id/status
const updateOrderStatus = async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const previousStatus = order.status;

        // Prevent updating an order that is already cancelled
        if (previousStatus === 'Cancelled') {
            return res.status(400).json({ 
                message: 'Cannot modify an order that has already been cancelled.' 
            });
        }

        // Stock Restoration: Active -> Cancelled
        if (status === 'Cancelled') {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity } // Instantly restore inventory
                });
            }
        }

        order.status = status;
        if (adminNotes !== undefined) order.adminNotes = adminNotes;

        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createGuestOrder, updateOrderStatus };