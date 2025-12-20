const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders, getAllOrders } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/all', admin, getAllOrders);
router.put('/:id', admin, require('../controllers/orderController').updateOrder); // Admin update order route

module.exports = router;