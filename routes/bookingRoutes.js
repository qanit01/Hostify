const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Apartment = require('../models/Apartment');
const { authenticate, userOrAdmin, adminOnly } = require('../middleware/auth');

// POST /api/bookings - Create a new booking (User or Admin)
router.post('/', authenticate, userOrAdmin, async (req, res) => {
  try {
    // Verify apartment exists and is available
    const apartment = await Apartment.findById(req.body.apartment);
    if (!apartment) {
      return res.status(400).json({ error: 'Invalid apartment ID' });
    }
    
    if (!apartment.isAvailable) {
      return res.status(400).json({ error: 'Apartment is not available for booking' });
    }
    
    // Check if guests exceed capacity
    if (req.body.guests > apartment.capacity) {
      return res.status(400).json({ 
        error: `Number of guests exceeds apartment capacity. Maximum: ${apartment.capacity}` 
      });
    }
    
    // Calculate total price if not provided
    if (!req.body.totalPrice) {
      const checkIn = new Date(req.body.checkIn);
      const checkOut = new Date(req.body.checkOut);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      req.body.totalPrice = apartment.price * nights;
    }
    
    // Add user information from authenticated user
    req.body.guestName = req.body.guestName || req.user.name;
    req.body.guestEmail = req.body.guestEmail || req.user.email;
    req.body.guestPhone = req.body.guestPhone || req.user.phone || '';
    req.body.user = req.user.id; // Store user reference
    
    const booking = new Booking(req.body);
    const savedBooking = await booking.save();
    
    // Populate apartment for response
    await savedBooking.populate('apartment', 'title location price');
    res.status(201).json(savedBooking);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid apartment ID' });
    }
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// GET /api/bookings - Get all bookings (Admin sees all, User sees only their own)
router.get('/', authenticate, userOrAdmin, async (req, res) => {
  try {
    let query = {};
    
    // If user is not admin, only show their bookings
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }
    
    const bookings = await Booking.find(query)
      .populate('apartment', 'title location price')
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// GET /api/bookings/:id - Get a single booking by ID (User can only see their own)
router.get('/:id', authenticate, userOrAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('apartment', 'title location price bedrooms bathrooms');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if user owns this booking or is admin
    if (req.user.role !== 'admin' && booking.user && booking.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. This is not your booking.' });
    }
    
    res.status(200).json(booking);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// PUT /api/bookings/:id - Update a booking (User can update own, Admin can update any)
router.put('/:id', authenticate, userOrAdmin, async (req, res) => {
  try {
    // Check if booking exists and user has permission
    const existingBooking = await Booking.findById(req.params.id);
    if (!existingBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if user owns this booking or is admin
    if (req.user.role !== 'admin' && existingBooking.user && existingBooking.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You can only update your own bookings.' });
    }
    
    // If apartment is being updated, verify it exists
    if (req.body.apartment) {
      const apartment = await Apartment.findById(req.body.apartment);
      if (!apartment) {
        return res.status(400).json({ error: 'Invalid apartment ID' });
      }
    }
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('apartment', 'title location price');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.status(200).json(booking);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// DELETE /api/bookings/:id - Delete a booking (User can delete own, Admin can delete any)
router.delete('/:id', authenticate, userOrAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if user owns this booking or is admin
    if (req.user.role !== 'admin' && booking.user && booking.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You can only delete your own bookings.' });
    }
    
    await Booking.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Booking deleted successfully', booking });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

module.exports = router;

