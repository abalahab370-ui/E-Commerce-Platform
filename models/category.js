const mongoose = require('mongoose');
const Schema = mongoose.Schema ;

const categorySchema = new Schema ({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true ,lowercase: true },
    isFeatured: { type: Boolean, default: false },
    bannerImage: [{
        url: { type: String, required: true },
        publicId: { type: String, required: true }
    }], // Recommended: 1200x800px landscape image
    featuredTitle: { type: String, default: '' }, // e.g., "Minimalist Home Decor"
    featuredSubtitle: { type: String, default: '' }, // e.g., "Curated Essentials"
    buttonText: { type: String, default: 'Explore Collection' } // e.g., "Shop The Look"
}, { timestamps: true });


module.exports = mongoose.model('Category', categorySchema);