const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const multer = require('multer');
const path = require('path');

// ===== SETUP MULTER FOR FILE UPLOAD =====
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/brands/');  // 👈 Make sure this folder exists
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// ===== GET ALL BRANDS =====
router.get('/', async (req, res) => {
    try {
        const brands = await Brand.find({ isActive: true });
        res.json({ success: true, data: brands });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ===== CREATE BRAND WITH IMAGE UPLOAD =====
router.post('/', upload.single('logo'), async (req, res) => {
    try {
        const brandData = {
            name: req.body.name,
            isActive: req.body.isActive !== undefined ? req.body.isActive : true
        };
        
        // If image was uploaded, save the path
        if (req.file) {
            brandData.logo = `/uploads/brands/${req.file.filename}`;
        } else if (req.body.logo) {
            brandData.logo = req.body.logo;  // If logo URL or emoji was provided
        } else {
            brandData.logo = '🚗';  // Default emoji
        }
        
        const brand = new Brand(brandData);
        await brand.save();
        
        res.status(201).json({ 
            success: true, 
            data: brand,
            message: 'Brand created successfully'
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ===== UPDATE BRAND WITH IMAGE =====
router.put('/:id', upload.single('logo'), async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ success: false, error: 'Brand not found' });
        }
        
        // Update basic fields
        brand.name = req.body.name || brand.name;
        brand.isActive = req.body.isActive !== undefined ? req.body.isActive : brand.isActive;
        
        // If new image uploaded, update logo
        if (req.file) {
            brand.logo = `/uploads/brands/${req.file.filename}`;
        } else if (req.body.logo) {
            brand.logo = req.body.logo;
        }
        
        await brand.save();
        
        res.status(200).json({ 
            success: true, 
            data: brand,
            message: 'Brand updated successfully'
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ===== DELETE BRAND =====
router.delete('/:id', async (req, res) => {
    try {
        const brand = await Brand.findByIdAndDelete(req.params.id);
        if (!brand) {
            return res.status(404).json({ success: false, error: 'Brand not found' });
        }
        res.json({ success: true, message: 'Brand deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;