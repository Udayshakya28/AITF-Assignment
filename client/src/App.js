import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatInterface from './components/ChatInterface';
import WeatherDisplay from './components/WeatherDisplay';
import VoiceInput from './components/VoiceInput';
import ThemeSelector from './components/ThemeSelector';
import LocationSelector from './components/LocationSelector';
import LanguageSelector from './components/LanguageSelector';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import { chatService } from './services/chatService';
import { weatherService } from './services/weatherService';

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [preferences, setPreferences] = useState({
    theme: 'travel',
    language: 'zh', // Default to Chinese since user mentioned Chinese voice
    location: {
      city: '東京',
      country: 'JP'
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize chat session
  useEffect(() => {
    initializeSession();
  }, []);

  // Load weather data when location changes
  useEffect(() => {
    if (preferences.location?.city && isInitialized) {
      loadWeatherData();
    }
  }, [preferences.location, isInitialized]);

  const initializeSession = async () => {
    try {
      setIsLoading(true);
      const response = await chatService.createSession({
        userId: 'anonymous',
        preferences
      });
      setSessionId(response.data.sessionId);
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize session:', error);
      setError('セッションの初期化に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const loadWeatherData = async () => {
    try {
      const weather = await weatherService.getCurrentWeather(
        preferences.location.city,
        preferences.location.country
      );
      setWeatherData(weather.data);
    } catch (error) {
      console.error('Failed to load weather data:', error);
    }
  };

  const handleSendMessage = async (message, isVoiceInput = false) => {
    if (!sessionId || !message.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      // Add user message immediately for better UX
      const userMessage = {
        type: 'user',
        content: message,
        timestamp: new Date(),
        isVoiceInput
      };
      setMessages(prev => [...prev, userMessage]);

      // Send message to backend
      const response = await chatService.sendMessage({
        sessionId,
        message,
        isVoiceInput,
        language: preferences.language,
        location: preferences.location
      });

      // Add assistant response
      const assistantMessage = {
        type: 'assistant',
        content: response.data.assistantMessage.content,
        timestamp: new Date(response.data.assistantMessage.timestamp)
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Update weather data and suggestions if available
      if (response.data.weatherData) {
        setWeatherData(response.data.weatherData);
      }
      if (response.data.suggestions) {
        setSuggestions(response.data.suggestions);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('メッセージの送信に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferencesChange = async (newPreferences) => {
    try {
      setPreferences(prev => ({ ...prev, ...newPreferences }));
      
      if (sessionId) {
        await chatService.updatePreferences(sessionId, {
          ...preferences,
          ...newPreferences
        });
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
      setError('設定の更新に失敗しました');
    }
  };

  const handleLocationChange = (location) => {
    handlePreferencesChange({ location });
  };

  const handleThemeChange = (theme) => {
    handlePreferencesChange({ theme });
  };

  const handleLanguageChange = (language) => {
    handlePreferencesChange({ language });
  };

  const clearError = () => {
    setError(null);
  };

  if (!isInitialized && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 font-noto">
              AI天気チャットボット
            </h1>
            <p className="text-white/80 text-lg font-noto">
              音声入力対応の天気予報とAI提案サービス
            </p>
          </motion.header>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-6 bg-red-500/90 text-white p-4 rounded-lg backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-noto">{error}</span>
                  <button
                    onClick={clearError}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Controls */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <LanguageSelector
                selectedLanguage={preferences.language}
                onLanguageChange={handleLanguageChange}
              />

              <LocationSelector
                location={preferences.location}
                onLocationChange={handleLocationChange}
              />
              
              <ThemeSelector
                selectedTheme={preferences.theme}
                onThemeChange={handleThemeChange}
              />

              {weatherData && (
                <WeatherDisplay
                  weatherData={weatherData}
                  suggestions={suggestions}
                />
              )}
            </motion.div>

            {/* Center Column - Chat Interface */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
                <ChatInterface
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                />
                
                <div className="p-4 border-t border-white/20">
                  <VoiceInput
                    onVoiceInput={handleSendMessage}
                    isEnabled={true}
                    language={preferences.language}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12 text-white/60 font-noto"
          >
            <p>© 2024 AI Weather Chatbot. Made with ❤️ for AITF Assignment.</p>
          </motion.footer>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;

