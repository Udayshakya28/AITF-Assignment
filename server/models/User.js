const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  preferences: {
    language: {
      type: String,
      default: 'ja'
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
    voiceEnabled: {
      type: Boolean,
      default: true
    }
  },
  chatHistory: [{
    sessionId: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  stats: {
    totalChats: {
      type: Number,
      default: 0
    },
    totalVoiceInputs: {
      type: Number,
      default: 0
    },
    favoriteWeatherQueries: [String],
    mostUsedTheme: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', function(next) {
  this.lastActive = Date.now();
  next();
});

userSchema.index({ userId: 1 });
userSchema.index({ lastActive: -1 });

module.exports = mongoose.model('User', userSchema);

