const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Apartment = require('../models/Apartment');
const Category = require('../models/Category');
const { authenticate, adminOnly } = require('../middleware/auth');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, name + '-' + uniqueSuffix + ext);
  }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// POST /api/apartments - Create a new apartment with image upload (Admin only)
router.post('/', authenticate, adminOnly, upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]), async (req, res) => {
  try {
    // Verify category exists
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    // Handle uploaded files
    const apartmentData = { ...req.body };

    // Process main image
    if (req.files && req.files.mainImage && req.files.mainImage[0]) {
      apartmentData.mainImage = `/uploads/${req.files.mainImage[0].filename}`;
    }

    // Process multiple images
    if (req.files && req.files.images) {
      apartmentData.images = req.files.images.map(file => `/uploads/${file.filename}`);
    }

    // Convert string arrays to actual arrays if they come as strings
    if (typeof apartmentData.amenities === 'string') {
      apartmentData.amenities = apartmentData.amenities.split(',').map(item => item.trim());
    }
    if (typeof apartmentData.features === 'string') {
      apartmentData.features = apartmentData.features.split(',').map(item => item.trim());
    }

    // Convert numeric fields
    if (apartmentData.price) apartmentData.price = Number(apartmentData.price);
    if (apartmentData.bedrooms) apartmentData.bedrooms = Number(apartmentData.bedrooms);
    if (apartmentData.bathrooms) apartmentData.bathrooms = Number(apartmentData.bathrooms);
    if (apartmentData.capacity) apartmentData.capacity = Number(apartmentData.capacity);
    if (apartmentData.isAvailable !== undefined) {
      apartmentData.isAvailable = apartmentData.isAvailable === 'true' || apartmentData.isAvailable === true;
    }

    const apartment = new Apartment(apartmentData);
    const savedApartment = await apartment.save();

    // Populate category for response
    await savedApartment.populate('category', 'name description');
    res.status(201).json(savedApartment);
  } catch (error) {
    // Clean up uploaded files if apartment creation fails
    if (req.files) {
      if (req.files.mainImage) {
        req.files.mainImage.forEach(file => {
          const filePath = path.join(uploadsDir, file.filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
      }
      if (req.files.images) {
        req.files.images.forEach(file => {
          const filePath = path.join(uploadsDir, file.filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
      }
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid category ID' });
    }
    res.status(500).json({ error: 'Failed to create apartment: ' + error.message });
  }
});

// GET /api/apartments - Get all apartments
router.get('/', async (req, res) => {
  try {
    const apartments = await Apartment.find()
      .populate('category', 'name description')
      .sort({ createdAt: -1 });
    res.status(200).json(apartments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch apartments' });
  }
});

// GET /api/apartments/:id - Get a single apartment by ID
router.get('/:id', async (req, res) => {
  try {
    const apartment = await Apartment.findById(req.params.id)
      .populate('category', 'name description');

    if (!apartment) {
      return res.status(404).json({ error: 'Apartment not found' });
    }

    res.status(200).json(apartment);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid apartment ID' });
    }
    res.status(500).json({ error: 'Failed to fetch apartment' });
  }
});

// PUT /api/apartments/:id - Update an apartment (Admin only)
router.put('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    // If category is being updated, verify it exists
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(400).json({ error: 'Invalid category ID' });
      }
    }

    const apartment = await Apartment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category', 'name description');

    if (!apartment) {
      return res.status(404).json({ error: 'Apartment not found' });
    }

    res.status(200).json(apartment);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid apartment ID' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update apartment' });
  }
});

// DELETE /api/apartments/:id - Delete an apartment with optional cleanup (Admin only)
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const apartment = await Apartment.findById(req.params.id);

    if (!apartment) {
      return res.status(404).json({ error: 'Apartment not found' });
    }

    // Optional cleanup: delete associated image files
    const cleanup = req.query.cleanup === 'true' || req.query.cleanup === true;

    if (cleanup) {
      // Delete main image
      if (apartment.mainImage) {
        const mainImagePath = path.join(__dirname, '..', apartment.mainImage);
        if (fs.existsSync(mainImagePath)) {
          fs.unlinkSync(mainImagePath);
        }
      }

      // Delete all images in the images array
      if (apartment.images && Array.isArray(apartment.images)) {
        apartment.images.forEach(imagePath => {
          const fullPath = path.join(__dirname, '..', imagePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        });
      }
    }

    // Delete the apartment document
    await Apartment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: 'Apartment deleted successfully',
      cleanup: cleanup ? 'Images deleted' : 'Images preserved',
      apartment: apartment
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid apartment ID' });
    }
    res.status(500).json({ error: 'Failed to delete apartment: ' + error.message });
  }
});

module.exports = router;
