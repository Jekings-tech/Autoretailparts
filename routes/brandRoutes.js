const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ ENSURE UPLOADS DIRECTORY EXISTS
const uploadDir = path.join(__dirname, '..', 'uploads', 'brands');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ CONFIGURE MULTER FOR FILE UPLOADS
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).substring(2, 15);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WEBP, and SVG are allowed.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter
});

// ============================
// GET ALL BRANDS
// ============================
router.get('/', async (req, res) => {
    try {
        const brands = await Brand.find().sort({ name: 1 });
        res.json({ success: true, count: brands.length, data: brands });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================
// GET SINGLE BRAND
// ============================
router.get('/:id', async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ success: false, message: 'Brand not found' });
        }
        res.json({ success: true, data: brand });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================
// CREATE BRAND
// ============================
router.post('/', upload.single('logo'), async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name) {
            return res.status(400).json({ success: false, message: 'Brand name is required' });
        }
        
        const brandData = { name };
        
        // ✅ If a file was uploaded, save the path
        if (req.file) {
            brandData.logo = '/uploads/brands/' + req.file.filename;
        } else if (req.body.logo && req.body.logo.length <= 2) {
            // If it's an emoji
            brandData.logo = req.body.logo;
        }
        
        const brand = new Brand(brandData);
        await brand.save();
        
        res.status(201).json({ success: true, data: brand });
    } catch (error) {
        console.error('Create brand error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================
// UPDATE BRAND
// ============================
router.put('/:id', upload.single('logo'), async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ success: false, message: 'Brand not found' });
        }
        
        const { name } = req.body;
        
        if (name) {
            brand.name = name;
        }
        
        // ✅ If a new file was uploaded
        if (req.file) {
            // Delete old image if it exists and is a local file
            if (brand.logo && brand.logo.startsWith('/uploads/')) {
                const oldPath = path.join(__dirname, '..', brand.logo);
                if (fs.existsSync(oldPath)) {
                    try {
                        fs.unlinkSync(oldPath);
                        console.log('✅ Deleted old brand image:', oldPath);
                    } catch (err) {
                        console.log('⚠️ Could not delete old image:', err.message);
                    }
                }
            }
            brand.logo = '/uploads/brands/' + req.file.filename;
        } else if (req.body.logo !== undefined) {
            // If logo field is sent (could be emoji or empty)
            if (req.body.logo && req.body.logo.length <= 2) {
                brand.logo = req.body.logo; // Emoji
            } else if (!req.body.logo) {
                // If logo is empty string, remove the logo
                brand.logo = null;
            }
        }
        
        await brand.save();
        res.json({ success: true, data: brand });
    } catch (error) {
        console.error('Update brand error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================
// DELETE BRAND
// ============================
router.delete('/:id', async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ success: false, message: 'Brand not found' });
        }
        
        // ✅ Delete the brand image if it exists
        if (brand.logo && brand.logo.startsWith('/uploads/')) {
            const imagePath = path.join(__dirname, '..', brand.logo);
            if (fs.existsSync(imagePath)) {
                try {
                    fs.unlinkSync(imagePath);
                    console.log('✅ Deleted brand image:', imagePath);
                } catch (err) {
                    console.log('⚠️ Could not delete image:', err.message);
                }
            }
        }
        
        await Brand.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Brand deleted successfully' });
    } catch (error) {
        console.error('Delete brand error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;