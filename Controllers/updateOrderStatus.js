const Order = require("../models/order");
const Product = require("../models/product"); // <-- Added missing Product import

// @desc    Update Order Status & Restock on Cancellation/Retour (Admin Only)
// @route   PATCH /api/v1/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const previousStatus = order.status;

    // Statuses where inventory comes back to the store
    const inactiveStatuses = ['Cancelled', 'Retour'];
    
    const wasInactive = inactiveStatuses.includes(previousStatus);
    const isNowInactive = inactiveStatuses.includes(status);

    // 1. RESTORE STOCK: Moving from Active (Pending/Confirmed/Delivered) -> Cancelled or Retour
    if (!wasInactive && isNowInactive) {
      const restorePromises = order.items.map((item) => {
        const productId = item.product?._id || item.product || item.productId;
        return Product.findByIdAndUpdate(productId, {
          $inc: { stock: item.quantity }
        });
      });
      await Promise.all(restorePromises);
    }

    // 2. RE-DEDUCT STOCK: Moving from Cancelled or Retour -> Active status
    if (wasInactive && !isNowInactive) {
      for (const item of order.items) {
        const productId = item.product?._id || item.product || item.productId;
        const product = await Product.findById(productId);
        if (product) {
          product.stock = Math.max(0, product.stock - item.quantity);
          await product.save();
        }
      }
    }

    // Update order fields
    order.status = status;
    if (adminNotes !== undefined) order.adminNotes = adminNotes;

    const updatedOrder = await order.save();
    return res.status(200).json(updatedOrder);

  } catch (error) {
    console.error(`Error updating order status: ${error.message}`);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = updateOrderStatus;