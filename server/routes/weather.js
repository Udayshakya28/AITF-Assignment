const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');
const logger = require('../utils/logger');

// Get current weather by city name
router.get('/current/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const { country } = req.query;
    
    const weatherData = await weatherService.getCurrentWeather(city, country);
    
    res.json({
      success: true,
      data: weatherData
    });
  } catch (error) {
    logger.error('Weather route error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get current weather by coordinates
router.get('/current', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: '緯度と経度が必要です'
      });
    }
    
    const weatherData = await weatherService.getWeatherByCoordinates(
      parseFloat(lat), 
      parseFloat(lon)
    );
    
    res.json({
      success: true,
      data: weatherData
    });
  } catch (error) {
    logger.error('Weather route error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get weather forecast
router.get('/forecast/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const { country, days = 5 } = req.query;
    
    const forecastData = await weatherService.getForecast(
      city, 
      country, 
      parseInt(days)
    );
    
    res.json({
      success: true,
      data: forecastData
    });
  } catch (error) {
    logger.error('Forecast route error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Geocode city
router.get('/geocode/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const { country } = req.query;
    
    const locationData = await weatherService.geocodeCity(city, country);
    
    res.json({
      success: true,
      data: locationData
    });
  } catch (error) {
    logger.error('Geocoding route error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

