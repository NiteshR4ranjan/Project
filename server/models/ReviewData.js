const mongoose = require('mongoose');

const reviewDataSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
      index: true,
    },
    source: {
      type: String,
      default: '',
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    reviewText: {
      type: String,
      default: '',
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    productName: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    productUrl: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      default: 0,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    store: {
      type: String,
      default: '',
      trim: true,
    },
    dataType: {
      type: String,
      enum: ['actual', 'sample'],
      default: 'sample',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ReviewData', reviewDataSchema);
