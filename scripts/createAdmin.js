// Script to create initial admin user
// Run with: node scripts/createAdmin.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hostify-apartments';

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@hostify.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@hostify.com',
      password: 'admin123456', // Will be hashed automatically
      role: 'admin',
      isActive: true
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@hostify.com');
    console.log('🔑 Password: admin123456');
    console.log('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

createAdmin();

