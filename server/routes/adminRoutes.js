const express = require('express');
const router = express.Router();
const {
  getAdminStatistics,
  getUsers,
  updateUserRole,
  getSources,
  runManualPriceUpdate,
  getReviewAnalyses,
  deleteReviewAnalysis,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// All admin routes require protect + admin middleware
router.use(protect, admin);

router.get('/statistics', getAdminStatistics);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/sources', getSources);
router.post('/update-prices', runManualPriceUpdate);
router.get('/review-analyses', getReviewAnalyses);
router.delete('/review-analyses/:id', deleteReviewAnalysis);

module.exports = router;
