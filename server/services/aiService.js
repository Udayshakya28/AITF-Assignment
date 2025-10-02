const OpenAI = require('openai');
const logger = require('../utils/logger');
const mockService = require('./mockService');

class AIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.isApiAvailable = this.apiKey && this.apiKey !== 'demo_key_replace_with_real';
    
    if (this.isApiAvailable) {
      this.openai = new OpenAI({
        apiKey: this.apiKey
      });
    } else {
      logger.warn('OpenAI API key not configured - using mock AI responses');
    }
  }

  async generateTravelSuggestions(weatherData, userPreferences = {}) {
    try {
      const { theme = 'travel', location = {} } = userPreferences;
      
      if (!this.isApiAvailable) {
        logger.info('Using mock AI suggestions');
        return mockService.getMockSuggestions(theme, weatherData);
      }

      const prompt = this.buildPrompt(weatherData, theme, location);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(theme)
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const suggestion = response.choices[0].message.content;
      
      return {
        suggestion,
        theme,
        confidence: this.calculateConfidence(weatherData),
        weatherContext: {
          temperature: weatherData.current.temperature,
          description: weatherData.current.description,
          location: weatherData.location.name
        },
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('AI Service error:', error);
      logger.warn('Falling back to mock AI suggestions');
      return mockService.getMockSuggestions(userPreferences.theme || 'travel', weatherData);
    }
  }

  async processVoiceInput(transcription, context = {}) {
    try {
      if (!this.isApiAvailable) {
        logger.info('Using mock voice processing');
        return mockService.processVoiceInput(transcription);
      }

      const prompt = `
以下の音声入力を分析して、ユーザーの意図を理解してください（日本語または中国語）：

音声入力: "${transcription}"

コンテキスト:
- 現在の天気: ${context.weather?.description || '不明'}
- 気温: ${context.weather?.temperature || '不明'}°C
- 場所: ${context.weather?.location || '不明'}

以下の形式でJSONレスポンスを返してください：
{
  "intent": "weather_query|travel_suggestion|general_chat",
  "location": "抽出された場所名（あれば）",
  "timeframe": "今日|明日|今週|不明",
  "activity_type": "旅行|ファッション|スポーツ|音楽|農業|一般",
  "response": "ユーザーへの適切な回答（入力と同じ言語で）"
}
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'あなたは多言語対応の天気・旅行アシスタントです。日本語と中国語でユーザーの音声入力を分析し、適切に応答してください。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.3
      });

      try {
        const result = JSON.parse(response.choices[0].message.content);
        return result;
      } catch (parseError) {
        // If JSON parsing fails, return a fallback response
        return {
          intent: 'general_chat',
          location: null,
          timeframe: '不明',
          activity_type: '一般',
          response: response.choices[0].message.content
        };
      }
    } catch (error) {
      logger.error('Voice processing error:', error);
      logger.warn('Falling back to mock voice processing');
      return mockService.processVoiceInput(transcription);
    }
  }

  getSystemPrompt(theme) {
    const prompts = {
      travel: `あなたは日本語を話す旅行アドバイザーです。天気情報に基づいて、その日に最適な旅行や外出の提案をしてください。
具体的な場所、活動、服装、持ち物などを含めた実用的なアドバイスを日本語で提供してください。`,
      
      fashion: `あなたは日本語を話すファッションアドバイザーです。天気と気温に基づいて、その日に最適な服装やファッションアイテムを提案してください。
季節感、実用性、スタイルを考慮した具体的なアドバイスを日本語で提供してください。`,
      
      sports: `あなたは日本語を話すスポーツアドバイザーです。天気条件に基づいて、その日に最適なスポーツや運動活動を提案してください。
屋内外の選択肢、安全性、楽しさを考慮した具体的なアドバイスを日本語で提供してください。`,
      
      music: `あなたは日本語を話す音楽アドバイザーです。天気や気分に基づいて、その日にぴったりの音楽活動や楽曲を提案してください。
コンサート、楽器演奏、音楽鑑賞などの具体的なアドバイスを日本語で提供してください。`,
      
      agriculture: `あなたは日本語を話す農業アドバイザーです。天気条件に基づいて、その日に最適な農作業や園芸活動を提案してください。
作物の管理、種まき、収穫などの具体的なアドバイスを日本語で提供してください。`,
      
      general: `あなたは日本語を話す生活アドバイザーです。天気情報に基づいて、その日の生活に役立つ一般的な提案をしてください。
日常活動、健康管理、生活の質向上に関する具体的なアドバイスを日本語で提供してください。`
    };

    return prompts[theme] || prompts.general;
  }

  buildPrompt(weatherData, theme, location) {
    return `
現在の天気情報:
- 場所: ${weatherData.location.name}, ${weatherData.location.country}
- 気温: ${weatherData.current.temperature}°C (体感温度: ${weatherData.current.feelsLike}°C)
- 天気: ${weatherData.current.description}
- 湿度: ${weatherData.current.humidity}%
- 風速: ${weatherData.current.windSpeed}m/s
- 雲量: ${weatherData.current.cloudiness}%

ユーザーの設定:
- テーマ: ${theme}
- 希望地域: ${location.city || '指定なし'}

この天気条件に基づいて、${theme}に関する具体的で実用的な提案を日本語で200文字程度で提供してください。
安全性と楽しさを両立した、その日にぴったりのアドバイスをお願いします。
`;
  }

  calculateConfidence(weatherData) {
    // Simple confidence calculation based on data completeness
    let confidence = 0.5;
    
    if (weatherData.current.temperature !== undefined) confidence += 0.1;
    if (weatherData.current.description) confidence += 0.1;
    if (weatherData.current.humidity !== undefined) confidence += 0.1;
    if (weatherData.current.windSpeed !== undefined) confidence += 0.1;
    if (weatherData.location.name) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  async generateChatResponse(message, context = {}) {
    try {
      if (!this.isApiAvailable) {
        logger.info('Using mock chat response');
        return {
          response: mockService.getMockAiResponse(message, context),
          timestamp: new Date()
        };
      }

      const systemPrompt = `あなたは親しみやすい多言語対応の天気・生活アシスタントです。
ユーザーの質問に対して、天気情報や生活アドバイスを含めた有用で親切な回答を提供してください。
回答は自然で会話的で、200文字以内で簡潔にまとめてください。日本語と中国語に対応してください。`;

      const userPrompt = `
ユーザーメッセージ: ${message}

現在のコンテキスト:
${context.weather ? `
- 天気: ${context.weather.description}
- 気温: ${context.weather.temperature}°C
- 場所: ${context.weather.location}
` : ''}
${context.preferences ? `
- ユーザーテーマ: ${context.preferences.theme}
- 希望地域: ${context.preferences.location?.city || '未設定'}
` : ''}

上記の情報を参考に、ユーザーに役立つ回答を提供してください。
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      return {
        response: response.choices[0].message.content,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Chat response generation error:', error);
      logger.warn('Falling back to mock chat response');
      return {
        response: mockService.getMockAiResponse(message, context),
        timestamp: new Date()
      };
    }
  }
}

module.exports = new AIService();

