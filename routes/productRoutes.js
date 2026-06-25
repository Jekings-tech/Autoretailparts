const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
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
    folder: 'autoparts_business',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  }
});

const upload = multer({ storage: storage });

// --- ROUTES ---

// GET all products
router.get('/', productController.getAllProducts);

// GET products by brand (MUST be BEFORE /:id)
router.get('/brand/:brandId', productController.getProductsByBrand);

// GET products by brand and category (MUST be BEFORE /:id)
router.get('/brand/:brandId/category/:categoryId', productController.getProductsByBrandAndCategory);

// GET search products
router.get('/search', productController.searchProducts);

// GET single product by ID (MUST be LAST)
router.get('/:id', productController.getProductById);

// POST create product
router.post('/', upload.array('images', 10), productController.createProduct);

// PUT update product
router.put('/:id', upload.array('images', 10), productController.updateProduct);

// DELETE product
router.delete('/:id', productController.deleteProduct);

module.exports = router;