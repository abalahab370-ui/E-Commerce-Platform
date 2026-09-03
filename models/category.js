const mongoose = require('mongoose');
const Schema = mongoose.Schema ;

const categorySchema = new Schema ({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        trim: true
    }
}
, 
{ 
      timestamps: true 
}
);

module.exports = mongoose.model('category', categorySchema);