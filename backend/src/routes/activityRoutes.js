const express = require('express');
const router = express.Router();
const { getActivityLogs } = require('../controllers/activityController');
const { protect, admin } = require('../middleware/authMiddleware');


router.get('/', protect, admin, getActivityLogs);

module.exports = router;
