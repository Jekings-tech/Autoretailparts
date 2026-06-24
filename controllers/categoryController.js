const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        
        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching category',
            error: error.message
        });
    }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Public
exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }
        
        // Check if category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category already exists'
            });
        }
        
        const category = await Category.create({ name });
        
        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating category',
            error: error.message
        });
    }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Public
exports.updateCategory = async (req, res) => {
    try {
        let category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        const { name } = req.body;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }
        
        // Check if new name already exists (excluding current category)
        const existingCategory = await Category.findOne({ 
            name, 
            _id: { $ne: req.params.id } 
        });
        
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category name already exists'
            });
        }
        
        category.name = name;
        await category.save();
        
        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: category
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating category',
            error: error.message
        });
    }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Public
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        // Check if category has associated products
        const Product = require('../models/Product');
        const productCount = await Product.countDocuments({ category: req.params.id });
        
        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category. It has ${productCount} associated product(s).`
            });
        }
        
        await category.deleteOne();
        
        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting category',
            error: error.message
        });
    }
};

// @desc    Seed initial categories
// @route   POST /api/categories/seed
// @access  Public
            exports.seedCategories = async (req, res) => {
    try {
        // 1. FORCE DROP THE INDEX (This kills the slug_1 error forever)
        try {
            await Category.collection.dropIndex('slug_1');
            console.log('Successfully dropped slug index');
        } catch (e) {
            console.log('Slug index already gone');
        }

        // 2. WIPE THE COLLECTION (Starts fresh)
        await Category.deleteMany({});

        const initialCategories = [
            { name: 'Headlights & Lighting' },
            { name: 'Auto Body Parts & Mirrors' },
            { name: 'Engine & Drivetrain' },
            { name: 'Brakes' },
            { name: 'Suspension & Steering' },
            { name: 'Interior Parts' },
            { name: 'Wheels & Tires' },
            { name: 'Tools & Garage' },
            { name: 'Electrical & Sensors' },
            { name: 'Cooling & Exhaust' }
        ];

        // 3. INSERT FRESH
        await Category.insertMany(initialCategories);

        res.status(200).json({ success: true, message: 'Cleaned and Seeded!' });
    } catch (error) {
        console.error("STILL ERRORING:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};
// @desc    Get categories for a specific brand
// @route   GET /api/categories/brand/:brandId
// @access  Public
exports.getCategoriesByBrand = async (req, res) => {
    try {
        // All brands share the same 10 categories
        const categories = await Category.find().sort({ name: 1 });
        
        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
};