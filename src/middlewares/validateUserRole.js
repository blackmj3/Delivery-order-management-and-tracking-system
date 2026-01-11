const User = require('../models/User');

const validateUserRole = (req, res, next) => {
  const { role, isActive } = req.body;

  if (role) {
    const allowedRoles = User.schema.path('role').enumValues;
    const roles = role.toUpperCase();
    if (typeof role !== 'string' || !allowedRoles.includes(roles)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed roles: ${allowedRoles.join(', ')}`
      });
    }
  }

  if (isActive !== undefined && typeof isActive !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'isActive must be boolean'
    });
  }

  next();
};

module.exports ={validateUserRole};
