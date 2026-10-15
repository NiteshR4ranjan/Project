const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const initPriceCron = require('./jobs/priceCron');

const path = require('path');
// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '.env') });
const { seedCatalogIfEmpty } = require('./seed/seed');

// Initialize express app
const app = express();
let isReady = false;

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
  if (!isReady) {
    return res.status(503).json({ status: 'starting' });
  }

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

const PORT = process.env.PORT || 5001;

let server;

server = app.listen(PORT, () => {
  console.log(`DealKart Server starting on port ${PORT}`);
});

const initializeServer = async () => {
  await connectDB();
  if (process.env.SEED_CATALOG_IF_EMPTY === 'true') await seedCatalogIfEmpty();
  initPriceCron();
  isReady = true;
  console.log(`DealKart Server running in ${process.env.NODE_ENV || 'development'} mode`);
};

initializeServer().catch((error) => {
  console.error('[Server Startup Error]:', error);
  server.close(() => process.exit(1));
});

module.exports = { app, get server() { return server; } };
