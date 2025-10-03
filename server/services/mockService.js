// services/mockService.js
// Mock service for development when APIs are not available
const logger = require('../utils/logger');

class MockService {
  constructor() {
    this.isWeatherApiAvailable =
      !!process.env.OPENWEATHER_API_KEY &&
      process.env.OPENWEATHER_API_KEY !== 'demo_key_replace_with_real';

    // Align with Gemini (no OpenAI here)
    this.isAiApiAvailable =
      !!process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== 'demo_key_replace_with_real';
  }

  // Ensure mock outputs also obey the 100-word limit
  clip(text, n = 100) {
    return String(text || '').trim().split(/\s+/).slice(0, n).join(' ');
  }

  // Simple normalization so Japanese names hit the English map
  normalizeCity(city) {
    const map = {
      '東京': 'Tokyo',
      '大阪': 'Osaka',
      '京都': 'Kyoto',
      '札幌': 'Sapporo',
      '横浜': 'Yokohama',
      '名古屋': 'Nagoya',
      '福岡': 'Fukuoka',
      '神戸': 'Kobe',
      '北京': 'Beijing',
      '上海': 'Shanghai',
      '首尔': 'Seoul',
      '서울': 'Seoul',
      '孟买': 'Mumbai'
    };
    return map[city] || city;
  }

  getMockWeatherData(city = '東京') {
    const now = new Date();
    const sunrise = new Date(now);
    sunrise.setHours(6, 30, 0, 0);
    const sunset = new Date(now);
    sunset.setHours(18, 45, 0, 0);

    const normCity = this.normalizeCity(city);
    const weatherVariations = this.getWeatherVariationsByCity(normCity);

    return {
      location: {
        name: city, // keep original input label for UI
        country: weatherVariations.country,
        coordinates: weatherVariations.coordinates
      },
      current: {
        temperature: weatherVariations.temperature,
        feelsLike: weatherVariations.temperature + 2,
        description: weatherVariations.description,
        main: weatherVariations.main,
        icon: weatherVariations.icon,
        humidity: weatherVariations.humidity,
        pressure: 1013 + Math.floor(Math.random() * 40) - 20,
        windSpeed: Number((2 + Math.random() * 8).toFixed(1)),
        windDirection: Math.floor(Math.random() * 360),
        visibility: 8000 + Math.floor(Math.random() * 4000),
        cloudiness: weatherVariations.cloudiness,
        timestamp: now
      },
      sun: {
        sunrise,
        sunset
      },
      timestamp: now
    };
  }

  getWeatherVariationsByCity(city) {
    const cityWeatherMap = {
      // Asia
      'Tokyo': { temperature: 22, description: '晴れ', main: 'Clear', icon: '01d', humidity: 65, cloudiness: 10, country: 'JP', coordinates: { lat: 35.6762, lon: 139.6503 } },
      'Beijing': { temperature: 18, description: '多云', main: 'Clouds', icon: '02d', humidity: 55, cloudiness: 40, country: 'CN', coordinates: { lat: 39.9042, lon: 116.4074 } },
      'Shanghai': { temperature: 25, description: '小雨', main: 'Rain', icon: '10d', humidity: 78, cloudiness: 75, country: 'CN', coordinates: { lat: 31.2304, lon: 121.4737 } },
      'Seoul': { temperature: 16, description: '맑음', main: 'Clear', icon: '01d', humidity: 58, cloudiness: 15, country: 'KR', coordinates: { lat: 37.5665, lon: 126.9780 } },
      'Singapore': { temperature: 30, description: 'Thunderstorm', main: 'Thunderstorm', icon: '11d', humidity: 85, cloudiness: 80, country: 'SG', coordinates: { lat: 1.3521, lon: 103.8198 } },
      'Bangkok': { temperature: 32, description: 'Hot', main: 'Clear', icon: '01d', humidity: 75, cloudiness: 20, country: 'TH', coordinates: { lat: 13.7563, lon: 100.5018 } },
      'Mumbai': { temperature: 28, description: 'Humid', main: 'Clouds', icon: '03d', humidity: 82, cloudiness: 60, country: 'IN', coordinates: { lat: 19.0760, lon: 72.8777 } },

      // Europe
      'London': { temperature: 12, description: 'Drizzle', main: 'Drizzle', icon: '09d', humidity: 75, cloudiness: 85, country: 'GB', coordinates: { lat: 51.5074, lon: -0.1278 } },
      'Paris': { temperature: 15, description: 'Nuageux', main: 'Clouds', icon: '03d', humidity: 68, cloudiness: 70, country: 'FR', coordinates: { lat: 48.8566, lon: 2.3522 } },
      'Berlin': { temperature: 11, description: 'Bewölkt', main: 'Clouds', icon: '04d', humidity: 72, cloudiness: 80, country: 'DE', coordinates: { lat: 52.5200, lon: 13.4050 } },
      'Rome': { temperature: 20, description: 'Soleggiato', main: 'Clear', icon: '01d', humidity: 60, cloudiness: 25, country: 'IT', coordinates: { lat: 41.9028, lon: 12.4964 } },
      'Madrid': { temperature: 18, description: 'Soleado', main: 'Clear', icon: '01d', humidity: 45, cloudiness: 15, country: 'ES', coordinates: { lat: 40.4168, lon: -3.7038 } },
      'Moscow': { temperature: 5, description: 'Снег', main: 'Snow', icon: '13d', humidity: 80, cloudiness: 90, country: 'RU', coordinates: { lat: 55.7558, lon: 37.6176 } },

      // North America
      'New York': { temperature: 16, description: 'Partly Cloudy', main: 'Clouds', icon: '02d', humidity: 65, cloudiness: 45, country: 'US', coordinates: { lat: 40.7128, lon: -74.0060 } },
      'Los Angeles': { temperature: 24, description: 'Sunny', main: 'Clear', icon: '01d', humidity: 55, cloudiness: 10, country: 'US', coordinates: { lat: 34.0522, lon: -118.2437 } },
      'Chicago': { temperature: 8, description: 'Windy', main: 'Clouds', icon: '03d', humidity: 70, cloudiness: 60, country: 'US', coordinates: { lat: 41.8781, lon: -87.6298 } },
      'Toronto': { temperature: 10, description: 'Cool', main: 'Clouds', icon: '03d', humidity: 68, cloudiness: 55, country: 'CA', coordinates: { lat: 43.6532, lon: -79.3832 } },
      'Mexico City': { temperature: 22, description: 'Templado', main: 'Clear', icon: '01d', humidity: 50, cloudiness: 30, country: 'MX', coordinates: { lat: 19.4326, lon: -99.1332 } },

      // South America
      'São Paulo': { temperature: 26, description: 'Chuvoso', main: 'Rain', icon: '10d', humidity: 80, cloudiness: 85, country: 'BR', coordinates: { lat: -23.5505, lon: -46.6333 } },
      'Buenos Aires': { temperature: 19, description: 'Fresco', main: 'Clear', icon: '01d', humidity: 65, cloudiness: 35, country: 'AR', coordinates: { lat: -34.6118, lon: -58.3960 } },
      'Lima': { temperature: 20, description: 'Nublado', main: 'Clouds', icon: '03d', humidity: 75, cloudiness: 70, country: 'PE', coordinates: { lat: -12.0464, lon: -77.0428 } },

      // Africa
      'Cairo': { temperature: 30, description: 'Hot & Dry', main: 'Clear', icon: '01d', humidity: 35, cloudiness: 5, country: 'EG', coordinates: { lat: 30.0444, lon: 31.2357 } },
      'Lagos': { temperature: 29, description: 'Humid', main: 'Clouds', icon: '03d', humidity: 85, cloudiness: 65, country: 'NG', coordinates: { lat: 6.5244, lon: 3.3792 } },
      'Cape Town': { temperature: 18, description: 'Windy', main: 'Clear', icon: '01d', humidity: 60, cloudiness: 25, country: 'ZA', coordinates: { lat: -33.9249, lon: 18.4241 } },

      // Oceania
      'Sydney': { temperature: 23, description: 'Pleasant', main: 'Clear', icon: '01d', humidity: 65, cloudiness: 20, country: 'AU', coordinates: { lat: -33.8688, lon: 151.2093 } },
      'Melbourne': { temperature: 18, description: 'Variable', main: 'Clouds', icon: '02d', humidity: 70, cloudiness: 50, country: 'AU', coordinates: { lat: -37.8136, lon: 144.9631 } },

      // Middle East
      'Dubai': { temperature: 35, description: 'Very Hot', main: 'Clear', icon: '01d', humidity: 60, cloudiness: 5, country: 'AE', coordinates: { lat: 25.2048, lon: 55.2708 } },
      'Riyadh': { temperature: 32, description: 'Hot & Dry', main: 'Clear', icon: '01d', humidity: 25, cloudiness: 0, country: 'SA', coordinates: { lat: 24.7136, lon: 46.6753 } }
    };

    const defaultWeather = {
      temperature: 20 + Math.floor(Math.random() * 20) - 10, // 10–30°C
      description: 'Pleasant',
      main: 'Clear',
      icon: '01d',
      humidity: 60 + Math.floor(Math.random() * 30),
      cloudiness: Math.floor(Math.random() * 50),
      country: 'XX',
      coordinates: { lat: 0, lon: 0 }
    };

    return cityWeatherMap[city] || defaultWeather;
  }

  getMockAiResponse(message, context = {}) {
    // Detect language from message
    const isChinese = /[\u4e00-\u9fff]/.test(message);

    const responses = isChinese ? [
      `您好！您想了解${context.weather?.location || '东京'}的天气情况吗？`,
      `当前气温是${context.weather?.temperature || '22'}度，天气${context.weather?.description || '晴朗'}。`,
      `今天天气不错，适合散步或购物。`,
      `湿度约${context.weather?.humidity || '65'}%，风速${context.weather?.windSpeed || '3.5'}米/秒。`,
      `建议穿轻便衣物，注意防晒。`
    ] : [
      `こんにちは！${context.weather?.location || '東京'}の天気についてお聞きですね。`,
      `現在の気温は${context.weather?.temperature || '22'}℃、${context.weather?.description || '晴れ'}です。`,
      `今日は外出に良い天気。散歩や買い物に最適です。`,
      `湿度は約${context.weather?.humidity || '65'}%、風速は${context.weather?.windSpeed || '3.5'}m/s。`,
      `軽めの服装がおすすめ。日焼け止めも忘れずに。`
    ];

    return this.clip(responses[Math.floor(Math.random() * responses.length)], 100);
  }

  getMockSuggestions(theme = 'travel', weatherData) {
    const suggestions = {
      travel: '今日は天気が良いので、近くの公園や観光地へ。歩きやすい靴と水分補給を忘れずに。',
      fashion: '薄手の長袖に軽いジャケットが最適。明るい色で季節感を出しましょう。',
      sports: '屋外のジョギングやサイクリングに最適。こまめな水分補給を。',
      music: '晴れの日はアップテンポが合います。外へ出て音楽散歩もおすすめ。',
      agriculture: '日当たり良好。水やりや剪定、苗の植え替えに向いています。',
      general: '一日快適に過ごせそう。家事、買い物、軽い外出に向いた天気です。'
    };

    const payload = {
      suggestion: this.clip(suggestions[theme] || suggestions.general, 100),
      theme,
      confidence: 0.8,
      weatherContext: {
        temperature: weatherData?.current?.temperature || 22,
        description: weatherData?.current?.description || '晴れ',
        location: weatherData?.location?.name || '東京'
      },
      timestamp: new Date()
    };
    return payload;
  }

  processVoiceInput(transcription) {
    logger.info('Mock voice processing:', transcription);

    // Simple keyword detection
    let intent = 'general_chat';
    let location = null;
    let timeframe = '今日';
    let activity_type = '一般';

    if (transcription.includes('天気') || transcription.includes('気温')) {
      intent = 'weather_query';
    }
    if (transcription.includes('旅行') || transcription.includes('外出')) {
      intent = 'travel_suggestion';
      activity_type = '旅行';
    }
    if (/(東京|tokyo)/i.test(transcription)) {
      location = '東京';
    }
    if (transcription.includes('明日')) {
      timeframe = '明日';
    }

    const response = this.getMockAiResponse(transcription, {
      weather: { location: location || '東京', temperature: 22, description: '晴れ', humidity: 60, windSpeed: 3.5 }
    });

    return {
      intent,
      location,
      timeframe,
      activity_type,
      response: this.clip(response, 100)
    };
  }
}

module.exports = new MockService();
