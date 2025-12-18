const express = require('express');
const router = express.Router();
const Apartment = require('../models/Apartment');
const Category = require('../models/Category');
const Booking = require('../models/Booking');

// GET /api/search - Search apartments with multiple filters
router.get('/', async (req, res) => {
  try {
    const {
      query,
      location,
      category,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      minCapacity,
      maxCapacity,
      isAvailable,
      amenities,
      sortBy,
      sortOrder,
      page,
      limit
    } = req.query;

    // Build search query
    const searchQuery = {};

    // Text search in title and description
    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }

    // Location filter
    if (location) {
      searchQuery.location = { $regex: location, $options: 'i' };
    }

    // Category filter
    if (category) {
      // If category is ObjectId, use it directly
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        searchQuery.category = category;
      } else {
        // If category is name, find the category first
        const categoryDoc = await Category.findOne({ name: { $regex: category, $options: 'i' } });
        if (categoryDoc) {
          searchQuery.category = categoryDoc._id;
        } else {
          return res.status(200).json({ count: 0, apartments: [] });
        }
      }
    }

    // Price range filter
    if (minPrice || maxPrice) {
      searchQuery.price = {};
      if (minPrice) searchQuery.price.$gte = Number(minPrice);
      if (maxPrice) searchQuery.price.$lte = Number(maxPrice);
    }

    // Bedrooms filter
    if (bedrooms) {
      searchQuery.bedrooms = Number(bedrooms);
    }

    // Bathrooms filter
    if (bathrooms) {
      searchQuery.bathrooms = Number(bathrooms);
    }

    // Capacity range filter
    if (minCapacity || maxCapacity) {
      searchQuery.capacity = {};
      if (minCapacity) searchQuery.capacity.$gte = Number(minCapacity);
      if (maxCapacity) searchQuery.capacity.$lte = Number(maxCapacity);
    }

    // Availability filter
    if (isAvailable !== undefined) {
      searchQuery.isAvailable = isAvailable === 'true';
    }

    // Amenities filter (apartment must have all specified amenities)
    if (amenities) {
      const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
      searchQuery.amenities = { $all: amenitiesArray };
    }

    // Build sort object
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Default sort by newest
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Execute search
    const apartments = await Apartment.find(searchQuery)
      .populate('category', 'name description')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Apartment.countDocuments(searchQuery);

    res.status(200).json({
      count: apartments.length,
      total: total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      apartments: apartments
    });
  } catch (error) {
    res.status(500).json({ error: 'Search failed: ' + error.message });
  }
});

// GET /api/search/categories - Search categories
router.get('/categories', async (req, res) => {
  try {
    const { query } = req.query;
    const searchQuery = {};

    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }

    const categories = await Category.find(searchQuery).sort({ name: 1 });
    res.status(200).json({ count: categories.length, categories: categories });
  } catch (error) {
    res.status(500).json({ error: 'Category search failed: ' + error.message });
  }
});

// GET /api/search/bookings - Search bookings
router.get('/bookings', async (req, res) => {
  try {
    const {
      query,
      guestEmail,
      guestName,
      status,
      apartment,
      checkIn,
      checkOut
    } = req.query;

    const searchQuery = {};

    // Text search in guest name
    if (query) {
      searchQuery.guestName = { $regex: query, $options: 'i' };
    }

    // Guest email filter
    if (guestEmail) {
      searchQuery.guestEmail = { $regex: guestEmail, $options: 'i' };
    }

    // Guest name filter
    if (guestName) {
      searchQuery.guestName = { $regex: guestName, $options: 'i' };
    }

    // Status filter
    if (status) {
      searchQuery.status = status;
    }

    // Apartment filter
    if (apartment) {
      searchQuery.apartment = apartment;
    }

    // Date range filters
    if (checkIn) {
      searchQuery.checkIn = { $gte: new Date(checkIn) };
    }
    if (checkOut) {
      searchQuery.checkOut = { $lte: new Date(checkOut) };
    }

    const bookings = await Booking.find(searchQuery)
      .populate('apartment', 'title location price')
      .sort({ createdAt: -1 });

    res.status(200).json({ count: bookings.length, bookings: bookings });
  } catch (error) {
    res.status(500).json({ error: 'Booking search failed: ' + error.message });
  }
});

module.exports = router;

