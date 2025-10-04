const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require("../utils/logger");
const mockService = require("./mockService");

class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";
    this.isApiAvailable =
      !!this.apiKey &&
      !["demo_key_replace_with_real", "YOUR_API_KEY"].includes(this.apiKey);
    
    this.modelName = process.env.GEMINI_MODEL || "models/gemini-2.5-flash"; 
    this.model = null;

    if (this.isApiAvailable) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    } else {
      logger.warn("Gemini API key not configured - using mock AI responses");
    }
  }

  async ensureWorkingModel() {
    if (!this.isApiAvailable || this.model) return;

    const candidates = [
      this.modelName,
      "models/gemini-2.5-flash",
      "models/gemini-2.5-flash-preview-05-20",
      "models/gemini-2.5-pro",
      "models/gemini-2.0-flash-001",
    ];

    for (const name of candidates) {
      try {
        logger.info(`Testing Gemini model: ${name}`);
        const m = this.genAI.getGenerativeModel({ 
          model: name,
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 10,
          }
        });
        
        const result = await m.generateContent("Say OK in one word");
        const text = result?.response?.text();

        if (text && text.trim()) {
          this.model = m;
          this.modelName = name;
          logger.info(`✅ Gemini model selected: ${name}`);
          return;
        }
      } catch (e) {
        logger.warn(`Gemini model probe failed for ${name}: ${String(e?.message || e)}`);
      }
    }

    if (!this.model) {
      logger.error("No compatible Gemini model found. Falling back to mock service.");
      this.isApiAvailable = false;
    }
  }

  detectLanguage(text) {
    if (!text || typeof text !== 'string') return 'ja';
    
    const trimmedText = text.trim();
    if (trimmedText.length === 0) return 'ja';
    
    // Check for Japanese characters
    const hasJapanese = /[ぁ-んァ-ン一-龯]/.test(trimmedText);
    if (hasJapanese) return 'ja';
    
    // Check for English characters
    const hasEnglish = /[a-zA-Z]/.test(trimmedText);
    if (hasEnglish) return 'en';
    
    return 'ja'; // default to Japanese
  }

  truncateToWords(text, limit = 100) {
    if (!text) return text;
    const words = text.trim().split(/\s+/);
    if (words.length <= limit) return text.trim();
    return words.slice(0, limit).join(" ").trim() + "...";
  }

  async generateContent(prompt, generationConfig = {}, systemInstruction = null) {
    if (!this.isApiAvailable) {
      const detectedLanguage = this.detectLanguage(prompt);
      return mockService.getMockAiResponse(prompt, {}, detectedLanguage === 'en');
    }

    await this.ensureWorkingModel();
    if (!this.model) {
      throw new Error("AI Service not available - using mock responses");
    }

    const cfg = {
      temperature: 0.7,
      maxOutputTokens: 1024,
      ...generationConfig,
    };

    try {
      const request = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: cfg,
      };

      if (systemInstruction) {
        request.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      const result = await this.model.generateContent(request);
      const text = result.response.text();

      if (text && text.trim().length > 0) {
        return text.trim();
      }
      
      throw new Error("AI_EMPTY_RESPONSE: AI returned empty response");

    } catch (error) {
      logger.error("AI service request failed:", error);
      
      if (error.message?.includes('blocked') || error.message?.includes('safety')) {
        throw new Error("AI_BLOCKED: Content was blocked for safety reasons");
      }
      
      if (error.message?.includes('empty') || error.message?.includes('no text')) {
        throw new Error("AI_EMPTY_RESPONSE: AI returned empty response");
      }
      
      throw new Error("AI_GENERAL_FAILURE: " + String(error.message || error));
    }
  }

  async generateChatResponse(message, context = {}) {
    try {
      const detectedLanguage = this.detectLanguage(message);
      
      if (!this.isApiAvailable) {
        return { 
          response: mockService.getMockAiResponse(message, context, detectedLanguage === 'en'),
          timestamp: new Date(),
          language: detectedLanguage
        };
      }
      
      const responseLanguage = detectedLanguage === 'en' ? 'English' : 'Japanese';
      
      const systemInstruction = `You are a helpful travel and weather assistant.
IMPORTANT RULES:
1. You MUST respond in ${responseLanguage} ONLY - use the same language as the user's question
2. Keep responses under 100 words
3. Be practical and helpful
4. If user asks about a specific location different from available weather data:
   - Acknowledge their requested location
   - Provide general advice for that location
   - Mention any limitations due to different weather data
5. Focus on creating useful itineraries when requested
6. Always maintain a friendly, concise tone in ${responseLanguage}`;

      const userPrompt = this.buildChatPrompt(message, context, detectedLanguage);

      const raw = await this.generateContent(
        userPrompt,
        { 
          temperature: 0.5, 
          maxOutputTokens: 512 
        },
        systemInstruction
      );

      if (!raw) {
        throw new Error("AI_EMPTY_RESPONSE");
      }

      return {
        response: this.truncateToWords(raw, 100),
        timestamp: new Date(),
        language: detectedLanguage
      };

    } catch (error) {
      logger.error("Chat response generation error:", error);
      const detectedLanguage = this.detectLanguage(message);
      
      return {
        response: mockService.getMockAiResponse(message, context, detectedLanguage === 'en'),
        timestamp: new Date(),
        language: detectedLanguage
      };
    }
  }

  buildChatPrompt(message, context, language) {
    const weatherInfo = context.weather ? 
      `Available Weather Data:
      - Location: ${context.weather.location}
      - Conditions: ${context.weather.description}
      - Temperature: ${context.weather.temperature}°C
      ` : "No specific weather data available for the requested location";

    const userPreferences = context.preferences ? 
      `User Preferences:
      - Theme: ${context.preferences.theme || 'travel'}
      - Language: ${context.preferences.language || 'auto'}
      ` : "No specific preferences";

    if (language === 'en') {
      return `
USER MESSAGE (English):
"${message}"

CONTEXT:
${weatherInfo}

${userPreferences}

Please provide a helpful response in English that:
- Directly addresses the user's request
- Is practical and useful
- Stays under 100 words
- Is friendly and concise
`.trim();
    } else {
      return `
ユーザーメッセージ (日本語):
"${message}"

コンテキスト:
${weatherInfo}

${userPreferences}

以下の要件で日本語で回答してください：
- ユーザーのリクエストに直接応える
- 実用的で役立つ内容
- 100語以内
- 友好的で簡潔なトーン
`.trim();
    }
  }

  async generateTravelSuggestions(weatherData, userPreferences = {}) {
    try {
      const language = userPreferences.language || 'ja';
      
      if (!this.isApiAvailable) {
        return mockService.getMockSuggestions(
          userPreferences.theme || "travel", 
          weatherData,
          language === 'en'
        );
      }

      const theme = userPreferences.theme || 'travel';
      const systemInstruction = this.getSystemPrompt(theme, language);
      const userPrompt = this.buildWeatherPrompt(weatherData, theme, language);

      const raw = await this.generateContent(
        userPrompt,
        { temperature: 0.7, maxOutputTokens: 512 },
        systemInstruction
      );
      
      if (!raw) throw new Error("AI_EMPTY_RESPONSE");

      return { 
        suggestion: this.truncateToWords(raw, 100), 
        theme, 
        confidence: this.calculateConfidence(weatherData),
        weatherContext: { 
          temperature: weatherData.current.temperature, 
          description: weatherData.current.description, 
          location: weatherData.location.name 
        }, 
        timestamp: new Date(),
        language: language
      };

    } catch (error) {
      logger.error("AI Service error in generateTravelSuggestions:", error);
      logger.warn("Falling back to mock AI suggestions");
      const language = userPreferences.language || 'ja';
      
      return mockService.getMockSuggestions(
        userPreferences.theme || "travel",
        weatherData,
        language === 'en'
      );
    }
  }

  getSystemPrompt(theme, language = 'ja') {
    if (language === 'en') {
      const prompts = {
        travel: `You are a friendly travel advisor. Respond in English only. Based on the weather data, suggest the best outing or travel plan for the day. Include clothes, necessary items, and specific places. Limit to 100 words.`,
        fashion: `You are a fashion advisor. Respond in English only. Based on temperature and weather, suggest the most suitable outfit. Limit to 100 words.`,
        sports: `You are a sports advisor. Respond in English only. Suggest safe, enjoyable exercises suitable for current weather. Limit to 100 words.`,
        music: `You are a music advisor. Respond in English only. Suggest musical activities or songs matching the weather/mood. Limit to 100 words.`,
        agriculture: `You are an agriculture advisor. Respond in English only. Suggest farming/gardening tasks based on weather. Limit to 100 words.`,
        general: `You are a lifestyle advisor. Respond in English only. Provide practical daily advice based on weather. Limit to 100 words.`,
      };
      return prompts[theme] || prompts.general;
    } else {
      const prompts = {
        travel: `あなたは日本語を話す旅行アドバイザーです。天気情報に基づき、その日に最適な旅行・外出案を提案。服装・持ち物・具体的な場所を含め、100語以内で。`,
        fashion: `あなたは日本語を話すファッションアドバイザーです。天気/気温から最適な服装を具体的に提案。100語以内で。`,
        sports: `あなたは日本語を話すスポーツアドバイザーです。天気条件に応じた安全で楽しい運動を具体的に提案。100語以内で。`,
        music: `あなたは日本語を話す音楽アドバイザーです。天気や気分に合う音楽活動/楽曲を提案。100語以内で。`,
        agriculture: `あなたは日本語を話す農業アドバイザーです。天気に基づく農作業/園芸作業を具体的に提案。100語以内で。`,
        general: `あなたは日本語を話す生活アドバイザーです。天気に基づく日常アドバイスを実用的に、100語以内で。`,
      };
      return prompts[theme] || prompts.general;
    }
  }

  buildWeatherPrompt(weatherData, theme, language = 'ja') {
    if (language === 'en') {
      return `
Weather Information:
- Location: ${weatherData.location.name}, ${weatherData.location.country}
- Temperature: ${weatherData.current.temperature}°C (Feels Like: ${weatherData.current.feelsLike}°C)
- Description: ${weatherData.current.description}
- Humidity: ${weatherData.current.humidity}%
- Wind Speed: ${weatherData.current.windSpeed}m/s

Based on these conditions, provide a practical ${theme} suggestion in English, limited to 100 words.
`.trim();
    } else {
      return `
天気情報:
- 場所: ${weatherData.location.name}, ${weatherData.location.country}
- 気温: ${weatherData.current.temperature}°C (体感: ${weatherData.current.feelsLike}°C)
- 天気: ${weatherData.current.description}
- 湿度: ${weatherData.current.humidity}%
- 風速: ${weatherData.current.windSpeed}m/s

この条件に基づき、${theme}について実用的な提案を日本語で100語以内で。
`.trim();
    }
  }

  calculateConfidence(weatherData) {
    let confidence = 0.5;
    if (weatherData.current.temperature !== undefined) confidence += 0.1;
    if (weatherData.current.description) confidence += 0.1;
    if (weatherData.current.humidity !== undefined) confidence += 0.1;
    if (weatherData.current.windSpeed !== undefined) confidence += 0.1;
    if (weatherData.location.name) confidence += 0.1;
    return Math.min(confidence, 1.0);
  }

  async processVoiceInput(transcription, context = {}) {
    try {
      const detectedLanguage = this.detectLanguage(transcription);
      
      if (!this.isApiAvailable) {
        return mockService.processVoiceInput(transcription, detectedLanguage === 'en');
      }

      const responseLanguage = detectedLanguage === 'en' ? 'English' : 'Japanese';
      const systemInstruction = `You are a voice input analyzer. Detect user intent and extract key information. Respond in ${responseLanguage}.`;
      
      const prompt = `
Analyze this voice input and extract information:
Voice: "${transcription}"

Return STRICT JSON:
{
  "intent": "weather_query|travel_suggestion|itinerary_planning|general_chat",
  "location": "Extracted location name or null",
  "timeframe": "today|tomorrow|this_week|unknown",
  "activity_type": "travel|fashion|sports|music|agriculture|general",
  "response": "A brief acknowledgment in ${responseLanguage}, under 50 words"
}`.trim();

      const raw = await this.generateContent(
        prompt,
        { temperature: 0.1, maxOutputTokens: 512 },
        systemInstruction
      );
      
      if (!raw) throw new Error("AI_EMPTY_RESPONSE");
      
      const result = JSON.parse(raw);
      result.response = this.truncateToWords(result.response, 50);
      return result;

    } catch (error) {
      logger.error("Voice processing error:", error);
      const detectedLanguage = this.detectLanguage(transcription);
      return mockService.processVoiceInput(transcription, detectedLanguage === 'en');
    }
  }
}

module.exports = new AIService();