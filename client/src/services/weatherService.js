import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class WeatherService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Weather API Error:', error);
        if (error.response?.data?.error) {
          throw new Error(error.response.data.error);
        }
        throw new Error('天気情報の取得に失敗しました');
      }
    );
  }

  async getCurrentWeather(city, country = '') {
    try {
      const response = await this.api.get(`/weather/current/${encodeURIComponent(city)}`, {
        params: country ? { country } : {}
      });
      return response.data;
    } catch (error) {
      console.error('Get current weather error:', error);
      throw error;
    }
  }

  async getCurrentWeatherByCoordinates(lat, lon) {
    try {
      const response = await this.api.get('/weather/current', {
        params: { lat, lon }
      });
      return response.data;
    } catch (error) {
      console.error('Get weather by coordinates error:', error);
      throw error;
    }
  }

  async getForecast(city, country = '', days = 5) {
    try {
      const response = await this.api.get(`/weather/forecast/${encodeURIComponent(city)}`, {
        params: { 
          ...(country && { country }),
          days 
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get forecast error:', error);
      throw error;
    }
  }

  async geocodeCity(city, country = '') {
    try {
      const response = await this.api.get(`/weather/geocode/${encodeURIComponent(city)}`, {
        params: country ? { country } : {}
      });
      return response.data;
    } catch (error) {
      console.error('Geocode city error:', error);
      throw error;
    }
  }

  // Get user's current location using browser geolocation
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('位置情報がサポートされていません'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          let message = '位置情報の取得に失敗しました';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = '位置情報の使用が拒否されました';
              break;
            case error.POSITION_UNAVAILABLE:
              message = '位置情報が利用できません';
              break;
            case error.TIMEOUT:
              message = '位置情報の取得がタイムアウトしました';
              break;
          }
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Format weather icon URL
  getWeatherIconUrl(iconCode, size = '2x') {
    return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`;
  }

  // Get weather description in Japanese
  getWeatherDescription(main, description) {
    const descriptions = {
      'Clear': '晴れ',
      'Clouds': '曇り',
      'Rain': '雨',
      'Drizzle': '霧雨',
      'Thunderstorm': '雷雨',
      'Snow': '雪',
      'Mist': '霧',
      'Fog': '霧',
      'Haze': 'かすみ',
      'Dust': '砂塵',
      'Sand': '砂嵐',
      'Ash': '火山灰',
      'Squall': '突風',
      'Tornado': '竜巻'
    };

    return descriptions[main] || description || main;
  }

  // Convert wind direction from degrees to compass direction
  getWindDirection(degrees) {
    const directions = [
      '北', '北北東', '北東', '東北東',
      '東', '東南東', '南東', '南南東',
      '南', '南南西', '南西', '西南西',
      '西', '西北西', '北西', '北北西'
    ];
    
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }
}

export const weatherService = new WeatherService();

