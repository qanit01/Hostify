const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-api-assignment';
const PORT = process.env.PORT || 5000;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  });

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/apartments', require('./routes/apartmentRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/media', require('./routes/mediaRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Hostify by Abdullah - Apartment Booking API',
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}`);
});

