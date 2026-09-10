const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// --- Cloudinary Configuration ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'autoparts_business/brands',  // ✅ Brands folder inside your existing folder
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  }
});

const upload = multer({ storage: storage });

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
// CREATE BRAND (with Cloudinary upload)
// ============================
router.post('/', upload.single('logo'), async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name) {
            return res.status(400).json({ success: false, message: 'Brand name is required' });
        }
        
        const brandData = { name };
        
        // ✅ Cloudinary returns the full URL in req.file.path
        if (req.file) {
            brandData.logo = req.file.path;
            console.log('✅ Brand image uploaded to Cloudinary:', brandData.logo);
        } else if (req.body.logo && req.body.logo.length <= 2) {
            // If emoji
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
// UPDATE BRAND (with Cloudinary upload)
// ============================
router.put('/:id', upload.single('logo'), async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ success: false, message: 'Brand not found' });
        }
        
        const { name } = req.body;
        if (name) brand.name = name;
        
        if (req.file) {
            // Delete old image from Cloudinary
            if (brand.logo && brand.logo.includes('cloudinary.com')) {
                try {
                    // Extract public ID from Cloudinary URL
                    // URL format: https://res.cloudinary.com/CLOUD/image/upload/v123/autoparts_business/brands/filename.jpg
                    const urlParts = brand.logo.split('/');
                    const filenameWithExt = urlParts[urlParts.length - 1];
                    const filename = filenameWithExt.split('.')[0];
                    const publicId = 'autoparts_business/brands/' + filename;
                    
                    await cloudinary.uploader.destroy(publicId);
                    console.log('✅ Deleted old Cloudinary image:', publicId);
                } catch (err) {
                    console.log('⚠️ Could not delete old image:', err.message);
                }
            }
            brand.logo = req.file.path;
            console.log('✅ Brand updated with new Cloudinary image:', brand.logo);
        } else if (req.body.logo !== undefined) {
            if (req.body.logo && req.body.logo.length <= 2) {
                brand.logo = req.body.logo;
            } else if (!req.body.logo) {
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
        
        // Delete from Cloudinary
        if (brand.logo && brand.logo.includes('cloudinary.com')) {
            try {
                const urlParts = brand.logo.split('/');
                const filenameWithExt = urlParts[urlParts.length - 1];
                const filename = filenameWithExt.split('.')[0];
                const publicId = 'autoparts_business/brands/' + filename;
                
                await cloudinary.uploader.destroy(publicId);
                console.log('✅ Deleted from Cloudinary:', publicId);
            } catch (err) {
                console.log('⚠️ Could not delete from Cloudinary:', err.message);
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