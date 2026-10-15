const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 4.2,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 120,
    },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    // Denormalized cached price summary for high-performance sorting/filtering
    lowestPrice: {
      type: Number,
      default: 0,
      index: true,
    },
    highestPrice: {
      type: Number,
      default: 0,
    },
    maxDiscount: {
      type: Number,
      default: 0,
    },
    availableStoresCount: {
      type: Number,
      default: 0,
    },
    lastSuccessfulFetch: {
      type: Date,
      default: null,
    },
    fetchStatus: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED'],
      default: 'PENDING',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for fast search queries
productSchema.index({ name: 'text', brand: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
