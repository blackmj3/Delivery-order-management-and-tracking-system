const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },

    phone: {
      type: String,
      required: [true, 'Phone number is required']
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false
    },

    role: {
      type: String,
      enum: ['CLIENT', 'DRIVER', 'ADMIN'],
      default: 'CLIENT'
    },

    isEmailVerified: {
      type: Boolean,
      default: false
    },

    isActive: {
      type: Boolean,
      default: true
    },

    averageRating: {
      type: Number,
      default: 0
    },

    ratingsCount: {
      type: Number,
      default: 0
    },

    avatar: {
      type: String,
      default: null
    },

    lastLogin: Date,
    passwordChangedAt: Date,

    isLocked: {
      type: Boolean,
      default: false
    },

    lockedUntil: Date,

    failedLoginAttempts: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
