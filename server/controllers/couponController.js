const Coupon = require('../models/Coupon');

// @desc    Get all active, non-expired coupons
// @route   GET /api/coupons
// @access  Public
const getCoupons = async (req, res, next) => {
  try {
    const { storeId, category } = req.query;
    const filter = {
      active: true,
      endDate: { $gte: new Date() },
    };

    if (storeId) {
      filter.storeId = storeId;
    }

    const coupons = await Coupon.find(filter)
      .populate('storeId', 'name logo websiteUrl')
      .populate('productId', 'name imageUrl brand lowestPrice')
      .sort({ endDate: 1 });

    res.json({
      success: true,
      count: coupons.length,
      data: coupons,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin create new coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    const populated = await Coupon.findById(coupon._id).populate('storeId', 'name logo');

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Coupon created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('storeId', 'name logo');

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    res.json({
      success: true,
      data: coupon,
      message: 'Coupon updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    res.json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCoupons, createCoupon, updateCoupon, deleteCoupon };
