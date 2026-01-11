const User = require("../models/User");
const cookieService = require("../utils/cookieService");
const tokenService = require("../utils/generateToken");

// Authentication
const requireAuth = async (req, res, next) => {
    try {
        const token = cookieService.getAccessToken(req);

        if (!token) {
            return res.status(401).json({ message: "Access token missing" });
        }

        const decoded = tokenService.verifyAccessToken(token);

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "User no longer exists" });
        }

        if (user.isLocked && user.lockedUntil > Date.now()) {
            return res.status(403).json({ message: "Account is locked" });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({ message: "Email not verified" });
        }

        req.user = {
            id: user._id,
            email: user.email,
            role: user.role
        };

        next();
    } catch (error) {
        next(error);
    }
};

// Authorization (Role-Based)
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden: invalid role" });
        }

        next();
    };
};

module.exports = {
    requireAuth,
    authorize
};
