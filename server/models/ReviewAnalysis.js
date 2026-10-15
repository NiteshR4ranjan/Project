const mongoose = require('mongoose');

const reviewAnalysisSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
      index: true,
    },
    query: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    queryKey: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    analysisType: {
      type: String,
      enum: ['search', 'product', 'comparison'],
      default: 'product',
      index: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    store: {
      type: String,
      default: '',
      trim: true,
    },
    source: {
      type: String,
      default: '',
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    overallScore: {
      type: Number,
      default: 0,
    },
    summary: {
      type: String,
      default: '',
    },
    positivePoints: {
      type: [String],
      default: [],
    },
    negativePoints: {
      type: [String],
      default: [],
    },
    sentiment: {
      positive: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 },
      negative: { type: Number, default: 0 },
    },
    recommendationReason: {
      type: String,
      default: '',
    },
    recommendationLabel: {
      type: String,
      default: 'Recommended',
    },
    rankingLabel: {
      type: String,
      default: '',
    },
    sources: {
      type: [
        {
          title: { type: String, default: '' },
          url: { type: String, default: '' },
        },
      ],
      default: [],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    analyzedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ReviewAnalysis', reviewAnalysisSchema);
