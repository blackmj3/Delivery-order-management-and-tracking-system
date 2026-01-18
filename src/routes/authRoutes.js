const express = require("express");
const authController = require("../controllers/authController");

const { requireAuth } = require("../middlewares/authMiddleware");
const loginLimiter = require("../middlewares/limiter");

const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updatePasswordValidation,
  validate
} = require("../validations/authValidation");
const router = express.Router();

// POST - Register
router.post('/register', registerValidation, validate, authController.register);

// GET - Verify email
router.get('/verify-email/:token', authController.verifyEmail);


// POST - Login
router.post('/login', loginLimiter.apiLimiter, loginValidation, authController.login);

// POST - Refresh token
router.post('/refresh', authController.refreshToken);

// POST - Forgot password
router.post('/forgot-password', forgotPasswordValidation, authController.forgotPassword);

// POST - Reset password
router.post('/reset-password/:token', resetPasswordValidation, authController.resetPassword);

// POST - Logout
router.post('/logout', requireAuth, authController.logout);

// PUT - Update password
router.put('/update-password', requireAuth, updatePasswordValidation, authController.updatePassword);

module.exports = router
