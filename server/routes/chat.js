const express = require('express');
const router = express.Router();
const sessionService = require('../services/sessionService');
const aiService = require('../services/aiService');
const weatherService = require('../services/weatherService');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

// Create new chat session
router.post('/session', async (req, res) => {
  try {
    const { userId = 'anonymous', preferences = {} } = req.body;
    const sessionId = uuidv4();

    const sessionData = {
      sessionId,
      userId,
      preferences,
      messages: [],
      aiSuggestions: []
    };

    const chat = await sessionService.createSession(sessionData);

    res.json({
      success: true,
      data: {
        sessionId,
        chat: {
          sessionId: chat.sessionId,
          preferences: chat.preferences,
          createdAt: chat.createdAt
        }
      }
    });
  } catch (error) {
    logger.error('Create chat session error:', error);
    res.status(500).json({
      success: false,
      error: 'チャットセッションの作成に失敗しました'
    });
  }
});

// Send message to chat
router.post('/message', async (req, res) => {
  try {
    const { 
      sessionId, 
      message, 
      isVoiceInput = false, 
      language = 'ja',
      location = null 
    } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        error: 'セッションIDとメッセージが必要です'
      });
    }

    // Find chat session
    const chat = await sessionService.getSession(sessionId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'チャットセッションが見つかりません'
      });
    }

    // Add user message
    const userMessage = {
      type: 'user',
      content: message,
      language,
      isVoiceInput,
      timestamp: new Date()
    };
    await sessionService.addMessage(sessionId, userMessage);

    // Get weather data if location is provided or available in preferences
    let weatherData = null;
    const targetLocation = location || chat.preferences.location;
    
    if (targetLocation && targetLocation.city) {
      try {
        weatherData = await weatherService.getCurrentWeather(
          targetLocation.city,
          targetLocation.country
        );
        const weatherUpdate = {
          weatherData: {
            location: weatherData.location.name,
            temperature: weatherData.current.temperature,
            description: weatherData.current.description,
            humidity: weatherData.current.humidity,
            windSpeed: weatherData.current.windSpeed,
            timestamp: new Date()
          }
        };
        await sessionService.updateSession(sessionId, weatherUpdate);
      } catch (weatherError) {
        logger.warn('Weather data fetch failed:', weatherError);
      }
    }

    // Generate AI response
    const context = {
      weather: weatherData?.current ? {
        description: weatherData.current.description,
        temperature: weatherData.current.temperature,
        location: weatherData.location.name
      } : null,
      preferences: chat.preferences
    };

    let aiResponse;
    if (isVoiceInput) {
      // Process voice input with special handling
      const voiceResult = await aiService.processVoiceInput(message, context);
      aiResponse = voiceResult.response;
      
      // Update user stats for voice input
      if (chat.userId !== 'anonymous') {
        await User.findOneAndUpdate(
          { userId: chat.userId },
          { $inc: { 'stats.totalVoiceInputs': 1 } }
        );
      }
    } else {
      // Generate regular chat response
      const chatResult = await aiService.generateChatResponse(message, context);
      aiResponse = chatResult.response;
    }

    // Add AI response message
    const assistantMessage = {
      type: 'assistant',
      content: aiResponse,
      language: language,
      timestamp: new Date()
    };
    await sessionService.addMessage(sessionId, assistantMessage);

    // Generate AI suggestions if weather data is available
    let latestSuggestion = null;
    if (weatherData) {
      try {
        const suggestions = await aiService.generateTravelSuggestions(
          weatherData,
          chat.preferences
        );
        await sessionService.addSuggestion(sessionId, suggestions);
        latestSuggestion = suggestions;
      } catch (suggestionError) {
        logger.warn('AI suggestions generation failed:', suggestionError);
      }
    }

    // Get updated session
    const updatedChat = await sessionService.getSession(sessionId);

    res.json({
      success: true,
      data: {
        userMessage,
        assistantMessage,
        weatherData: updatedChat.weatherData,
        suggestions: latestSuggestion || (updatedChat.aiSuggestions && updatedChat.aiSuggestions.slice(-1)[0]) || null
      }
    });
  } catch (error) {
    logger.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'メッセージの送信に失敗しました'
    });
  }
});

// Get chat history
router.get('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const chat = await sessionService.getSession(sessionId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'チャットセッションが見つかりません'
      });
    }

    const messages = chat.messages
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      success: true,
      data: {
        sessionId: chat.sessionId,
        messages,
        weatherData: chat.weatherData,
        suggestions: chat.aiSuggestions,
        preferences: chat.preferences,
        totalMessages: chat.messages.length
      }
    });
  } catch (error) {
    logger.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      error: 'チャット履歴の取得に失敗しました'
    });
  }
});

// Update chat preferences
router.put('/preferences/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { preferences } = req.body;

    const chat = await Chat.findOneAndUpdate(
      { sessionId },
      { 
        preferences: { ...preferences },
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'チャットセッションが見つかりません'
      });
    }

    res.json({
      success: true,
      data: {
        sessionId: chat.sessionId,
        preferences: chat.preferences
      }
    });
  } catch (error) {
    logger.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      error: '設定の更新に失敗しました'
    });
  }
});

// Get user's chat sessions
router.get('/sessions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const chats = await Chat.find({ userId })
      .select('sessionId preferences createdAt updatedAt messages')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const sessions = chats.map(chat => ({
      sessionId: chat.sessionId,
      preferences: chat.preferences,
      messageCount: chat.messages.length,
      lastMessage: chat.messages.length > 0 ? 
        chat.messages[chat.messages.length - 1] : null,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt
    }));

    res.json({
      success: true,
      data: {
        sessions,
        total: await Chat.countDocuments({ userId })
      }
    });
  } catch (error) {
    logger.error('Get user sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'セッション一覧の取得に失敗しました'
    });
  }
});

module.exports = router;

