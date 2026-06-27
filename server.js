require('dotenv').config(); // 👈 CRITICAL: Loads your Cloudinary Keys
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch'); // 👈 ADD THIS - npm install node-fetch

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Keep this ONLY if you still have old images in the local /uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
// PRO TIP: Before final hand-off, move this string to your .env file too!
const mongoURI = 'mongodb+srv://AUTO_PARTS_DB:AUTOPARTS123@autoretailpartscluster.xfmrigf.mongodb.net/AutoRetailParts?retryWrites=true&w=majority';

mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB Atlas connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err.message));

// Routes
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const brandRoutes = require('./routes/brandRoutes');

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    // Using your specific credentials
    if (username === 'Tanyi jovial' && password === 'Homeboy19940') {
        res.json({ 
            success: true, 
            token: 'SECRET_RETAIL_KEY_2024' // This is the "Key" the browser will hold
        });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);

// ===== KEEP ALIVE FUNCTION =====
// Prevents Render from sleeping the free tier
const keepAlive = () => {
  console.log('🔄 Keep-alive monitor started - pinging every 10 minutes');
  setInterval(async () => {
    try {
      const response = await fetch('https://autoretail-backend.onrender.com/api/categories');
      console.log(`✅ Keep-alive ping successful: ${response.status}`);
    } catch (error) {
      console.log(`⚠️ Keep-alive ping failed: ${error.message}`);
    }
  }, 10 * 60 * 1000); // Ping every 10 minutes
};

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  keepAlive(); // 👈 Start the keep-alive
});