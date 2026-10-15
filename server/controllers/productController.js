const Product = require('../models/Product');
const Category = require('../models/Category');
const Price = require('../models/Price');
const PriceHistory = require('../models/PriceHistory');
const ReviewAnalysis = require('../models/ReviewAnalysis');
const priceService = require('../services/priceService');
const { generateReviewAnalysis, getReviewDataForProduct } = require('../services/geminiService');
const { normalizeString } = require('../utils/normalizer');

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      minDiscount,
      sort,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    // Filter by category (by slug or ID)
    if (category && category !== 'all') {
      const cat = await Category.findOne({
        $or: [{ slug: category.toLowerCase() }, { name: new RegExp(`^${category}$`, 'i') }],
      });
      if (cat) {
        query.category = cat._id;
      }
    }

    // Filter by brand
    if (brand && brand !== 'all') {
      const brands = brand.split(',').map((b) => new RegExp(`^${b.trim()}$`, 'i'));
      query.brand = { $in: brands };
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.lowestPrice = {};
      if (minPrice) query.lowestPrice.$gte = Number(minPrice);
      if (maxPrice) query.lowestPrice.$lte = Number(maxPrice);
    }

    // Filter by minimum rating
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // Filter by minimum discount percentage
    if (minDiscount) {
      query.maxDiscount = { $gte: Number(minDiscount) };
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // default newest
    if (sort === 'price_asc') {
      sortOptions = { lowestPrice: 1 };
    } else if (sort === 'price_desc') {
      sortOptions = { lowestPrice: -1 };
    } else if (sort === 'discount_desc') {
      sortOptions = { maxDiscount: -1 };
    } else if (sort === 'rating_desc') {
      sortOptions = { rating: -1 };
    } else if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug icon')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Extract unique brands for filtering UI
    const allBrands = await Product.distinct('brand');

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
      availableBrands: allBrands.sort(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search products by search term
// @route   GET /api/products/search?q=
// @access  Public
const buildSearchRecommendations = async (query, apiResults = []) => {
  const candidates = Array.isArray(apiResults) ? apiResults.slice(0, 5) : [];

  const analyzedResults = await Promise.allSettled(
    candidates.map(async (product, index) => {
      const name = product?.name || product?.title || product?.product_title || query || 'Product';
      const store = product?.store || product?.storeName || 'Source';
      const source = product?.source || 'live-source';
      const reviews = await getReviewDataForProduct({
        productName: name,
        store,
        source,
        query,
      });

      const analysisResponse = await generateReviewAnalysis({
        productName: name,
        reviews,
        query,
        store,
        source,
        price: Number(product?.price ?? product?.lowestPrice ?? 0) || 0,
        imageUrl: product?.imageUrl || '',
        rating: Number(product?.rating ?? 0) || 0,
        reviewCount: Number(product?.reviewCount ?? 0) || 0,
        analysisType: 'search',
      });

      const safeAnalysis = analysisResponse?.analysis || null;

      return {
        product,
        analysis: safeAnalysis,
        analysisMessage: analysisResponse?.message || '',
        aiAvailable: analysisResponse?.success === true,
        label: ['Best Overall', 'Best Value', 'Best Rated', 'Budget Choice', 'Alternative Choice'][index] || 'Recommended',
      };
    })
  );

  const normalized = analyzedResults
    .filter((entry) => entry.status === 'fulfilled')
    .map((entry) => entry.value)
    .map((entry) => {
      const scoreBase = Number(entry.analysis?.overallScore ?? 0) || 0;
      const ratingBonus = Number(entry.product?.rating ?? entry.analysis?.rating ?? 0) || 0;
      const reviewBonus = Number(entry.product?.reviewCount ?? entry.analysis?.reviewCount ?? 0) || 0;
      const valueScore = Math.max(0, 100 - (Number(entry.product?.price ?? 0) / 1000));
      const composite = scoreBase * 10 + ratingBonus * 20 + Math.min(reviewBonus / 100, 20) + valueScore / 10;

      return {
        ...entry,
        composite,
      };
    })
    .sort((a, b) => b.composite - a.composite);

  const recommendations = normalized.map((item, index) => ({
    ...item,
    label: item.label || ['Best Overall', 'Best Value', 'Best Rated', 'Budget Choice', 'Alternative Choice'][index] || 'Recommended',
    productName: item.product?.name || item.product?.title || item.product?.product_title || 'Product',
    price: Number(item.product?.price ?? item.product?.lowestPrice ?? 0) || 0,
    imageUrl: item.product?.imageUrl || '',
    productUrl: item.product?.productUrl || '',
    store: item.product?.store || item.product?.storeName || 'Source',
    rating: Number(item.product?.rating ?? item.analysis?.rating ?? 0) || 0,
    reviewCount: Number(item.product?.reviewCount ?? item.analysis?.reviewCount ?? 0) || 0,
    summary: item.analysis?.summary || item.analysisMessage || 'Review analysis available shortly.',
    positivePoints: item.analysis?.positivePoints || [],
    negativePoints: item.analysis?.negativePoints || [],
    recommendationReason: item.analysis?.recommendationReason || '',
    overallScore: item.analysis?.overallScore || 0,
  }));

  return recommendations;
};

const searchProducts = async (req, res, next) => {
  try {
    const searchTerm = req.query.q || '';
    if (!searchTerm.trim()) {
      return res.json({
        success: true,
        data: [],
        count: 0,
      });
    }

    const cleanTerm = searchTerm.trim();
    const regex = new RegExp(cleanTerm.split(' ').join('.*'), 'i');

    const localProducts = await Product.find({
      $or: [
        { name: regex },
        { brand: regex },
        { description: regex },
      ],
    })
      .populate('category', 'name slug icon')
      .sort({ rating: -1, lowestPrice: 1 })
      .limit(30);

    let apiResults = [];
    let failures = [];
    let recommendations = [];

    try {
      const liveSearch = await priceService.fetchProductPrices(cleanTerm);
      apiResults = liveSearch.results || [];
      failures = liveSearch.failures || [];
      const groundedRecommendations = liveSearch.recommendations || [];
      const groundedRecommendedProduct = liveSearch.recommendedProduct || null;
      const groundedSources = liveSearch.sources || [];

      if (apiResults.length > 0) {
        await priceService.saveSearchResultsToProducts(localProducts, apiResults);
      }

      if (failures.length > 0) {
        console.warn('[Product Search] Source fetch failures:', failures);
      }

      if (groundedRecommendations.length > 0 || groundedRecommendedProduct) {
        recommendations = groundedRecommendations;
      } else if (apiResults.length > 0) {
        recommendations = await buildSearchRecommendations(cleanTerm, apiResults);
      }

      return res.json({
        success: true,
        query: cleanTerm,
        count: apiResults.length,
        data: apiResults,
        recommendations,
        recommendedProduct: groundedRecommendedProduct || recommendations[0] || null,
        sourceFailures: failures,
        sources: groundedSources,
        cached: Boolean(liveSearch.cached),
      });
    } catch (error) {
      console.error('[Product Search] Live fetch failed:', error.message);

      for (const product of localProducts) {
        product.fetchStatus = 'FAILED';
        await product.save();
      }

      if (localProducts.length > 0) {
        return res.json({
          success: true,
          query: cleanTerm,
          count: localProducts.length,
          data: localProducts.map((product) => product.toObject()),
          recommendations: [],
          recommendedProduct: null,
        });
      }

      return res.json({
        success: true,
        query: cleanTerm,
        count: 0,
        data: [],
        recommendations: [],
        recommendedProduct: null,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
const getRecentRecommendations = async (req, res, next) => {
  try {
    const analyses = await ReviewAnalysis.find({ analysisType: 'search' })
      .sort({ analyzedAt: -1 })
      .limit(10);

    const recommendations = analyses.map((analysis) => ({
      _id: analysis._id,
      query: analysis.query,
      productName: analysis.metadata?.recommendedProduct?.productName || analysis.productName,
      recommendedProduct: analysis.metadata?.recommendedProduct || null,
      recommendations: analysis.metadata?.recommendations || [],
      sources: analysis.sources || [],
      analyzedAt: analysis.analyzedAt,
    }));

    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug icon');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Get current prices from all stores
    const prices = await Price.find({ productId: product._id })
      .populate('storeId', 'name websiteUrl sourceType logo lastSuccessfulFetch')
      .sort({ price: 1 });

    res.json({
      success: true,
      data: {
        ...product.toObject(),
        prices,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProductReviewAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate('category', 'name slug icon');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const storedAnalysis = await ReviewAnalysis.findOne({
      productId: product._id,
      analysisType: 'product',
    }).sort({ analyzedAt: -1 });

    if (storedAnalysis) {
      return res.json({
        success: true,
        data: storedAnalysis,
        cached: true,
      });
    }

    const analysisResponse = await generateReviewAnalysis({
      productName: product.name,
      reviews: [],
      query: `${product.brand || ''} ${product.name}`.trim(),
      productId: product._id,
      store: product.brand || 'DealKart',
      source: 'dealkart-product',
      price: Number(product.lowestPrice || 0) || 0,
      imageUrl: product.imageUrl || '',
      productUrl: product.productUrl || '',
      rating: Number(product.rating || 0) || 0,
      reviewCount: Number(product.reviewCount || 0) || 0,
      analysisType: 'product',
    });

    return res.json({
      success: true,
      data: analysisResponse.analysis || null,
      cached: false,
      message: analysisResponse.message || '',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product (Admin)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      brand,
      description,
      category,
      imageUrl,
      rating,
      specifications,
    } = req.body;

    const product = await Product.create({
      name,
      brand,
      description,
      category,
      imageUrl: imageUrl || '',
      rating: rating || 4.2,
      specifications: specifications || {},
    });

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Cascade delete prices and price history
    await Price.deleteMany({ productId: product._id });
    await PriceHistory.deleteMany({ productId: product._id });
    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product and associated price records removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  searchProducts,
  getRecentRecommendations,
  getProductById,
  getProductReviewAnalysis,
  createProduct,
  updateProduct,
  deleteProduct,
};
