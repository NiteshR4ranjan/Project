const User = require('../models/User');
const Product = require('../models/Product');
const Store = require('../models/Store');
const Coupon = require('../models/Coupon');
const PriceAlert = require('../models/PriceAlert');
const Price = require('../models/Price');
const ReviewAnalysis = require('../models/ReviewAnalysis');
const GeminiRequestLog = require('../models/GeminiRequestLog');
const priceService = require('../services/priceService');

// @desc    Get overall admin dashboard statistics
// @route   GET /api/admin/statistics
// @access  Private/Admin
const getAdminStatistics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalStores,
      totalCoupons,
      totalAlerts,
      activeAlerts,
      latestPriceUpdate,
      totalAnalyses,
      recentGeminiRequests,
      successfulGeminiRequests,
      failedGeminiRequests,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Store.countDocuments(),
      Coupon.countDocuments(),
      PriceAlert.countDocuments(),
      PriceAlert.countDocuments({ status: 'active' }),
      Price.findOne().sort({ lastUpdated: -1 }).select('lastUpdated'),
      ReviewAnalysis.countDocuments(),
      GeminiRequestLog.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      GeminiRequestLog.countDocuments({ status: { $in: ['SUCCESS', 'CACHED'] } }),
      GeminiRequestLog.countDocuments({ status: 'FAILED' }),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalStores,
        totalCoupons,
        totalAlerts,
        activeAlerts,
        lastPriceUpdate: latestPriceUpdate ? latestPriceUpdate.lastUpdated : null,
        totalAnalyses,
        recentGeminiRequests,
        successfulGeminiRequests,
        failedGeminiRequests,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (Admin)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: user,
      message: `User role updated to ${role}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get status of all price sources
// @route   GET /api/admin/sources
// @access  Private/Admin
const getSources = async (req, res, next) => {
  try {
    const stores = await Store.find({}).sort({ name: 1 });

    // Augment with product price count
    const storesWithCounts = await Promise.all(
      stores.map(async (st) => {
        const count = await Price.countDocuments({ storeId: st._id });
        return {
          ...st.toObject(),
          productsTracked: count,
        };
      })
    );

    res.json({
      success: true,
      data: storesWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger "Update Prices Now" (Admin manual trigger)
// @route   POST /api/admin/update-prices
// @access  Private/Admin
const runManualPriceUpdate = async (req, res, next) => {
  try {
    console.log('[Admin Dashboard]: "Update Prices Now" clicked by administrator');
    const result = await priceService.updateAllProductPrices(15);

    res.json({
      success: true,
      message: `Price update executed for ${result.productsUpdated} products in ${result.durationSeconds}s.`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List stored Gemini review analysis records
// @route   GET /api/admin/review-analyses
// @access  Private/Admin
const getReviewAnalyses = async (req, res, next) => {
  try {
    const analyses = await ReviewAnalysis.find({})
      .sort({ analyzedAt: -1 })
      .limit(100)
      .populate('productId', 'name brand imageUrl lowestPrice');

    res.json({
      success: true,
      count: analyses.length,
      data: analyses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a stored Gemini review analysis record
// @route   DELETE /api/admin/review-analyses/:id
// @access  Private/Admin
const deleteReviewAnalysis = async (req, res, next) => {
  try {
    const analysis = await ReviewAnalysis.findByIdAndDelete(req.params.id);
    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Review analysis not found' });
    }

    res.json({
      success: true,
      message: 'Review analysis deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStatistics,
  getUsers,
  updateUserRole,
  getSources,
  runManualPriceUpdate,
  getReviewAnalyses,
  deleteReviewAnalysis,
};
