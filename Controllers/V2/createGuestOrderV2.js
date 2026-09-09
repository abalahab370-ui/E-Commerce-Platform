const Order = require('../models/order');
const Product = require('../models/product');
const { getDeliveryFee } = require('../config/deliveryFees');

// @desc    Create Guest Order with Variant & Standard Stock Validation (v2)
// @route   POST /api/v2/orders/guest
const createGuestOrderV2 = async (req, res) => {
    try {
        const { shippingDetails, items } = req.body;

        // 1. Basic Payload Validation
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty' });
        }

        if (
            !shippingDetails ||
            !shippingDetails.fullName ||
            !shippingDetails.phone ||
            !shippingDetails.wilaya ||
            !shippingDetails.baladiya
        ) {
            return res.status(400).json({ message: 'All shipping fields are required' });
        }

        let itemsTotal = 0;
        const processedItems = [];
        
        // Map to prevent duplicate Product.findById calls if cart has multiple variants of the same product
        const productsMap = new Map(); 

        // 2. Process Cart Items & Deduct Stock In-Memory
        for (const item of items) {
            const productId = (item.productId || item._id || item.product).toString();
            
            // Re-use product instance if already fetched in this order
            let product = productsMap.get(productId);
            if (!product) {
                product = await Product.findById(productId);
                if (!product) {
                    return res.status(404).json({ message: `Product not found: ${item.name || productId}` });
                }
                productsMap.set(productId, product);
            }

            const requestedQty = Number(item.quantity) || 1;
            let itemColor = item.color || null;
            let itemSize = item.size || null;
            let variantId = item.variantId || null;

            if (product.hasVariants && Array.isArray(product.variants)) {
                // VARIANT PRODUCT BRANCH
                const variant = product.variants.find(v => 
                    (variantId && v._id.toString() === variantId.toString()) ||
                    (v.color === itemColor && v.size === itemSize)
                );

                if (!variant) {
                    return res.status(400).json({ 
                        message: `Selected option (Color: ${itemColor || 'N/A'}, Size: ${itemSize || 'N/A'}) for "${product.name}" is no longer available.` 
                    });
                }

                if (variant.stock < requestedQty) {
                    return res.status(400).json({ 
                        message: `Insufficient stock for "${product.name}" (${variant.color} / ${variant.size}). Only ${variant.stock} left.` 
                    });
                }

                // Deduct Variant Stock in memory
                variant.stock -= requestedQty;
                variantId = variant._id;
                itemColor = variant.color;
                itemSize = variant.size;

            } else {
                // STANDARD PRODUCT BRANCH
                if (product.stock < requestedQty) {
                    return res.status(400).json({ 
                        message: `Insufficient stock for "${product.name}". Only ${product.stock} left in stock.` 
                    });
                }

                // Deduct Standard Stock in memory
                product.stock -= requestedQty;
            }

            // Price Calculation using DB pricing
            itemsTotal += product.price * requestedQty;

            // Build item for Order Document
            processedItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: requestedQty,
                variantId,
                color: itemColor,
                size: itemSize
            });
        }

        // =========================================================
        // SAVE ALL PRODUCTS IN PARALLEL (Only reached if all passed)
        // =========================================================
        const savePromises = Array.from(productsMap.values()).map(p => p.save());
        await Promise.all(savePromises);

        // 3. Dynamic Delivery Fee Calculation
        const shippingCost = getDeliveryFee(shippingDetails.wilaya, shippingDetails.deliveryType);
        const grandTotal = itemsTotal + shippingCost;

        // 4. Create & Save Order Document
        const order = new Order({
            shippingDetails,
            items: processedItems,
            totalAmount: grandTotal,
            shippingCost,
            status: 'Pending_Confirmation'
        });

        const savedOrder = await order.save();

        return res.status(201).json({
            message: 'Order placed successfully! We will call you shortly to confirm.',
            orderId: savedOrder._id,
            totalAmount: grandTotal,
            shippingCost
        });

    } catch (error) {
        console.error(`Error creating guest order (v2): ${error.message}`);
        return res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};

module.exports = createGuestOrderV2;