const express = require('express');
const router = express.Router();
const { signup, verifyOtp, resendOtp, login, logout, forgotPassword, resetPassword, getAuthStatus } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', login);
router.post('/admin/login', require('../controllers/authController').adminLogin);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/status', getAuthStatus);

module.exports = router;
