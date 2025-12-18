const mongoose = require('mongoose');

// Apartment model (replaces Product model for apartment booking website)
const apartmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Apartment title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    minlength: [5, 'Location must be at least 5 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price per night is required'],
    min: [0, 'Price cannot be negative']
  },
  bedrooms: {
    type: Number,
    required: [true, 'Number of bedrooms is required'],
    min: [0, 'Bedrooms cannot be negative']
  },
  bathrooms: {
    type: Number,
    required: [true, 'Number of bathrooms is required'],
    min: [0, 'Bathrooms cannot be negative']
  },
  capacity: {
    type: Number,
    required: [true, 'Guest capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  amenities: {
    type: [String],
    default: []
  },
  features: {
    type: [String],
    default: []
  },
  images: {
    type: [String],
    default: []
  },
  mainImage: {
    type: String,
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
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
apartmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update the updatedAt field before updating
apartmentSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const Apartment = mongoose.model('Apartment', apartmentSchema);

module.exports = Apartment;

