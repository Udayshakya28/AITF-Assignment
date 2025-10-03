const express = require('express');
const router = express.Router();
const AuthUser = require('../models/AuthUser');
const { generateToken, authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');
const Joi = require('joi');
const mongoose = require('mongoose');

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().max(50).required(),
  lastName: Joi.string().max(50).required(),
  preferences: Joi.object({
    language: Joi.string().valid('zh', 'ja', 'en').default('en'),
    theme: Joi.string().valid('travel', 'fashion', 'sports', 'music', 'agriculture', 'general').default('travel'),
    location: Joi.object({
      city: Joi.string(),
      country: Joi.string(),
      coordinates: Joi.object({
        lat: Joi.number(),
        lon: Joi.number()
      })
    })
  }).default({})
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    // If DB is not connected, short-circuit in demo mode
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Registration unavailable in demo mode'
      });
    }
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { email, username, password, firstName, lastName, preferences } = value;

    // Check if user already exists
    const existingUser = await AuthUser.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email or username already exists'
      });
    }

    // Create new user
    const user = new AuthUser({
      email,
      username,
      password,
      firstName,
      lastName,
      preferences,
      isVerified: true // Auto-verify for demo
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      data: {
        user,
        token
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { email, password } = value;
    // Demo mode - DB not connected
    if (mongoose.connection.readyState !== 1) {
      const demoEmail = process.env.DEMO_EMAIL || 'demo@example.com';
      const demoPassword = process.env.DEMO_PASSWORD || 'password123';

      if (email === demoEmail && password === demoPassword) {
        const token = generateToken('demo');
        const demoUser = {
          _id: 'demo',
          email: demoEmail,
          username: 'demo',
          firstName: 'Demo',
          lastName: 'User',
          isActive: true,
          isVerified: true,
          preferences: {
            language: 'en',
            theme: 'travel',
            location: { city: 'Tokyo', country: 'JP' }
          },
          stats: {
            totalSessions: 0,
            totalMessages: 0,
            totalVoiceInputs: 0
          },
          createdAt: new Date(),
          lastLogin: new Date()
        };

        return res.json({
          success: true,
          data: { user: demoUser, token },
          message: 'Login successful (demo)'
        });
      }

      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // Normal DB-backed auth
    const user = await AuthUser.findOne({ email });
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);
    user.lastLogin = new Date();
    await user.save();

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      data: {
        user,
        token
      },
      message: 'Login successful'
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.'
    });
  }
});

// Get current user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    // Demo mode: token id === 'demo'
    if (mongoose.connection.readyState !== 1 && req.user?._id === undefined) {
      // middleware authenticate would fail without DB; so allow passthrough if token is valid
      return res.json({ success: true, data: { user: { email: 'demo@example.com', username: 'demo', firstName: 'Demo', lastName: 'User', preferences: { language: 'en', theme: 'travel', location: { city: 'Tokyo', country: 'JP' } } } } });
    }

    res.json({ success: true, data: { user: req.user } });
  } catch (error) {
    logger.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['firstName', 'lastName', 'preferences', 'avatar'];
    const filteredUpdates = {};

    // Filter allowed updates
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const user = await AuthUser.findByIdAndUpdate(
      req.user._id,
      filteredUpdates,
      { new: true, runValidators: true }
    );

    logger.info(`Profile updated for user: ${user.email}`);

    res.json({
      success: true,
      data: {
        user
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

// Change password
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long'
      });
    }

    const user = await AuthUser.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Password change error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
});

// Logout (client-side token removal, optional server-side tracking)
router.post('/logout', authenticate, async (req, res) => {
  try {
    logger.info(`User logged out: ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

module.exports = router;
