const express = require('express');
const router = express.Router();
const { getAlerts, createAlert, deleteAlert } = require('../controllers/alertController');
const { protect } = require('../middleware/auth');

router.use(protect); // Require auth for all alert endpoints

router.route('/').get(getAlerts).post(createAlert);
router.route('/:id').delete(deleteAlert);

module.exports = router;
