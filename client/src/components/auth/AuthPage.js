import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const switchToRegister = () => setIsLogin(false);
  const switchToLogin = () => setIsLogin(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 font-noto">
            AI天気チャットボット
          </h1>
          <p className="text-white/80 text-lg md:text-xl font-noto">
            音声入力対応の天気予報とAI提案サービス
          </p>
        </motion.div>

        {/* Auth Forms */}
        <div className="flex justify-center">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <LoginForm onSwitchToRegister={switchToRegister} />
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <RegisterForm onSwitchToLogin={switchToLogin} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">🎤</div>
            <h3 className="text-white font-semibold mb-2 font-noto">音声入力</h3>
            <p className="text-white/70 text-sm font-noto">
              日本語・中国語での音声認識
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">🌤️</div>
            <h3 className="text-white font-semibold mb-2 font-noto">天気予報</h3>
            <p className="text-white/70 text-sm font-noto">
              世界70+都市のリアルタイム天気
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-white font-semibold mb-2 font-noto">AI提案</h3>
            <p className="text-white/70 text-sm font-noto">
              天気に基づく活動提案
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-12 text-white/60 font-noto"
        >
          <p>© 2025 AI Weather Chatbot. Built for AITF Assignment.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
