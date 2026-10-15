const Product = require('../models/Product');
const Price = require('../models/Price');
const ComparisonHistory = require('../models/ComparisonHistory');
const ReviewAnalysis = require('../models/ReviewAnalysis');
const { compareProductsWithGemini } = require('../services/geminiService');

// @desc    Get side-by-side comparison data for 2-4 products
// @route   GET /api/compare?ids=id1,id2,id3
// @access  Public
const getComparisonData = async (req, res, next) => {
  try {
    const { ids } = req.query;
    if (!ids) {
      return res.status(400).json({ success: false, message: 'Please provide comma-separated product ids' });
    }

    const idList = ids.split(',').filter((id) => id.trim().length > 0).slice(0, 4);
    if (idList.length < 2) {
      return res.status(400).json({ success: false, message: 'Please provide at least 2 products to compare' });
    }

    const products = await Product.find({ _id: { $in: idList } }).populate('category', 'name slug');

    // Fetch prices for all compared products
    const productsWithDetails = await Promise.all(
      products.map(async (prod) => {
        const prices = await Price.find({ productId: prod._id })
          .populate('storeId', 'name websiteUrl logo')
          .sort({ price: 1 });
        const reviewAnalysis = await ReviewAnalysis.findOne({
          productId: prod._id,
          analysisType: 'product',
        }).sort({ analyzedAt: -1 });

        return {
          ...prod.toObject(),
          prices,
          reviewAnalysis,
          cheapestStore: prices[0] ? prices[0].storeId?.name : 'N/A',
        };
      })
    );

    // Identify global lowest price among compared items
    let lowestComparedPrice = Infinity;
    productsWithDetails.forEach((p) => {
      if (p.lowestPrice && p.lowestPrice < lowestComparedPrice) {
        lowestComparedPrice = p.lowestPrice;
      }
    });

    res.json({
      success: true,
      count: productsWithDetails.length,
      lowestComparedPrice: lowestComparedPrice === Infinity ? 0 : lowestComparedPrice,
      data: productsWithDetails,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Ask Gemini to explain the best overall product in a comparison
// @route   POST /api/compare/ai
// @access  Public
const getAiComparison = async (req, res, next) => {
  try {
    const { productIds, products } = req.body;
    let compareProducts = Array.isArray(products) ? products : [];

    if ((!compareProducts || compareProducts.length < 2) && Array.isArray(productIds)) {
      const dbProducts = await Product.find({ _id: { $in: productIds.slice(0, 4) } });
      compareProducts = await Promise.all(
        dbProducts.map(async (product) => {
          const reviewAnalysis = await ReviewAnalysis.findOne({
            productId: product._id,
            analysisType: 'product',
          }).sort({ analyzedAt: -1 });

          return {
            ...product.toObject(),
            reviewAnalysis,
          };
        })
      );
    }

    if (!Array.isArray(compareProducts) || compareProducts.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least two products to compare.',
      });
    }

    const result = await compareProductsWithGemini(compareProducts);

    res.json({
      success: true,
      data: result.analysis,
      cached: Boolean(result.cached),
    });
  } catch (error) {
    console.error('[AI Comparison] Failed:', error.message);
    res.status(503).json({
      success: false,
      message: 'AI analysis is temporarily unavailable.',
    });
  }
};

// @desc    Log comparison history
// @route   POST /api/compare/log
// @access  Private
const logComparison = async (req, res, next) => {
  try {
    const { productIds } = req.body;
    if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
      return res.status(400).json({ success: false, message: 'Provide an array of at least 2 productIds' });
    }

    await ComparisonHistory.create({
      userId: req.user._id,
      productIds,
    });

    res.json({ success: true, message: 'Comparison saved to history' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's comparison history
// @route   GET /api/compare/history
// @access  Private
const getComparisonHistory = async (req, res, next) => {
  try {
    const history = await ComparisonHistory.find({ userId: req.user._id })
      .sort({ comparedAt: -1 })
      .limit(10)
      .populate('productIds', 'name brand imageUrl lowestPrice');

    res.json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getComparisonData, getAiComparison, logComparison, getComparisonHistory };
