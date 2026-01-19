const User = require('../models/User');
const Token = require('../models/Token');

const cookieService = require('../utils/cookieService');
const passwordService = require('../utils/passwordService');
const tokenService = require('../utils/generateToken');
const generateResetToken = require('../utils/generateResetToken');
const asyncHandler = require('../utils/asyncHandler');
const sendEmail = require('../utils/sendEmail');

const cache = require('../utils/cacheService');
const logger = require('../utils/logger');
const { success, error } = require('../utils/responseService');
const { createLog } = require('../utils/ActivityLog');

const crypto = require('crypto');

class AuthController {
  // Handle failed login attempts
  handledFailedLogin = asyncHandler(async (user) => {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= 5) {
      user.isLocked = true;
      user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 min lock
      logger.warn(`User locked: ${user.email}`);
    }
    await user.save();
  })

  resetFailedLoginAttemtps = asyncHandler(async (user) => {
    user.failedLoginAttempts = 0;
    user.isLocked = false;
    user.lockedUntil = null;
    await user.save();
  })

  // REGISTER
  register = asyncHandler(async (req, res) => {
    const { name, email, password, phone, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const resp = error('Email already exists', 400);
      return res.status(resp.status).json(resp);
    }

    passwordService.validatePasswordStrength(password);
    const hashedPassword = await passwordService.hashPassword(password);

    const user = await User.create({ name, email, password: hashedPassword, phone, role });

    const verifyToken = crypto.randomBytes(32).toString('hex');

    await Token.create({
      user: user._id,
      token: verifyToken,
      type: 'VERIFY_EMAIL',
      expiresAt: Date.now() + 60 * 60 * 1000,
    });

    await sendEmail(
      email,
      'Verify your email', 
      `${process.env.CLIENT_URL}/api/auth/verify-email/${verifyToken}`
    );

    logger.info('User registered', { userId: user._id });

    const resp = success(null, 'Registered successfully, verification email sent', 201);
    return res.status(resp.status).json(resp);
  })

  // LOGIN
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const cacheKey = `login-attempts:${email}`;
    const attempts = cache.get(cacheKey) || 0;

    if (attempts >= 5) {
      logger.warn('Too many login attempts', { email });
      const resp = error('Too many login attempts, try later', 429);
      return res.status(resp.status).json(resp);
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      cache.set(cacheKey, attempts + 1, 900);
      
      await createLog({
        userId: null,
        role: 'UNKNOWN',
        action: 'FAILED_LOGIN',
        details: `Login attempt with invalid email: ${email}`
      })
      
      const resp = error('Invalid email or password', 401);
      return res.status(resp.status).json(resp);
    }

    if (user.isLocked && user.lockedUntil > Date.now()) {
      const resp = error('Account temporarily locked', 403);
      return res.status(resp.status).json(resp);
    }

    const isValid = await passwordService.verifyPassword(password, user.password);
    if (!isValid) {
      cache.set(cacheKey, attempts + 1, 900);
      await this.handledFailedLogin(user);

      await createLog({
        userId: user._id,
        role: user.role,    
        action: 'FAILED_LOGIN',
        details: 'Invalid password'
      });

      const resp = error('Invalid email or password', 401);
      return res.status(resp.status).json(resp);
    }

    cache.clear(cacheKey);
    await this.resetFailedLoginAttemtps(user);

    const payload = { id: user._id, role: user.role };
    const accessToken = tokenService.genrateAccessToken(payload);
    const refreshToken = tokenService.genrateRefreshToken(payload);

    cookieService.setAccessToken(res, accessToken);
    cookieService.setRefreshToken(res, refreshToken);

    await User.updateOne(
    { _id: user._id },
    { $set: { lastLogin: new Date() } }
    )

    await createLog({
      userId: user._id,
      role: user.role,
      action: 'LOGIN',
      details: 'User logged in successfully'
    });

    const resp = success(null, 'Login successful');
    return res.status(resp.status).json(resp);
  })

  // LOGOUT
  logout = asyncHandler(async (req, res) => {
    cookieService.clearTokens(res);

    await createLog({
      userId: req.user.id,
      role: req.user.role,
      action: 'LOGOUT',
      details: 'User logged out'
    })

    const resp = success(null, 'Logged out successfully');
    return res.status(resp.status).json(resp);
  })

  // REFRESH TOKEN
  refreshToken = asyncHandler(async (req, res) => {
    const refreshToken = cookieService.getRefreshToken(req);
    if (!refreshToken) {
      const resp = error('Refresh token required', 401);
      return res.status(resp.status).json(resp);
    }

    const decoded = tokenService.verifyRefreshToken(refreshToken);
    const payload = { id: decoded.id, role: decoded.role };

    cookieService.setAccessToken(res, tokenService.genrateAccessToken(payload));
    cookieService.setRefreshToken(res, tokenService.genrateRefreshToken(payload));

    const resp = success(null, 'Token refreshed');
    return res.status(resp.status).json(resp);
  })

  // VERIFY EMAIL
  verifyEmail = asyncHandler(async (req, res) => {
    const tokenString = req.params.token;
    const token = await Token.findOne({ token: tokenString, type: 'VERIFY_EMAIL', expiresAt: { $gt: Date.now() } });

    if (!token) {
      const resp = error('Invalid or expired token', 400);
      return res.status(resp.status).json(resp);
    }

    await User.findByIdAndUpdate(token.user, { isEmailVerified: true });
    await token.deleteOne();
    await createLog({
      userId: token.user,
      role: 'CLIENT',
      action: 'VERIFY_EMAIL',
      details: 'Email verified successfully'
    });

    logger.info('Email verified', { userId: token.user });

    const resp = success(null, 'Email verified successfully');
    return res.status(resp.status).json(resp);
  })

  // Forgot Password
  forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      const resp = error('User not found', 404);
      return res.status(resp.status).json(resp);
    }

    // generate raw token + hash
    const { token: rawToken, hashed: hashedToken } = generateResetToken();

    // save hash in DB with expiration
    await Token.create({
      user: user._id,
      type: 'RESET_PASSWORD',
      token: hashedToken,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 min
    });

    // send reset link with raw token
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

    logger.info('Password reset requested', { userId: user._id, resetLink });
    const resp = success(null, 'Password reset email sent');
    return res.status(resp.status).json(resp);
  })

  // RESET PASSWORD
  resetPassword = asyncHandler(async (req, res) => {
    const rawToken = req.params.token;
    const { newPassword } = req.body;

    // hash incoming token
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    // find token in DB
    const tokenDoc = await Token.findOne({
      token: hashedToken,
      type: 'RESET_PASSWORD',
      expiresAt: { $gt: Date.now() },
    });

    if (!tokenDoc) {
      const resp = error('Invalid or expired token', 400);
      return res.status(resp.status).json(resp);
    }

    // hash new password
    passwordService.validatePasswordStrength(newPassword);
    const hashedPassword = await passwordService.hashPassword(newPassword);

    // update user password and reset passwordChangedAt
    await User.findByIdAndUpdate(tokenDoc.user, {
      password: hashedPassword,
      passwordChangedAt: new Date(),
    });

    // delete token after use
    await tokenDoc.deleteOne();
    await createLog({
      userId: tokenDoc.user,
      role: 'CLIENT',
      action: 'RESET_PASSWORD',
      details: 'Password reset via email token'
    });

    logger.info('Password reset completed', { userId: tokenDoc.user });
    const resp = success(null, 'Password updated successfully');
    return res.status(resp.status).json(resp);
  })

  // UPDATE PASSWORD
  updatePassword = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId).select('+password');
    const isValid = await passwordService.verifyPassword(currentPassword, user.password);
    if (!isValid) {
      const resp = error('Current password incorrect', 400);
      return res.status(resp.status).json(resp);
    }

    const hashedPassword = await passwordService.hashPassword(newPassword);
    await User.findByIdAndUpdate(userId, { password: hashedPassword, passwordChangedAt: new Date() });
    await createLog({
      userId,
      role: req.user.role,
      action: 'UPDATE_PASSWORD',
      details: 'User updated password'
    });

    logger.info('Password updated', { userId });
    const resp = success(null, 'Password updated');
    return res.status(resp.status).json(resp);
  })
}

module.exports = new AuthController();
