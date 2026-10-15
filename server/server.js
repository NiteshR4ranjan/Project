const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const initPriceCron = require('./jobs/priceCron');

const path = require('path');
// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to MongoDB
connectDB();

// Initialize express app
const app = express();

// Enable Cross-Origin Resource Sharing
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check root endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'DealKart API & Price Acquisition Service',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

// Mount modular API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/prices', require('./routes/priceRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/recently-viewed', require('./routes/recentRoutes'));
app.use('/api/compare', require('./routes/compareRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// 404 & Centralized Error Middleware
app.use(notFound);
app.use(errorHandler);

// Initialize node-cron scheduled price updates
initPriceCron();

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 DealKart Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📡 REST API: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

module.exports = { app, server };
