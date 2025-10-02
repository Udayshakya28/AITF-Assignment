const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  language: {
    type: String,
    default: 'ja'
  },
  isVoiceInput: {
    type: Boolean,
    default: false
  }
});

const chatSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    default: 'anonymous'
  },
  messages: [messageSchema],
  weatherData: {
    location: String,
    temperature: Number,
    description: String,
    humidity: Number,
    windSpeed: Number,
    timestamp: Date
  },
  aiSuggestions: [{
    category: String,
    suggestion: String,
    confidence: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
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
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

chatSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

chatSchema.index({ sessionId: 1 });
chatSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);

