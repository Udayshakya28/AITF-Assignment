import React from 'react';
import { motion } from 'framer-motion';
import { 
  Plane, 
  Shirt, 
  Dumbbell, 
  Music, 
  Wheat, 
  MessageCircle 
} from 'lucide-react';

const ThemeSelector = ({ selectedTheme, onThemeChange }) => {
  const themes = [
    {
      id: 'travel',
      name: '旅行',
      icon: Plane,
      description: '観光・外出の提案',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'fashion',
      name: 'ファッション',
      icon: Shirt,
      description: '服装・コーディネート',
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'sports',
      name: 'スポーツ',
      icon: Dumbbell,
      description: '運動・アクティビティ',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'music',
      name: '音楽',
      icon: Music,
      description: '音楽・エンターテイメント',
      color: 'from-purple-500 to-violet-500'
    },
    {
      id: 'agriculture',
      name: '農業',
      icon: Wheat,
      description: '農作業・園芸',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'general',
      name: '一般',
      icon: MessageCircle,
      description: '日常生活全般',
      color: 'from-gray-500 to-slate-500'
    }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
      <h3 className="text-white font-semibold text-lg mb-4 font-noto">
        テーマ選択
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {themes.map((theme) => {
          const IconComponent = theme.icon;
          const isSelected = selectedTheme === theme.id;
          
          return (
            <motion.button
              key={theme.id}
              onClick={() => onThemeChange(theme.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative p-4 rounded-xl transition-all duration-300 ${
                isSelected
                  ? 'bg-white/20 ring-2 ring-white/50'
                  : 'bg-white/10 hover:bg-white/15'
              }`}
            >
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${theme.color} opacity-20`} />
              
              <div className="relative z-10 text-center">
                <div className="flex justify-center mb-2">
                  <IconComponent className={`w-6 h-6 ${
                    isSelected ? 'text-white' : 'text-white/70'
                  }`} />
                </div>
                
                <h4 className={`font-semibold text-sm font-noto mb-1 ${
                  isSelected ? 'text-white' : 'text-white/80'
                }`}>
                  {theme.name}
                </h4>
                
                <p className={`text-xs ${
                  isSelected ? 'text-white/90' : 'text-white/60'
                } font-noto`}>
                  {theme.description}
                </p>
              </div>
              
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </div>
      
      <div className="mt-4 text-center text-white/60 text-sm font-noto">
        選択したテーマに基づいてAIが提案を生成します
      </div>
    </div>
  );
};

export default ThemeSelector;

