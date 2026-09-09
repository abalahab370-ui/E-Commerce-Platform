const Order = require("../models/order");
const Product = require("../models/product");

// @desc    Update Order Status & Restock/Re-deduct on Cancellation/Retour (v2)
// @route   PATCH /api/v2/orders/:id/status
const updateOrderStatusV2 = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const previousStatus = order.status;
    const inactiveStatuses = ['Cancelled', 'Retour'];
    
    const wasInactive = inactiveStatuses.includes(previousStatus);
    const isNowInactive = inactiveStatuses.includes(status);

    // Helper: Handles inventory restoration/deduction for Standard & Variant items
    const updateInventory = async (item, isRestock) => {
      const productId = item.product?._id || item.product || item.productId;
      const product = await Product.findById(productId);
      if (!product) return;

      const qty = Number(item.quantity) || 1;

      if (product.hasVariants && Array.isArray(product.variants)) {
        // Find variant by variantId or Color + Size match
        const variant = product.variants.find(v => 
          (item.variantId && v._id.toString() === item.variantId.toString()) ||
          (v.color === item.color && v.size === item.size)
        );

        if (variant) {
          if (isRestock) {
            variant.stock += qty;
          } else {
            variant.stock = Math.max(0, variant.stock - qty);
          }
        }
      } else {
        // Standard Product Branch
        if (isRestock) {
          product.stock += qty;
        } else {
          product.stock = Math.max(0, product.stock - qty);
        }
      }

      await product.save();
    };

    // 1. RESTORE STOCK: Active -> Cancelled / Retour
    if (!wasInactive && isNowInactive) {
      for (const item of order.items) {
        await updateInventory(item, true);
      }
    }

    // 2. RE-DEDUCT STOCK: Cancelled / Retour -> Active
    if (wasInactive && !isNowInactive) {
      for (const item of order.items) {
        await updateInventory(item, false);
      }
    }

    // Update order fields
    order.status = status;
    if (adminNotes !== undefined) order.adminNotes = adminNotes;

    const updatedOrder = await order.save();
    return res.status(200).json(updatedOrder);

  } catch (error) {
    console.error(`Error updating order status (v2): ${error.message}`);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = updateOrderStatusV2;