const mongoose = require('mongoose');

const geminiRequestLogSchema = new mongoose.Schema(
  {
    operation: {
      type: String,
      enum: ['search', 'analysis', 'comparison', 'price-refresh'],
      required: true,
      index: true,
    },
    query: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'CACHED'],
      required: true,
      index: true,
    },
    message: {
      type: String,
      default: '',
    },
    model: {
      type: String,
      default: '',
    },
    sourceCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('GeminiRequestLog', geminiRequestLogSchema);
