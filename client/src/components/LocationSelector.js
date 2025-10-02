import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Navigation, X } from 'lucide-react';
import { weatherService } from '../services/weatherService';

const LocationSelector = ({ location, onLocationChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Major world cities organized by region
  const worldCities = [
    // Asia
    { city: 'Tokyo', country: 'JP', name: '東京 (Tokyo)', region: 'Asia' },
    { city: 'Osaka', country: 'JP', name: '大阪 (Osaka)', region: 'Asia' },
    { city: 'Kyoto', country: 'JP', name: '京都 (Kyoto)', region: 'Asia' },
    { city: 'Beijing', country: 'CN', name: '北京 (Beijing)', region: 'Asia' },
    { city: 'Shanghai', country: 'CN', name: '上海 (Shanghai)', region: 'Asia' },
    { city: 'Guangzhou', country: 'CN', name: '广州 (Guangzhou)', region: 'Asia' },
    { city: 'Shenzhen', country: 'CN', name: '深圳 (Shenzhen)', region: 'Asia' },
    { city: 'Hong Kong', country: 'HK', name: '香港 (Hong Kong)', region: 'Asia' },
    { city: 'Seoul', country: 'KR', name: '서울 (Seoul)', region: 'Asia' },
    { city: 'Busan', country: 'KR', name: '부산 (Busan)', region: 'Asia' },
    { city: 'Singapore', country: 'SG', name: 'Singapore', region: 'Asia' },
    { city: 'Bangkok', country: 'TH', name: 'Bangkok', region: 'Asia' },
    { city: 'Manila', country: 'PH', name: 'Manila', region: 'Asia' },
    { city: 'Jakarta', country: 'ID', name: 'Jakarta', region: 'Asia' },
    { city: 'Kuala Lumpur', country: 'MY', name: 'Kuala Lumpur', region: 'Asia' },
    { city: 'Mumbai', country: 'IN', name: 'Mumbai', region: 'Asia' },
    { city: 'Delhi', country: 'IN', name: 'Delhi', region: 'Asia' },
    { city: 'Bangalore', country: 'IN', name: 'Bangalore', region: 'Asia' },
    
    // Europe
    { city: 'London', country: 'GB', name: 'London', region: 'Europe' },
    { city: 'Paris', country: 'FR', name: 'Paris', region: 'Europe' },
    { city: 'Berlin', country: 'DE', name: 'Berlin', region: 'Europe' },
    { city: 'Madrid', country: 'ES', name: 'Madrid', region: 'Europe' },
    { city: 'Rome', country: 'IT', name: 'Rome', region: 'Europe' },
    { city: 'Amsterdam', country: 'NL', name: 'Amsterdam', region: 'Europe' },
    { city: 'Vienna', country: 'AT', name: 'Vienna', region: 'Europe' },
    { city: 'Stockholm', country: 'SE', name: 'Stockholm', region: 'Europe' },
    { city: 'Copenhagen', country: 'DK', name: 'Copenhagen', region: 'Europe' },
    { city: 'Zurich', country: 'CH', name: 'Zurich', region: 'Europe' },
    { city: 'Prague', country: 'CZ', name: 'Prague', region: 'Europe' },
    { city: 'Warsaw', country: 'PL', name: 'Warsaw', region: 'Europe' },
    { city: 'Moscow', country: 'RU', name: 'Moscow', region: 'Europe' },
    { city: 'Istanbul', country: 'TR', name: 'Istanbul', region: 'Europe' },
    
    // North America
    { city: 'New York', country: 'US', name: 'New York', region: 'North America' },
    { city: 'Los Angeles', country: 'US', name: 'Los Angeles', region: 'North America' },
    { city: 'Chicago', country: 'US', name: 'Chicago', region: 'North America' },
    { city: 'San Francisco', country: 'US', name: 'San Francisco', region: 'North America' },
    { city: 'Miami', country: 'US', name: 'Miami', region: 'North America' },
    { city: 'Seattle', country: 'US', name: 'Seattle', region: 'North America' },
    { city: 'Toronto', country: 'CA', name: 'Toronto', region: 'North America' },
    { city: 'Vancouver', country: 'CA', name: 'Vancouver', region: 'North America' },
    { city: 'Mexico City', country: 'MX', name: 'Mexico City', region: 'North America' },
    
    // South America
    { city: 'São Paulo', country: 'BR', name: 'São Paulo', region: 'South America' },
    { city: 'Rio de Janeiro', country: 'BR', name: 'Rio de Janeiro', region: 'South America' },
    { city: 'Buenos Aires', country: 'AR', name: 'Buenos Aires', region: 'South America' },
    { city: 'Lima', country: 'PE', name: 'Lima', region: 'South America' },
    { city: 'Bogotá', country: 'CO', name: 'Bogotá', region: 'South America' },
    { city: 'Santiago', country: 'CL', name: 'Santiago', region: 'South America' },
    
    // Africa
    { city: 'Cairo', country: 'EG', name: 'Cairo', region: 'Africa' },
    { city: 'Lagos', country: 'NG', name: 'Lagos', region: 'Africa' },
    { city: 'Johannesburg', country: 'ZA', name: 'Johannesburg', region: 'Africa' },
    { city: 'Cape Town', country: 'ZA', name: 'Cape Town', region: 'Africa' },
    { city: 'Casablanca', country: 'MA', name: 'Casablanca', region: 'Africa' },
    { city: 'Nairobi', country: 'KE', name: 'Nairobi', region: 'Africa' },
    
    // Oceania
    { city: 'Sydney', country: 'AU', name: 'Sydney', region: 'Oceania' },
    { city: 'Melbourne', country: 'AU', name: 'Melbourne', region: 'Oceania' },
    { city: 'Brisbane', country: 'AU', name: 'Brisbane', region: 'Oceania' },
    { city: 'Auckland', country: 'NZ', name: 'Auckland', region: 'Oceania' },
    
    // Middle East
    { city: 'Dubai', country: 'AE', name: 'Dubai', region: 'Middle East' },
    { city: 'Riyadh', country: 'SA', name: 'Riyadh', region: 'Middle East' },
    { city: 'Tel Aviv', country: 'IL', name: 'Tel Aviv', region: 'Middle East' },
    { city: 'Doha', country: 'QA', name: 'Doha', region: 'Middle East' }
  ];

  useEffect(() => {
    if (searchQuery.length > 1) {
      const timeoutId = setTimeout(() => {
        searchCities(searchQuery);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchCities = async (query) => {
    try {
      setIsSearching(true);
      // Filter world cities based on search query
      const filtered = worldCities.filter(city =>
        city.name.toLowerCase().includes(query.toLowerCase()) ||
        city.city.toLowerCase().includes(query.toLowerCase()) ||
        city.country.toLowerCase().includes(query.toLowerCase()) ||
        city.region.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 20)); // Limit to 20 results
    } catch (error) {
      console.error('City search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSelect = (selectedLocation) => {
    onLocationChange(selectedLocation);
    setIsOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const getCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);
      const coords = await weatherService.getCurrentLocation();
      
      // Get weather data to determine city name
      const weatherData = await weatherService.getCurrentWeatherByCoordinates(
        coords.lat, 
        coords.lon
      );
      
      const locationData = {
        city: weatherData.data.location.name,
        country: weatherData.data.location.country,
        coordinates: coords
      };
      
      handleLocationSelect(locationData);
    } catch (error) {
      console.error('Get current location error:', error);
      alert(error.message);
    } finally {
      setIsGettingLocation(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
      <h3 className="text-white font-semibold text-lg mb-4 font-noto">
        場所設定
      </h3>
      
      {/* Current Location Display */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 text-white/90">
          <MapPin className="w-4 h-4" />
          <span className="font-noto">
            {location?.city || '場所未設定'}
            {location?.country && ` (${location.country})`}
          </span>
        </div>
      </div>

      {/* Location Controls */}
      <div className="space-y-3">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center space-x-2 bg-blue-500 
                   hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors
                   font-noto"
        >
          <Search className="w-4 h-4" />
          <span>場所を変更</span>
        </motion.button>

        <motion.button
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center space-x-2 bg-green-500 
                   hover:bg-green-600 disabled:bg-gray-500 text-white py-3 px-4 
                   rounded-lg transition-colors font-noto"
        >
          <Navigation className={`w-4 h-4 ${isGettingLocation ? 'animate-spin' : ''}`} />
          <span>
            {isGettingLocation ? '取得中...' : '現在地を使用'}
          </span>
        </motion.button>
      </div>

      {/* Location Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 font-noto">
                  場所を選択
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Input */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 
                               text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="都市名を入力..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           outline-none transition-all font-noto"
                />
              </div>

              {/* Search Results */}
              <div className="space-y-2">
                {searchQuery.length > 1 ? (
                  isSearching ? (
                    <div className="text-center py-4 text-gray-500 font-noto">
                      検索中...
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((city, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleLocationSelect(city)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full text-left p-3 rounded-lg hover:bg-gray-100
                                 transition-colors border border-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <div>
                              <span className="font-noto text-gray-800 block">
                                {city.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {city.region}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs text-gray-400 font-mono">
                            {city.country}
                          </span>
                        </div>
                      </motion.button>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 font-noto">
                      検索結果がありません
                    </div>
                  )
                ) : (
                  <>
                    <h4 className="text-sm font-semibold text-gray-600 mb-3 font-noto">
                      世界の主要都市 / 世界主要城市 / Major World Cities
                    </h4>
                    <div className="max-h-96 overflow-y-auto space-y-3">
                      {['Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania', 'Middle East'].map(region => {
                        const regionCities = worldCities.filter(city => city.region === region);
                        return (
                          <div key={region} className="space-y-2">
                            <h5 className="text-xs font-semibold text-gray-500 border-b border-gray-200 pb-1">
                              {region}
                            </h5>
                            <div className="grid grid-cols-1 gap-1">
                              {regionCities.slice(0, 6).map((city, index) => (
                                <motion.button
                                  key={`${region}-${index}`}
                                  onClick={() => handleLocationSelect(city)}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="w-full text-left p-2 rounded-lg hover:bg-gray-100
                                           transition-colors border border-gray-100"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <MapPin className="w-3 h-3 text-gray-400" />
                                      <span className="font-noto text-gray-800 text-sm">
                                        {city.name}
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-400 font-mono">
                                      {city.country}
                                    </span>
                                  </div>
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LocationSelector;

