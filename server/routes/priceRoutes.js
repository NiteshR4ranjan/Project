const express = require('express');
const router = express.Router();
const {
  getProductPrices,
  getProductPriceHistory,
  triggerPriceUpdate,
  getPriceStatus,
  createPrice,
  updatePrice,
  deletePrice,
} = require('../controllers/priceController');
const { protect, admin } = require('../middleware/auth');

router.get('/status', getPriceStatus);
// Refreshing prices can trigger external source requests and mutate product data.
// Keep it behind the same admin guard as the other price-management actions.
router.post('/update', protect, admin, triggerPriceUpdate);
router.route('/').post(protect, admin, createPrice);
router.route('/:id').put(protect, admin, updatePrice).delete(protect, admin, deletePrice);

module.exports = router;
