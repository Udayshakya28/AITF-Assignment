const jwt = require('jsonwebtoken');
const AuthUser = require('../models/AuthUser');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Demo mode: if DB is disconnected and token is demo, synthesize user
    if (mongoose.connection.readyState !== 1 && decoded.id === 'demo') {
      req.user = {
        _id: 'demo',
        email: process.env.DEMO_EMAIL || 'demo@example.com',
        username: 'demo',
        firstName: 'Demo',
        lastName: 'User',
        isActive: true,
        isVerified: true,
        preferences: {
          language: 'en',
          theme: 'travel',
          location: { city: 'Tokyo', country: 'JP' }
        }
      };
      return next();
    }

    const user = await AuthUser.findById(decoded.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token or user not found.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token.'
    });
  }
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await AuthUser.findById(decoded.id);
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Middleware to check if user owns the resource
const authorize = (resource) => {
  return (req, res, next) => {
    const resourceId = req.params[resource + 'Id'] || req.params.id;
    const userId = req.user._id.toString();
    
    if (resourceId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient permissions.'
      });
    }
    
    next();
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  generateToken,
  authorize
};
