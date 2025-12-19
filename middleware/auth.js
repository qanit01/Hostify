const jwt = require('jsonwebtoken');
const User = require('../models/User');

// =====================================
// Helper: Extract Bearer Token
// =====================================
const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.split(' ')[1];
};

// =====================================
// Mandatory Authentication Middleware
// =====================================
const authenticate = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token missing'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'User account is deactivated'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// =====================================
// Optional Authentication Middleware
// (Does NOT block public routes)
// =====================================
const optionalAuth = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);

    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (user && user.isActive) {
        req.user = user;
      }
    } catch (err) {
      // Ignore invalid token for optional auth
    }

    next();
  } catch (error) {
    next();
  }
};

// =====================================
// Role-Based Authorization
// =====================================
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    next();
  };
};

// =====================================
// Role Shortcuts
// =====================================
const adminOnly = authorize('admin');
const userOrAdmin = authorize('user', 'admin');

// =====================================
module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  adminOnly,
  userOrAdmin
};
