const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const authUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  avatar: {
    type: String,
    default: null
  },
  preferences: {
    language: {
      type: String,
      enum: ['zh', 'ja', 'en'],
      default: 'en'
    },
    theme: {
      type: String,
      enum: ['travel', 'fashion', 'sports', 'music', 'agriculture', 'general'],
      default: 'travel'
    },
    location: {
      city: String,
      country: String,
      coordinates: {
        lat: Number,
        lon: Number
      }
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      weather: {
        type: Boolean,
        default: true
      }
    }
  },
  stats: {
    totalSessions: {
      type: Number,
      default: 0
    },
    totalMessages: {
      type: Number,
      default: 0
    },
    totalVoiceInputs: {
      type: Number,
      default: 0
    },
    favoriteLocations: [String],
    lastActiveTheme: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
authUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update timestamp on save
authUserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compare password method
authUserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get full name
authUserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Hide sensitive fields when converting to JSON
authUserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.verificationToken;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  return user;
};

// Create indexes
authUserSchema.index({ email: 1 });
authUserSchema.index({ username: 1 });
authUserSchema.index({ createdAt: -1 });
authUserSchema.index({ lastLogin: -1 });

module.exports = mongoose.model('AuthUser', authUserSchema);
