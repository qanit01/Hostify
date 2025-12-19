const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Initialize Express app
const app = express();

// ==============================
// Middleware
// ==============================
app.use(cors({
  origin: '*', // allow frontend access (adjust in production)
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==============================
// Environment Variables
// ==============================
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-api-assignment';

// ==============================
// MongoDB Connection
// ==============================
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log(`📦 Database Host: ${mongoose.connection.host}`);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1); // Stop server if DB fails
  });

// ==============================
// Static Files (Uploads)
// ==============================
app.use('/uploads', express.static('uploads'));

// ==============================
// API Routes
// ==============================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/apartments', require('./routes/apartmentRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/media', require('./routes/mediaRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));

// ==============================
// Root Route (Health Check)
// ==============================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Hostify Apartment Booking API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      categories: '/api/categories',
      apartments: '/api/apartments',
      bookings: '/api/bookings',
      media: '/api/media',
      search: '/api/search'
    }
  });
});

// ==============================
// 404 Handler
// ==============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// ==============================
// Global Error Handler
// ==============================
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error'
  });
});

// ==============================
// Start Server
// ==============================
app.listen(PORT, () => {
  console.log('🚀 Server started successfully');
  console.log(`🌐 API running at http://localhost:${PORT}`);
});
