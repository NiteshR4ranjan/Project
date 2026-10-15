const express = require('express');
const router = express.Router();
const {
  getProducts,
  searchProducts,
  getRecentRecommendations,
  getProductById,
  getProductReviewAnalysis,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const {
  getProductPrices,
  getProductPriceHistory,
} = require('../controllers/priceController');
const { protect, admin } = require('../middleware/auth');

router.get('/search', searchProducts);
router.get('/recommendations/recent', getRecentRecommendations);
router.get('/:id/review-analysis', getProductReviewAnalysis);
router.get('/:id/prices', getProductPrices);
router.get('/:id/price-history', getProductPriceHistory);
router.route('/').get(getProducts).post(protect, admin, createProduct);
router
  .route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;
