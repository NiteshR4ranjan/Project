const RecentlyViewed = require('../models/RecentlyViewed');
const Product = require('../models/Product');

// @desc    Get recently viewed products for logged in user
// @route   GET /api/recently-viewed
// @access  Private
const getRecentlyViewed = async (req, res, next) => {
  try {
    const recent = await RecentlyViewed.find({ userId: req.user._id })
      .sort({ viewedAt: -1 })
      .limit(10)
      .populate({
        path: 'productId',
        populate: { path: 'category', select: 'name slug' },
      });

    const validProducts = recent
      .filter((r) => r.productId !== null)
      .map((r) => r.productId);

    res.json({
      success: true,
      count: validProducts.length,
      data: validProducts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log a product view
// @route   POST /api/recently-viewed
// @access  Private
const logProductView = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Please provide productId' });
    }

    await RecentlyViewed.findOneAndUpdate(
      { userId: req.user._id, productId },
      { viewedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Product view logged',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRecentlyViewed, logProductView };
