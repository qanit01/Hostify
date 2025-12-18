const mongoose = require('mongoose');

// Booking model (replaces Order model for apartment booking website)
const bookingSchema = new mongoose.Schema({
  apartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Apartment',
    required: [true, 'Apartment is required']
  },
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required'],
    validate: {
      validator: function(value) {
        return value >= new Date().setHours(0, 0, 0, 0);
      },
      message: 'Check-in date must be today or in the future'
    }
  },
  checkOut: {
    type: Date,
    required: [true, 'Check-out date is required'],
    validate: {
      validator: function(value) {
        return value > this.checkIn;
      },
      message: 'Check-out date must be after check-in date'
    }
  },
  guests: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: [1, 'At least 1 guest is required']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  guestName: {
    type: String,
    required: [true, 'Guest name is required'],
    trim: true,
    minlength: [2, 'Guest name must be at least 2 characters'],
    maxlength: [100, 'Guest name cannot exceed 100 characters']
  },
  guestEmail: {
    type: String,
    required: [true, 'Guest email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  guestPhone: {
    type: String,
    required: [true, 'Guest phone is required'],
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for backward compatibility
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update the updatedAt field before updating
bookingSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;

