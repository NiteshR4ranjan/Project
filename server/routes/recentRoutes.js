const express = require('express');
const router = express.Router();
const { getRecentlyViewed, logProductView } = require('../controllers/recentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getRecentlyViewed).post(logProductView);

module.exports = router;
