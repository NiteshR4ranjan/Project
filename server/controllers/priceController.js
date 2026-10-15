const Price = require('../models/Price');
const PriceHistory = require('../models/PriceHistory');
const Product = require('../models/Product');
const Store = require('../models/Store');
const priceService = require('../services/priceService');

const refreshProductPriceSummary = async (productId) => {
  const prices = await Price.find({ productId }).select('price');
  const values = prices.map((price) => price.price);

  await Product.findByIdAndUpdate(productId, {
    lowestPrice: values.length ? Math.min(...values) : 0,
    highestPrice: values.length ? Math.max(...values) : 0,
    availableStoresCount: values.length,
  });
};

// @desc    Get all current prices for a product across stores
// @route   GET /api/products/:id/prices
// @access  Public
const getProductPrices = async (req, res, next) => {
  try {
    const prices = await Price.find({ productId: req.params.id })
      .populate('storeId', 'name websiteUrl sourceType logo lastSuccessfulFetch lastFetchStatus')
      .sort({ price: 1 });

    res.json({
      success: true,
      count: prices.length,
      data: prices,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chronological price history for Recharts line chart
// @route   GET /api/products/:id/price-history
// @access  Public
const getProductPriceHistory = async (req, res, next) => {
  try {
    const productId = req.params.id;

    const historyRecords = await PriceHistory.find({ productId })
      .populate('storeId', 'name')
      .sort({ recordedAt: 1 });

    if (historyRecords.length === 0) {
      // Fallback: If no history exists, use current prices as current baseline
      const currentPrices = await Price.find({ productId }).populate('storeId', 'name');
      const now = new Date();
      const fallbackPoints = currentPrices.map((p) => ({
        date: now.toISOString().split('T')[0],
        timestamp: now.getTime(),
        store: p.storeId?.name || 'Store',
        price: p.price,
      }));

      const allPrices = currentPrices.map((p) => p.price);
      return res.json({
        success: true,
        stats: {
          current: allPrices[0] || 0,
          lowest: allPrices.length ? Math.min(...allPrices) : 0,
          highest: allPrices.length ? Math.max(...allPrices) : 0,
          average: allPrices.length ? Math.round(allPrices.reduce((a, b) => a + b, 0) / allPrices.length) : 0,
        },
        data: fallbackPoints,
      });
    }

    // Group history by date for clean Recharts display
    const dateMap = {};
    const allPrices = [];

    historyRecords.forEach((item) => {
      const dateKey = new Date(item.recordedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      allPrices.push(item.price);

      if (!dateMap[dateKey]) {
        dateMap[dateKey] = {
          date: dateKey,
          timestamp: new Date(item.recordedAt).getTime(),
          minPrice: item.price,
          avgPrice: item.price,
          count: 1,
        };
      } else {
        dateMap[dateKey].minPrice = Math.min(dateMap[dateKey].minPrice, item.price);
        dateMap[dateKey].avgPrice += item.price;
        dateMap[dateKey].count += 1;
      }

      // Add store specific price key (e.g. Amazon: 64999)
      const storeKey = item.storeId?.name || 'General';
      dateMap[dateKey][storeKey] = item.price;
    });

    const chartPoints = Object.values(dateMap).map((pt) => ({
      ...pt,
      price: pt.minPrice, // primary line
      avgPrice: Math.round(pt.avgPrice / pt.count),
    }));

    const currentPrice = allPrices[allPrices.length - 1] || 0;
    const lowestPrice = Math.min(...allPrices);
    const highestPrice = Math.max(...allPrices);
    const avgPrice = Math.round(allPrices.reduce((a, b) => a + b, 0) / allPrices.length);

    res.json({
      success: true,
      stats: {
        current: currentPrice,
        lowest: lowestPrice,
        highest: highestPrice,
        average: avgPrice,
      },
      data: chartPoints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger price refresh for a specific product or batch
// @route   POST /api/prices/update
// @access  Private/Admin
const triggerPriceUpdate = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const summary = await priceService.updateProductPrices(product);
      return res.json({
        success: true,
        message: `Prices refreshed for ${product.name}`,
        data: summary,
      });
    }

    // Otherwise run for batch of products
    const result = await priceService.updateAllProductPrices(10);
    res.json({
      success: true,
      message: 'Batch price update initiated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get status of all price sources
// @route   GET /api/prices/status
// @access  Public
const getPriceStatus = async (req, res, next) => {
  try {
    const stores = await Store.find({}).sort({ name: 1 });
    res.json({
      success: true,
      data: stores,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin add store price manually
// @route   POST /api/prices
// @access  Private/Admin
const createPrice = async (req, res, next) => {
  try {
    const { productId, storeId, price, originalPrice, discount, availability, productUrl } = req.body;

    const newPrice = await Price.create({
      productId,
      storeId,
      price,
      originalPrice: originalPrice || price,
      discount: discount || 0,
      availability: availability || 'In Stock',
      productUrl,
      lastFetchStatus: 'SUCCESS',
      lastUpdated: new Date(),
    });

    // Record history
    await PriceHistory.create({
      productId,
      storeId,
      price,
      recordedAt: new Date(),
    });

    // Update product summary
    await refreshProductPriceSummary(productId);

    res.status(201).json({
      success: true,
      data: newPrice,
      message: 'Price created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin update store price
// @route   PUT /api/prices/:id
// @access  Private/Admin
const updatePrice = async (req, res, next) => {
  try {
    const priceDoc = await Price.findById(req.params.id);
    if (!priceDoc) {
      return res.status(404).json({ success: false, message: 'Price record not found' });
    }

    const priceWasChanged = Object.prototype.hasOwnProperty.call(req.body, 'price');
    Object.assign(priceDoc, req.body, { lastUpdated: new Date() });
    await priceDoc.save();

    // Record history if price changed
    if (priceWasChanged) {
      await PriceHistory.create({
        productId: priceDoc.productId,
        storeId: priceDoc.storeId,
        price: priceDoc.price,
        recordedAt: new Date(),
      });
    }

    await refreshProductPriceSummary(priceDoc.productId);

    res.json({
      success: true,
      data: priceDoc,
      message: 'Price updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin delete price
// @route   DELETE /api/prices/:id
// @access  Private/Admin
const deletePrice = async (req, res, next) => {
  try {
    const priceDoc = await Price.findById(req.params.id);
    if (!priceDoc) {
      return res.status(404).json({ success: false, message: 'Price record not found' });
    }

    const productId = priceDoc.productId;
    await priceDoc.deleteOne();

    await refreshProductPriceSummary(productId);

    res.json({
      success: true,
      message: 'Price record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductPrices,
  getProductPriceHistory,
  triggerPriceUpdate,
  getPriceStatus,
  createPrice,
  updatePrice,
  deletePrice,
};
