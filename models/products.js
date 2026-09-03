const mongoose = require('mongoose');
const Schema = mongoose.Schema ;

const productSchema = new Schema ({
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
    }
}, 
{ 
      timestamps: true 
}
);

// Create a compound text index for searching name and description
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('product', productSchema);