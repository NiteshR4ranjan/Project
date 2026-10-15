const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide store name'],
      unique: true,
      trim: true,
    },
    websiteUrl: {
      type: String,
      required: true,
      trim: true,
    },
    sourceType: {
      type: String,
      enum: ['api', 'scraper', 'manual', 'gemini'],
      default: 'gemini',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'rate_limited'],
      default: 'active',
    },
    logo: {
      type: String,
      default: '',
    },
    lastFetchStatus: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'PARTIAL', 'PENDING'],
      default: 'PENDING',
    },
    lastSuccessfulFetch: {
      type: Date,
      default: null,
    },
    lastAttemptedFetch: {
      type: Date,
      default: null,
    },
    productsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Store', storeSchema);
