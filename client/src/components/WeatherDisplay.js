import React from 'react';
import { motion } from 'framer-motion';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye, 
  Sunrise, 
  Sunset,
  MapPin,
  Lightbulb
} from 'lucide-react';

const WeatherDisplay = ({ weatherData, suggestions }) => {
  if (!weatherData) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white">
        <p className="text-center font-noto">天気情報を読み込み中...</p>
      </div>
    );
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white space-y-6"
    >
      {/* Location and Main Weather */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <MapPin className="w-4 h-4" />
          <h3 className="text-lg font-semibold font-noto">
            {typeof weatherData.location === 'string' 
              ? weatherData.location 
              : weatherData.location?.name || '現在地'}
          </h3>
        </div>
        
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="text-4xl font-bold">
            {typeof weatherData.temperature === 'number' 
              ? weatherData.temperature 
              : weatherData.current?.temperature || 22}°C
          </div>
          {/* Weather icon would go here if available */}
        </div>
        
        <p className="text-white/80 font-noto text-lg">
          {weatherData.description || weatherData.current?.description || '晴れ'}
        </p>
        
        <p className="text-white/60 text-sm mt-2">
          体感温度: {weatherData.feelsLike || weatherData.current?.feelsLike || weatherData.temperature || weatherData.current?.temperature || 22}°C
        </p>
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Droplets className="w-4 h-4 text-blue-300" />
            <span className="text-sm font-noto">湿度</span>
          </div>
          <p className="text-lg font-semibold">
            {weatherData.humidity || weatherData.current?.humidity || 65}%
          </p>
        </div>

        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Wind className="w-4 h-4 text-gray-300" />
            <span className="text-sm font-noto">風速</span>
          </div>
          <p className="text-lg font-semibold">
            {weatherData.windSpeed || weatherData.current?.windSpeed || 3.5} m/s
          </p>
        </div>

        {(weatherData.visibility || weatherData.current?.visibility) && (
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Eye className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-noto">視界</span>
            </div>
            <p className="text-lg font-semibold">
              {Math.round((weatherData.visibility || weatherData.current?.visibility || 10000) / 1000)} km
            </p>
          </div>
        )}

        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Thermometer className="w-4 h-4 text-red-300" />
            <span className="text-sm font-noto">気圧</span>
          </div>
          <p className="text-lg font-semibold">
            {weatherData.pressure || weatherData.current?.pressure || 1013} hPa
          </p>
        </div>
      </div>

      {/* Sun Times */}
      {(weatherData.sunrise || weatherData.sun?.sunrise) && (weatherData.sunset || weatherData.sun?.sunset) && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Sunrise className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-noto">日の出</span>
            </div>
            <p className="text-lg font-semibold">
              {formatTime(weatherData.sunrise || weatherData.sun?.sunrise)}
            </p>
          </div>

          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Sunset className="w-4 h-4 text-orange-300" />
              <span className="text-sm font-noto">日の入</span>
            </div>
            <p className="text-lg font-semibold">
              {formatTime(weatherData.sunset || weatherData.sun?.sunset)}
            </p>
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      {suggestions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-white/20"
        >
          <div className="flex items-center space-x-2 mb-3">
            <Lightbulb className="w-5 h-5 text-yellow-300" />
            <h4 className="font-semibold font-noto">AI提案</h4>
          </div>
          
          <p className="text-sm font-noto leading-relaxed text-white/90">
            {suggestions.suggestion}
          </p>
          
          <div className="flex items-center justify-between mt-3 text-xs text-white/60">
            <span>テーマ: {suggestions.theme}</span>
            <span>信頼度: {Math.round(suggestions.confidence * 100)}%</span>
          </div>
        </motion.div>
      )}

      {/* Last Updated */}
      <div className="text-center text-white/50 text-xs font-noto">
        最終更新: {formatTime(weatherData.timestamp || weatherData.current?.timestamp || new Date())}
      </div>
    </motion.div>
  );
};

export default WeatherDisplay;

