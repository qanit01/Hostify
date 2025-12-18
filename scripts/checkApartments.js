// Script to check apartments in database
require('dotenv').config();
const mongoose = require('mongoose');
const Apartment = require('../models/Apartment');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-api-assignment';

async function checkApartments() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all apartments
    const allApartments = await Apartment.find().populate('category', 'name');
    console.log(`📊 Total apartments in database: ${allApartments.length}\n`);

    if (allApartments.length === 0) {
      console.log('❌ No apartments found in database!');
      process.exit(0);
    }

    // Get available apartments
    const availableApartments = await Apartment.find({ isAvailable: true }).populate('category', 'name');
    console.log(`✅ Available apartments: ${availableApartments.length}`);
    console.log(`❌ Unavailable apartments: ${allApartments.length - availableApartments.length}\n`);

    console.log('📋 All Apartments:');
    console.log('='.repeat(80));
    allApartments.forEach((apt, index) => {
      console.log(`\n${index + 1}. ${apt.title}`);
      console.log(`   Location: ${apt.location}`);
      console.log(`   Price: PKR ${apt.price}/night`);
      console.log(`   Available: ${apt.isAvailable ? '✅ YES' : '❌ NO'}`);
      console.log(`   Category: ${apt.category?.name || 'N/A'}`);
      console.log(`   ID: ${apt._id}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('\n💡 If an apartment is not showing on the website:');
    console.log('   1. Check if isAvailable is true');
    console.log('   2. Edit the apartment in admin panel and check the "Available" checkbox');
    console.log('   3. Make sure the apartment has all required fields (title, location, price, etc.)');

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkApartments();

