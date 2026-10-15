const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @desc    Get current user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res, next) => {
  try {
    const items = await Wishlist.find({ userId: req.user._id })
      .populate({
        path: 'productId',
        populate: { path: 'category', select: 'name slug' },
      })
      .sort({ createdAt: -1 });

    // Filter out any items where product might have been deleted
    const validItems = items.filter((item) => item.productId !== null);

    res.json({
      success: true,
      count: validItems.length,
      data: validItems,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Please provide productId' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if already in wishlist
    const existing = await Wishlist.findOne({ userId: req.user._id, productId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Product is already in your wishlist' });
    }

    const wishlistItem = await Wishlist.create({
      userId: req.user._id,
      productId,
    });

    const populated = await Wishlist.findById(wishlistItem._id).populate('productId');

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Product added to wishlist',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const result = await Wishlist.findOneAndDelete({
      userId: req.user._id,
      productId,
    });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Item not in wishlist' });
    }

    res.json({
      success: true,
      message: 'Product removed from wishlist',
      productId,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
