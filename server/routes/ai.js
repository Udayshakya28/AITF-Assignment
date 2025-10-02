const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const weatherService = require('../services/weatherService');
const logger = require('../utils/logger');

// Generate AI suggestions based on weather
router.post('/suggestions', async (req, res) => {
  try {
    const { location, preferences = {} } = req.body;
    
    if (!location || !location.city) {
      return res.status(400).json({
        success: false,
        error: '場所の情報が必要です'
      });
    }

    // Get current weather data
    const weatherData = await weatherService.getCurrentWeather(
      location.city, 
      location.country
    );

    // Generate AI suggestions
    const suggestions = await aiService.generateTravelSuggestions(
      weatherData, 
      preferences
    );

    res.json({
      success: true,
      data: {
        suggestions,
        weather: weatherData
      }
    });
  } catch (error) {
    logger.error('AI suggestions error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Process voice input
router.post('/voice', async (req, res) => {
  try {
    const { transcription, context = {} } = req.body;
    
    if (!transcription) {
      return res.status(400).json({
        success: false,
        error: '音声の文字起こしが必要です'
      });
    }

    const result = await aiService.processVoiceInput(transcription, context);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Voice processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate chat response
router.post('/chat', async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'メッセージが必要です'
      });
    }

    const result = await aiService.generateChatResponse(message, context);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Chat response error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get AI suggestions with coordinates
router.post('/suggestions/coordinates', async (req, res) => {
  try {
    const { lat, lon, preferences = {} } = req.body;
    
    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: '緯度と経度が必要です'
      });
    }

    // Get current weather data by coordinates
    const weatherData = await weatherService.getWeatherByCoordinates(
      parseFloat(lat), 
      parseFloat(lon)
    );

    // Generate AI suggestions
    const suggestions = await aiService.generateTravelSuggestions(
      weatherData, 
      preferences
    );

    res.json({
      success: true,
      data: {
        suggestions,
        weather: weatherData
      }
    });
  } catch (error) {
    logger.error('AI suggestions by coordinates error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

