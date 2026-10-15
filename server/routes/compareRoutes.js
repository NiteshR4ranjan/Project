const express = require('express');
const router = express.Router();
const {
  getComparisonData,
  getAiComparison,
  logComparison,
  getComparisonHistory,
} = require('../controllers/compareController');
const { protect } = require('../middleware/auth');

router.get('/', getComparisonData);
router.post('/ai', getAiComparison);
router.post('/log', protect, logComparison);
router.get('/history', protect, getComparisonHistory);

module.exports = router;
