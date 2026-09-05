const mongoose = require('mongoose');

const Schema = mongoose.Schema ;
// Sub-schema for individual items inside an order
const orderItemSchema = new Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    // Snapshots: Freezes the product details at purchase time
    name: { 
        type: String, 
        required: true 
    }, 
    price: { 
        type: Number, 
        required: true 
    }, 
    quantity: { 
        type: Number, 
        required: true, 
        min: 1 
    }
});

// Main Order Schema for Algerian Guest Checkout (Cash on Delivery)
const orderSchema = new Schema({
    // Guest Shipping Details
    shippingDetails: {
        fullName: { 
            type: String, 
            required: [true, 'Full name is required'], 
            trim: true 
        },
        phone: { 
            type: String, 
            required: [true, 'Phone number is required'], 
            trim: true 
        },
        wilaya: { 
            type: String, 
            required: [true, 'Wilaya is required'] 
        },
        baladiya: { 
            type: String, 
            required: [true, 'Baladiya is required'] 
        },
        deliveryType: { 

            type: String, 
            enum: ['home', 'desk'], 
            default: 'home' 
        }
    },

    // Order Items & Financial Summaries
    items: [orderItemSchema],
    totalAmount: { 
        type: Number, 
        required: true 
    },
    shippingCost: { 
        type: Number, 
        required: true, 
        default: 0 
    },

    // Admin Confirmation Workflow (COD)
    status: {
        type: String,
        enum: ['Pending_Confirmation', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending_Confirmation'
    },
    adminNotes: { 
        type: String, 
        trim: true 
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Order', orderSchema);