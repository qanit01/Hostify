const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { authenticate, adminOnly } = require('../middleware/auth');

// POST /api/categories - Create a new category (apartment type) - Admin only
router.post('/', authenticate, adminOnly, async (req, res) => {
  try {
    const category = new Category(req.body);
    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Category name already exists' });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/categories/:id - Get a single category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.status(200).json(category);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid category ID' });
    }
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// PUT /api/categories/:id - Update a category - Admin only
router.put('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.status(200).json(category);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid category ID' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Category name already exists' });
    }
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE /api/categories/:id - Delete a category - Admin only
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.status(200).json({ message: 'Category deleted successfully', category });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid category ID' });
    }
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
