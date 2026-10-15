const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    availability: {
      type: String,
      enum: ['In Stock', 'Out of Stock', 'Limited Stock'],
      default: 'In Stock',
    },
    productUrl: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    lastFetchStatus: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'PARTIAL', 'CACHED'],
      default: 'SUCCESS',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index so each store has at most one current price per product
priceSchema.index({ productId: 1, storeId: 1 }, { unique: true });

module.exports = mongoose.model('Price', priceSchema);
