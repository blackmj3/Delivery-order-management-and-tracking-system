const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    token: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: ['REFRESH', 'RESET_PASSWORD', 'VERIFY_EMAIL'],
      required: true
    },

    expiresAt: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

tokenSchema.index({ token: 1 });
tokenSchema.index({ user: 1, type: 1 });
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });


module.exports = mongoose.model('Token', tokenSchema);
