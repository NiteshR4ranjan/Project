const PriceAlert = require('../models/PriceAlert');
const Product = require('../models/Product');
const Notification = require('../models/Notification');

// @desc    Get current user's price drop alerts
// @route   GET /api/alerts
// @access  Private
const getAlerts = async (req, res, next) => {
  try {
    const alerts = await PriceAlert.find({ userId: req.user._id })
      .populate('productId', 'name brand imageUrl lowestPrice highestPrice')
      .sort({ createdAt: -1 });

    const validAlerts = alerts.filter((a) => a.productId !== null);

    res.json({
      success: true,
      count: validAlerts.length,
      data: validAlerts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set a price drop alert for a product
// @route   POST /api/alerts
// @access  Private
const createAlert = async (req, res, next) => {
  try {
    const { productId, targetPrice } = req.body;

    if (!productId || !targetPrice) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both productId and targetPrice',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const numericTarget = Number(targetPrice);
    if (numericTarget <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Target price must be greater than zero',
      });
    }

    // Check if user already has an active alert for this product
    let alert = await PriceAlert.findOne({
      userId: req.user._id,
      productId,
      status: 'active',
    });

    if (alert) {
      // Update existing target price
      alert.targetPrice = numericTarget;
      await alert.save();
    } else {
      alert = await PriceAlert.create({
        userId: req.user._id,
        productId,
        targetPrice: numericTarget,
        status: 'active',
      });
    }

    // Check if the current lowest price already meets the target price
    if (product.lowestPrice > 0 && product.lowestPrice <= numericTarget) {
      alert.status = 'triggered';
      alert.triggeredAt = new Date();
      await alert.save();

      await Notification.create({
        userId: req.user._id,
        productId,
        type: 'price_drop',
        message: `Alert triggered! "${product.name}" is already at ₹${product.lowestPrice.toLocaleString(
          'en-IN'
        )}, meeting your target of ₹${numericTarget.toLocaleString('en-IN')}.`,
        read: false,
      });
    }

    const populated = await PriceAlert.findById(alert._id).populate('productId');

    res.status(201).json({
      success: true,
      data: populated,
      message:
        alert.status === 'triggered'
          ? 'Alert set and immediately triggered because current price is below target!'
          : 'Price alert created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete price alert
// @route   DELETE /api/alerts/:id
// @access  Private
const deleteAlert = async (req, res, next) => {
  try {
    const alert = await PriceAlert.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Price alert not found' });
    }

    res.json({
      success: true,
      message: 'Price alert removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAlerts, createAlert, deleteAlert };
