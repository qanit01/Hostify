const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Apartment = require('../models/Apartment');
const { authenticate, adminOnly, optionalAuth } = require('../middleware/auth');

// POST /api/bookings - Create a new booking (Public - no authentication required)
router.post('/', async (req, res) => {
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
    
    // Ensure required guest information is provided
    if (!req.body.guestName || !req.body.guestEmail || !req.body.guestPhone) {
      return res.status(400).json({ error: 'Guest name, email, and phone are required' });
    }
    
    // User field is optional - only set if user is authenticated
    if (req.user) {
      req.body.user = req.user.id;
    }
    
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

// GET /api/bookings - Get bookings (Admin sees all, public can query by email/phone)
router.get('/', optionalAuth, async (req, res) => {
  try {
    let query = {};
    
    // If authenticated admin, show all bookings
    if (req.user && req.user.role === 'admin') {
      // Admin sees all - no filter
    } else {
      // Public users can query by email or phone to see their bookings
      if (req.query.email) {
        query.guestEmail = req.query.email.toLowerCase();
      } else if (req.query.phone) {
        query.guestPhone = req.query.phone;
      } else {
        // If no query params, return empty (don't show all bookings to public)
        return res.status(200).json([]);
      }
    }
    
    const bookings = await Booking.find(query)
      .populate('apartment', 'title location price')
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// GET /api/bookings/:id - Get a single booking by ID (Public - anyone can view by ID)
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('apartment', 'title location price bedrooms bathrooms');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.status(200).json(booking);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// PUT /api/bookings/:id - Update a booking (Admin only)
router.put('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    // Check if booking exists
    const existingBooking = await Booking.findById(req.params.id);
    if (!existingBooking) {
      return res.status(404).json({ error: 'Booking not found' });
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

// DELETE /api/bookings/:id - Delete a booking (Admin only)
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
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

