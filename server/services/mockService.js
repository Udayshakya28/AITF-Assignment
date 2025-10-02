// Mock service for development when APIs are not available
const logger = require('../utils/logger');

class MockService {
  constructor() {
    this.isWeatherApiAvailable = process.env.OPENWEATHER_API_KEY && 
                                 process.env.OPENWEATHER_API_KEY !== 'demo_key_replace_with_real';
    this.isAiApiAvailable = process.env.OPENAI_API_KEY && 
                           process.env.OPENAI_API_KEY !== 'demo_key_replace_with_real';
  }

  getMockWeatherData(city = '東京') {
    const now = new Date();
    const sunrise = new Date(now);
    sunrise.setHours(6, 30, 0, 0);
    const sunset = new Date(now);
    sunset.setHours(18, 45, 0, 0);

    // Generate realistic weather data based on city
    const weatherVariations = this.getWeatherVariationsByCity(city);

    return {
      location: {
        name: city,
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
        windSpeed: 2 + Math.random() * 8,
        windDirection: Math.floor(Math.random() * 360),
        visibility: 8000 + Math.floor(Math.random() * 4000),
        cloudiness: weatherVariations.cloudiness,
        timestamp: now
      },
      sun: {
        sunrise: sunrise,
        sunset: sunset
      },
      timestamp: now
    };
  }

  getWeatherVariationsByCity(city) {
    // Weather variations based on city location and climate
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

    // Default fallback for unknown cities
    const defaultWeather = {
      temperature: 20 + Math.floor(Math.random() * 20) - 10, // 10-30°C
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
      `今天天气很好，适合外出散步或购物！`,
      `湿度是${context.weather?.humidity || '65'}%，风速${context.weather?.windSpeed || '3.5'}米/秒。`,
      `这样的天气建议穿轻便的衣服，别忘了防晒！`
    ] : [
      `こんにちは！${context.weather?.location || '東京'}の天気についてお聞きですね。`,
      `現在の気温は${context.weather?.temperature || '22'}度で、${context.weather?.description || '晴れ'}です。`,
      `今日は外出に良い天気ですね！散歩や買い物などはいかがでしょうか。`,
      `湿度は${context.weather?.humidity || '65'}%で、風速は${context.weather?.windSpeed || '3.5'}m/sです。`,
      `このような天気では、軽い服装がおすすめです。日焼け止めもお忘れなく！`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  getMockSuggestions(theme = 'travel', weatherData) {
    const suggestions = {
      travel: '今日は天気が良いので、近くの公園や観光地への散策がおすすめです。カメラを持って美しい景色を撮影してみてはいかがでしょうか。',
      fashion: 'この気温なら薄手の長袖シャツに軽いジャケットがぴったりです。明るい色の服装で春らしさを演出しましょう。',
      sports: '屋外でのジョギングやサイクリングに最適な天気です。水分補給を忘れずに軽い運動を楽しみましょう。',
      music: '晴れた日にはアップテンポな音楽がよく合います。お気に入りのプレイリストを聞きながら外出してみませんか。',
      agriculture: '日当たりが良いので、植物の水やりや剪定作業に適しています。ガーデニングを楽しむには良い日です。',
      general: '今日は一日中快適に過ごせそうです。家事や買い物、友人との外出など、様々な活動に適した天気ですね。'
    };

    return {
      suggestion: suggestions[theme] || suggestions.general,
      theme,
      confidence: 0.8,
      weatherContext: {
        temperature: weatherData?.current?.temperature || 22,
        description: weatherData?.current?.description || '晴れ',
        location: weatherData?.location?.name || '東京'
      },
      timestamp: new Date()
    };
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
    if (transcription.includes('東京') || transcription.includes('tokyo')) {
      location = '東京';
    }
    if (transcription.includes('明日')) {
      timeframe = '明日';
    }

    const response = this.getMockAiResponse(transcription, {
      weather: { location, temperature: 22, description: '晴れ' }
    });

    return {
      intent,
      location,
      timeframe,
      activity_type,
      response
    };
  }
}

module.exports = new MockService();
