import React from 'react';
import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';

const LanguageSelector = ({ selectedLanguage, onLanguageChange }) => {
  const languages = [
    
    {
      code: 'ja',
      name: '日本語',
      flag: '🇯🇵'
    },
    {
      code: 'en',
      name: 'English',
      flag: '🇺🇸'
    }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Languages className="w-4 h-4 text-white" />
        <h3 className="text-white font-semibold text-sm font-noto">
          言语选择 / 言語選択 / Language
        </h3>
      </div>
      
      <div className="flex space-x-2">
        {languages.map((language) => {
          const isSelected = selectedLanguage === language.code;
          
          return (
            <motion.button
              key={language.code}
              onClick={() => onLanguageChange(language.code)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                isSelected
                  ? 'bg-white/20 ring-2 ring-white/50'
                  : 'bg-white/10 hover:bg-white/15'
              }`}
            >
              <span className="text-lg">{language.flag}</span>
              <span className={`text-sm font-noto ${
                isSelected ? 'text-white' : 'text-white/80'
              }`}>
                {language.name}
              </span>
              
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 bg-white rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default LanguageSelector;
