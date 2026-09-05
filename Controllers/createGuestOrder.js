const Order = require('../models/order');
const Product = require('../models/product');
const { getDeliveryFee } = require('../config/deliveryFees'); // Import helper

const createGuestOrder = async (req, res) => {
    try {
        const { shippingDetails, items } = req.body;

        // Validation
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty' });
        }
        if (!shippingDetails || !shippingDetails.fullName || !shippingDetails.phone || !shippingDetails.wilaya || !shippingDetails.baladiya) {
            return res.status(400).json({ message: 'All shipping fields are required' });
        }

        let itemsTotal = 0;
        const processedItems = [];

        // Validate stock & calculate products total using DB prices
        for (const item of items) {
            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.name || item.productId}` });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ 
                    message: `Insufficient stock for "${product.name}". Only ${product.stock} left in stock.` 
                });
            }

            itemsTotal += product.price * item.quantity;

            processedItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity
            });

            // Deduct stock
            product.stock -= item.quantity;
            await product.save();
        }

        // Calculate dynamic delivery fee via helper file
        const shippingCost = getDeliveryFee(shippingDetails.wilaya, shippingDetails.deliveryType);
        
        // Final Bill = Products total + Dynamic Shipping Fee
        const grandTotal = itemsTotal + shippingCost;

        const order = new Order({
            shippingDetails,
            items: processedItems,
            totalAmount: grandTotal,
            shippingCost,
            status: 'Pending_Confirmation'
        });

        const savedOrder = await order.save();

        res.status(201).json({
            message: 'Order placed successfully! We will call you shortly to confirm.',
            orderId: savedOrder._id,
            totalAmount: grandTotal,
            shippingCost
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = createGuestOrder ;