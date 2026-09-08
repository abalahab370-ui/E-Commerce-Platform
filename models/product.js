const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Variant sub-schema for clothing & shoes
const variantSchema = new Schema({
    color: { 
        type: String, 
        trim: true, 
        default: '' 
    },
    size: { 
        type: String, 
        trim: true, 
        default: '' 
    },
    stock: {
        type: Number,
        required: [true, 'Variant stock count is required'],
        min: [0, 'Variant stock cannot be negative'],
        default: 0
    },
    sku: { 
        type: String, 
        trim: true, 
        default: '' 
    }
}, { _id: true });

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    stock: {
        type: Number,
        required: [true, 'Stock count is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Product must belong to a category']
    },
    images: [{
        url: { type: String, required: true },
        publicId: { type: String, required: true }
    }],
    isFeatured: {
        type: Boolean,
        default: false
    },
    hasVariants: {
        type: Boolean,
        default: false
    },
    variants: [variantSchema]
}, 
{ 
    timestamps: true 
});

// Text index for search
productSchema.index(
    { name: 'text', description: 'text' },
    { weights: { name: 10, description: 1 } }
);

module.exports = mongoose.model('Product', productSchema);