const Brand = require('../models/Brand');

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
exports.getAllBrands = async (req, res) => {
    try {
        const brands = await Brand.find().sort({ name: 1 });
        res.status(200).json({
            success: true,
            count: brands.length,
            data: brands
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create brand
// @route   POST /api/brands
// @access  Public
exports.createBrand = async (req, res) => {
    try {
        const { name, logo } = req.body;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Brand name is required'
            });
        }
        
        const existingBrand = await Brand.findOne({ name });
        if (existingBrand) {
            return res.status(400).json({
                success: false,
                message: 'Brand already exists'
            });
        }
        
        const brand = await Brand.create({ name, logo });
        res.status(201).json({
            success: true,
            data: brand
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update brand
// @route   PUT /api/brands/:id
// @access  Public
exports.updateBrand = async (req, res) => {
    try {
        const { name, logo } = req.body;
        const brand = await Brand.findById(req.params.id);
        
        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Brand not found'
            });
        }
        
        brand.name = name || brand.name;
        brand.logo = logo || brand.logo;
        await brand.save();
        
        res.status(200).json({
            success: true,
            data: brand
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete brand
// @route   DELETE /api/brands/:id
// @access  Public
exports.deleteBrand = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        
        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Brand not found'
            });
        }
        
        // Check if products exist with this brand
        const Product = require('../models/Product');
        const productCount = await Product.countDocuments({ brand: req.params.id });
        
        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete brand. It has ${productCount} associated product(s).`
            });
        }
        
        await brand.deleteOne();
        res.status(200).json({
            success: true,
            message: 'Brand deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};