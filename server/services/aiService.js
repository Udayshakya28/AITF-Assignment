// services/aiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require("../utils/logger");
const mockService = require("./mockService");

class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.isApiAvailable = !!this.apiKey && this.apiKey !== "demo_key_replace_with_real";
    this.modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash-latest";
    this.tried = false; // to avoid repeated probing

    if (this.isApiAvailable) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: this.modelName });
    } else {
      logger.warn("Gemini API key not configured - using mock AI responses");
    }
  }

  // --- model probe ---
  async ensureWorkingModel() {
    if (!this.isApiAvailable || this.tried) return;
    const candidates = [
      this.modelName,
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro-latest",
      "gemini-1.5-flash-8b",
      "gemini-pro" // legacy
    ];
    for (const name of candidates) {
      try {
        const m = this.genAI.getGenerativeModel({ model: name });
        const test = await m.generateContent({
          contents: [{ role: "user", parts: [{ text: "ping" }] }],
          generationConfig: { maxOutputTokens: 4, temperature: 0 }
        });
        if (test?.response?.text) {
          this.model = m;
          this.modelName = name;
          logger.info(`✅ Gemini model selected: ${name}`);
          break;
        }
      } catch (e) {
        const msg = String(e?.message || e);
        if (msg.includes("404")) {
          logger.warn(`Gemini model not available on this API: ${name}`);
        } else {
          logger.warn(`Gemini model probe failed for ${name}: ${msg}`);
        }
      }
    }
    this.tried = true;
    if (!this.model) {
      throw new Error("No compatible Gemini model found. Update @google/generative-ai or GEMINI_MODEL.");
    }
  }

  // --- utils ---
  truncateToWords(text, limit = 100) {
    if (!text) return text;
    const words = text.trim().split(/\s+/);
    if (words.length <= limit) return text.trim();
    return words.slice(0, limit).join(" ").trim();
  }

  async generateContent(prompt, generationConfig = {}) {
    await this.ensureWorkingModel();
    const cfg = {
      temperature: 0.7,
      maxOutputTokens: 1024,
      ...generationConfig,
    };
    const result = await this.model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: cfg
    });
    return result.response.text();
  }

  // --- public APIs ---
  async generateTravelSuggestions(weatherData, userPreferences = {}) {
    try {
      const { theme = "travel", location = {} } = userPreferences;

      if (!this.isApiAvailable) {
        logger.info("Using mock AI suggestions");
        return mockService.getMockSuggestions(theme, weatherData);
      }

      const system = this.getSystemPrompt(theme);
      const user = this.buildPrompt(weatherData, theme, location);
      const prompt = `${system}\n\n---\n${user}\n\n制約: 返答は必ず100語以内（英語換算の単語数上限）で、自然な日本語で。`;

      const raw = await this.generateContent(prompt, { temperature: 0.7 });
      const suggestion = this.truncateToWords(raw, 100);

      return {
        suggestion,
        theme,
        confidence: this.calculateConfidence(weatherData),
        weatherContext: {
          temperature: weatherData.current.temperature,
          description: weatherData.current.description,
          location: weatherData.location.name,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error("AI Service error:", error);
      logger.warn("Falling back to mock AI suggestions");
      return mockService.getMockSuggestions(userPreferences.theme || "travel", weatherData);
    }
  }

  async processVoiceInput(transcription, context = {}) {
    try {
      if (!this.isApiAvailable) {
        logger.info("Using mock voice processing");
        return mockService.processVoiceInput(transcription);
      }

      const prompt = `
以下の音声入力を分析して、ユーザーの意図を理解してください（日本語または中国語）:
音声入力: "${transcription}"

コンテキスト:
- 現在の天気: ${context.weather?.description || "不明"}
- 気温: ${context.weather?.temperature ?? "不明"}°C
- 場所: ${context.weather?.location || "不明"}

以下の形式で**厳密なJSON**のみを返してください（前後の説明文は禁止）:
{
  "intent": "weather_query|travel_suggestion|general_chat",
  "location": "抽出された場所名（あれば）",
  "timeframe": "今日|明日|今週|不明",
  "activity_type": "旅行|ファッション|スポーツ|音楽|農業|一般",
  "response": "入力と同じ言語で、100語以内の簡潔な返答"
}
`.trim();

      const raw = await this.generateContent(prompt, { temperature: 0.3 });
      try {
        const clipped = this.truncateToWords(raw, 120);
        const jsonStart = clipped.indexOf("{");
        const jsonEnd = clipped.lastIndexOf("}");
        const jsonText = jsonStart >= 0 && jsonEnd > jsonStart ? clipped.slice(jsonStart, jsonEnd + 1) : clipped;
        const result = JSON.parse(jsonText);
        if (typeof result.response === "string") {
          result.response = this.truncateToWords(result.response, 100);
        }
        return result;
      } catch {
        return {
          intent: "general_chat",
          location: null,
          timeframe: "不明",
          activity_type: "一般",
          response: this.truncateToWords(raw, 100),
        };
      }
    } catch (error) {
      logger.error("Voice processing error:", error);
      logger.warn("Falling back to mock voice processing");
      return mockService.processVoiceInput(transcription);
    }
  }

  async generateChatResponse(message, context = {}) {
    try {
      if (!this.isApiAvailable) {
        logger.info("Using mock chat response");
        return {
          response: mockService.getMockAiResponse(message, context),
          timestamp: new Date(),
        };
      }

      const systemPrompt = `あなたは親しみやすい多言語対応（日本語/中国語優先）の天気・生活アシスタントです。必ず100語以内で簡潔に回答してください。`;
      const ctx = context?.weather
        ? `- 天気: ${context.weather.description}\n- 気温: ${context.weather.temperature}°C\n- 場所: ${context.weather.location}\n`
        : "";
      const prefs = context?.preferences
        ? `- ユーザーテーマ: ${context.preferences.theme}\n- 希望地域: ${context.preferences.location?.city || "未設定"}\n`
        : "";

      const userPrompt = `
${systemPrompt}

ユーザーメッセージ:
${message}

現在のコンテキスト:
${ctx}${prefs}

制約:
- 100語以内（日本語で自然に）
- 実用的で親切
`.trim();

      const raw = await this.generateContent(userPrompt, { temperature: 0.7 });
      const clipped = this.truncateToWords(raw, 100);

      return {
        response: clipped,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error("Chat response generation error:", error);
      logger.warn("Falling back to mock chat response");
      return {
        response: mockService.getMockAiResponse(message, context),
        timestamp: new Date(),
      };
    }
  }

  // --- prompts & helpers ---
  getSystemPrompt(theme) {
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

  buildPrompt(weatherData, theme, location) {
    return `
現在の天気情報:
- 場所: ${weatherData.location.name}, ${weatherData.location.country}
- 気温: ${weatherData.current.temperature}°C (体感: ${weatherData.current.feelsLike}°C)
- 天気: ${weatherData.current.description}
- 湿度: ${weatherData.current.humidity}%
- 風速: ${weatherData.current.windSpeed}m/s
- 雲量: ${weatherData.current.cloudiness}%

ユーザー設定:
- テーマ: ${theme}
- 希望地域: ${location.city || "指定なし"}

この条件に基づき、${theme}について安全性と楽しさを両立した実用的な提案を日本語で。100語以内で簡潔に。
`.trim();
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
}

module.exports = new AIService();
