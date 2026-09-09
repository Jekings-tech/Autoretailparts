const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ===== CREATE UPLOADS FOLDER IF IT DOESN'T EXIST =====
const uploadDir = path.join(__dirname, '../uploads/brands');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ===== SETUP MULTER FOR FILE UPLOAD =====
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
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
        const brands = await Brand.find({ isActive: true }).sort({ createdAt: -1 });
        res.json({ success: true, count: brands.length, data: brands });
    } catch (error) {
        console.error('GET brands error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ===== GET SINGLE BRAND =====
router.get('/:id', async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ success: false, error: 'Brand not found' });
        }
        res.json({ success: true, data: brand });
    } catch (error) {
        console.error('GET brand error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ===== CREATE BRAND WITH IMAGE UPLOAD =====
router.post('/', upload.single('logo'), async (req, res) => {
    try {
        console.log('POST /brands - Request received');
        console.log('Body:', req.body);
        console.log('File:', req.file);

        const { name } = req.body;
        
        if (!name || name.trim() === '') {
            return res.status(400).json({ success: false, error: 'Brand name is required' });
        }

        // Check if brand already exists
        const existingBrand = await Brand.findOne({ name: name.trim() });
        if (existingBrand) {
            return res.status(400).json({ success: false, error: 'Brand already exists' });
        }

        const brandData = {
            name: name.trim(),
            isActive: req.body.isActive !== undefined ? req.body.isActive : true
        };
        
        // If image was uploaded, save the path
        if (req.file) {
            brandData.logo = '/uploads/brands/' + req.file.filename;
            console.log('Image uploaded:', brandData.logo);
        } else if (req.body.logo && req.body.logo.trim() !== '') {
            brandData.logo = req.body.logo.trim();
        } else {
            brandData.logo = '🚗';
        }
        
        const brand = new Brand(brandData);
        await brand.save();
        
        console.log('Brand created:', brand);
        
        res.status(201).json({ 
            success: true, 
            data: brand,
            message: 'Brand created successfully'
        });
    } catch (error) {
        console.error('POST brand error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ===== UPDATE BRAND WITH IMAGE =====
router.put('/:id', upload.single('logo'), async (req, res) => {
    try {
        console.log('PUT /brands/' + req.params.id);
        console.log('Body:', req.body);
        console.log('File:', req.file);

        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ success: false, error: 'Brand not found' });
        }
        
        // Update basic fields
        if (req.body.name) {
            brand.name = req.body.name.trim();
        }
        
        if (req.body.isActive !== undefined) {
            brand.isActive = req.body.isActive;
        }
        
        // If new image uploaded, update logo
        if (req.file) {
            brand.logo = '/uploads/brands/' + req.file.filename;
            console.log('Image updated:', brand.logo);
        } else if (req.body.logo !== undefined) {
            brand.logo = req.body.logo.trim() || '🚗';
        }
        
        await brand.save();
        
        console.log('Brand updated:', brand);
        
        res.status(200).json({ 
            success: true, 
            data: brand,
            message: 'Brand updated successfully'
        });
    } catch (error) {
        console.error('PUT brand error:', error);
        res.status(500).json({ 
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
        console.error('DELETE brand error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;