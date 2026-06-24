const Product = require('../models/Product');
const Category = require('../models/Category');

// NOTE: We removed fs and path because Cloudinary handles storage now.

// @desc    Get all products with category details
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate('category', 'name')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching products', error: error.message });
    }
};

// @desc    Create new product
exports.createProduct = async (req, res) => {
    try {
        // req.files is already populated by the multer-cloudinary middleware in your routes
        const { name, category, condition, price, description } = req.body;
        
        if (!name || !category || !condition || !price || !description) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        // Map Cloudinary URLs from req.files
        const images = req.files ? req.files.map(file => file.path) : [];
        
        if (images.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one image is required' });
        }

        const product = await Product.create({
            name,
            category,
            condition,
            price: parseFloat(price),
            description,
            images // These are now permanent URLs (https://...)
        });

        const populatedProduct = await Product.findById(product._id).populate('category', 'name');
        
        res.status(201).json({ success: true, message: 'Product created successfully', data: populatedProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating product', error: error.message });
    }
};

// @desc    Update product
exports.updateProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const { name, category, condition, price, description } = req.body;
        
        // Update basic fields
        product.name = name || product.name;
        product.category = category || product.category;
        product.condition = condition || product.condition;
        product.price = price ? parseFloat(price) : product.price;
        product.description = description || product.description;

        // If new images were uploaded to Cloudinary
        if (req.files && req.files.length > 0) {
            // We replace the old image array with the new Cloudinary URLs
            product.images = req.files.map(file => file.path);
        }
        
        await product.save();
        
        const updatedProduct = await Product.findById(product._id).populate('category', 'name');
        
        res.status(200).json({ success: true, message: 'Product updated successfully', data: updatedProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating product', error: error.message });
    }
};

// @desc    Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Note: For a professional gig, you could also delete images from Cloudinary 
        // using their SDK, but simply deleting the product from Mongo is enough for now.
        await product.deleteOne();
        
        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting product', error: error.message });
    }
};

// Keep your getProduct and searchProducts functions as they were...
// @desc    Get single product by ID (This was missing!)
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name');
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching product', error: error.message });
    }
};

// @desc    Search products
exports.searchProducts = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const products = await Product.find(query).populate('category', 'name');
        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Search failed', error: error.message });
    }
};
// @desc    Get products by brand and category
// @route   GET /api/products/brand/:brandId/category/:categoryId
// @access  Public
exports.getProductsByBrandAndCategory = async (req, res) => {
    try {
        const { brandId, categoryId } = req.params;
        
        const query = {
            brand: brandId,
            category: categoryId
        };
        
        const products = await Product.find(query)
            .populate('category', 'name')
            .populate('brand', 'name')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
};

// @desc    Get products by brand only
// @route   GET /api/products/brand/:brandId
// @access  Public
exports.getProductsByBrand = async (req, res) => {
    try {
        const { brandId } = req.params;
        
        const products = await Product.find({ brand: brandId })
            .populate('category', 'name')
            .populate('brand', 'name')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
};