import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Settings, User, Bell } from 'lucide-react';
import ChatInterface from './ChatInterface';
import WeatherDisplay from './WeatherDisplay';
import VoiceInput from './VoiceInput';
import ThemeSelector from './ThemeSelector';
import LocationSelector from './LocationSelector';
import LanguageSelector from './LanguageSelector';
import LoadingSpinner from './LoadingSpinner';
import UserProfile from './UserProfile';
import { useAuth } from '../contexts/AuthContext';
import { chatService } from '../services/chatService';
import { weatherService } from '../services/weatherService';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [preferences, setPreferences] = useState({
    theme: user?.preferences?.theme || 'travel',
    language: user?.preferences?.language || 'en',
    location: user?.preferences?.location || {
      city: 'Tokyo',
      country: 'JP'
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

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

  // Sync with user preferences
  useEffect(() => {
    if (user?.preferences) {
      setPreferences(prev => ({
        ...prev,
        ...user.preferences
      }));
    }
  }, [user]);

  const initializeSession = async () => {
    try {
      setIsLoading(true);
      const response = await chatService.createSession({
        userId: user?._id || 'anonymous',
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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!isInitialized && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="text-white mt-4 font-noto">初期化中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-md border-b border-white/20"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white font-noto">
                AI天気チャットボット
              </h1>
              <p className="text-white/70 font-noto">
                Welcome back, {user?.firstName || 'User'}!
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowProfile(true)}
                className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
              >
                <User className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="p-2 bg-red-500/20 rounded-lg text-white hover:bg-red-500/30 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
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

        {/* Main Layout: Side by Side Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* Left Side: Location & Preferences */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <LanguageSelector
                selectedLanguage={preferences.language}
                onLanguageChange={handleLanguageChange}
              />
              
              <LocationSelector
                location={preferences.location}
                onLocationChange={handleLocationChange}
              />
            </div>
            
            <ThemeSelector
              selectedTheme={preferences.theme}
              onThemeChange={handleThemeChange}
            />
          </motion.div>

          {/* Right Side: Weather Display */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {weatherData && (
              <WeatherDisplay
                weatherData={weatherData}
                suggestions={suggestions}
              />
            )}
          </motion.div>
        </div>

        {/* Bottom: Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="h-96 lg:h-[500px]">
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
              />
            </div>
            
            <div className="p-4 border-t border-white/20">
              <VoiceInput
                onVoiceInput={handleSendMessage}
                isEnabled={true}
                language={preferences.language}
              />
            </div>
          </div>
        </motion.div>

        {/* Stats Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{messages.length}</div>
            <div className="text-white/70 text-sm font-noto">Messages</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {messages.filter(m => m.isVoiceInput).length}
            </div>
            <div className="text-white/70 text-sm font-noto">Voice Inputs</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {weatherData?.location?.name || '-'}
            </div>
            <div className="text-white/70 text-sm font-noto">Current Location</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {preferences.theme}
            </div>
            <div className="text-white/70 text-sm font-noto">Current Theme</div>
          </div>
        </motion.div>
      </div>

      {/* User Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <UserProfile
            isOpen={showProfile}
            onClose={() => setShowProfile(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
