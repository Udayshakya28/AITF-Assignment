const axios = require('axios');
const logger = require('../utils/logger');
const mockService = require('./mockService');

class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    this.geocodingUrl = 'https://api.openweathermap.org/geo/1.0';
  }

  async getCurrentWeather(city, country = '') {
    try {
      // Check if API key is available
      if (!this.apiKey || this.apiKey === 'demo_key_replace_with_real') {
        logger.warn('Using mock weather data - API key not configured');
        return mockService.getMockWeatherData(city);
      }

      const location = country ? `${city},${country}` : city;
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          q: location,
          appid: this.apiKey,
          units: 'metric',
          lang: 'ja'
        }
      });

      return this.formatWeatherData(response.data);
    } catch (error) {
      logger.error('Weather API error:', error);
      logger.warn('Falling back to mock weather data');
      return mockService.getMockWeatherData(city);
    }
  }

  async getWeatherByCoordinates(lat, lon) {
    try {
      if (!this.apiKey || this.apiKey === 'demo_key_replace_with_real') {
        logger.warn('Using mock weather data - API key not configured');
        return mockService.getMockWeatherData('現在地');
      }

      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric',
          lang: 'ja'
        }
      });

      return this.formatWeatherData(response.data);
    } catch (error) {
      logger.error('Weather API error:', error);
      logger.warn('Falling back to mock weather data');
      return mockService.getMockWeatherData('現在地');
    }
  }

  async getForecast(city, country = '', days = 5) {
    try {
      const location = country ? `${city},${country}` : city;
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          q: location,
          appid: this.apiKey,
          units: 'metric',
          lang: 'ja',
          cnt: days * 8 // 8 forecasts per day (3-hour intervals)
        }
      });

      return this.formatForecastData(response.data);
    } catch (error) {
      logger.error('Forecast API error:', error);
      throw new Error('天気予報の取得に失敗しました');
    }
  }

  async geocodeCity(city, country = '') {
    try {
      const location = country ? `${city},${country}` : city;
      const response = await axios.get(`${this.geocodingUrl}/direct`, {
        params: {
          q: location,
          limit: 1,
          appid: this.apiKey
        }
      });

      if (response.data.length === 0) {
        throw new Error('都市が見つかりませんでした');
      }

      return {
        name: response.data[0].name,
        country: response.data[0].country,
        state: response.data[0].state,
        lat: response.data[0].lat,
        lon: response.data[0].lon
      };
    } catch (error) {
      logger.error('Geocoding API error:', error);
      throw new Error('都市の位置情報取得に失敗しました');
    }
  }

  formatWeatherData(data) {
    return {
      location: {
        name: data.name,
        country: data.sys.country,
        coordinates: {
          lat: data.coord.lat,
          lon: data.coord.lon
        }
      },
      current: {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        description: data.weather[0].description,
        main: data.weather[0].main,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        visibility: data.visibility,
        cloudiness: data.clouds.all,
        uvIndex: data.uvi || null
      },
      sun: {
        sunrise: new Date(data.sys.sunrise * 1000),
        sunset: new Date(data.sys.sunset * 1000)
      },
      timestamp: new Date()
    };
  }

  formatForecastData(data) {
    const dailyForecasts = {};
    
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date: new Date(item.dt * 1000),
          temperatures: [],
          descriptions: [],
          humidity: [],
          windSpeed: [],
          items: []
        };
      }
      
      dailyForecasts[date].temperatures.push(item.main.temp);
      dailyForecasts[date].descriptions.push(item.weather[0].description);
      dailyForecasts[date].humidity.push(item.main.humidity);
      dailyForecasts[date].windSpeed.push(item.wind.speed);
      dailyForecasts[date].items.push({
        time: new Date(item.dt * 1000),
        temperature: Math.round(item.main.temp),
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        humidity: item.main.humidity,
        windSpeed: item.wind.speed
      });
    });

    const forecast = Object.values(dailyForecasts).map(day => ({
      date: day.date,
      maxTemp: Math.round(Math.max(...day.temperatures)),
      minTemp: Math.round(Math.min(...day.temperatures)),
      description: day.descriptions[0], // Use first description of the day
      avgHumidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      avgWindSpeed: Math.round(day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length),
      hourlyData: day.items
    }));

    return {
      location: {
        name: data.city.name,
        country: data.city.country,
        coordinates: {
          lat: data.city.coord.lat,
          lon: data.city.coord.lon
        }
      },
      forecast,
      timestamp: new Date()
    };
  }
}

module.exports = new WeatherService();

