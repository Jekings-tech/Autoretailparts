const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    price: {
       type: Number,
       required: [true, 'Price is required'],
       min: [0, 'Price cannot be negative']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']
    },
    condition: {
        type: String,
        enum: ['New', 'Used', 'Refurbished'],
        default: 'New' // Added a default to prevent missing field errors
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required:false,
},
    images: {
        type: [String],
        default: [] // Default to empty array if no images are uploaded yet
    }
}, { 
    timestamps: true // This replaces your manual updatedAt/createdAt logic automatically
});

module.exports = mongoose.model('Product', productSchema);