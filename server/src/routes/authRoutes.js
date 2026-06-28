const express = require('express');
const router = express.Router();
const { sendOTP, signUp, logIn, logout } = require('../controllers/Auth');
const { resetPasswordToken, resetpassword } = require('../controllers/resetPassword');
const { authentication } = require('../middleware/auth');

// Public routes
router.post('/sendOTP', sendOTP);
router.post('/signup', signUp);
router.post('/login', logIn);
router.post('/reset-password-token', resetPasswordToken);
router.post('/reset-password', resetpassword);
router.post('/logout', logout); // Removed authentication middleware

module.exports = router;
