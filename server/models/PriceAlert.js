const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    targetPrice: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['active', 'triggered', 'dismissed'],
      default: 'active',
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    triggeredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

priceAlertSchema.index({ userId: 1, productId: 1, status: 1 });

module.exports = mongoose.model('PriceAlert', priceAlertSchema);
