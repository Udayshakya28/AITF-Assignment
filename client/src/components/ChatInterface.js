import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const ChatInterface = ({ messages, onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-96 md:h-[500px]">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-white/60 py-8 font-noto"
            >
              <Bot className="w-12 h-12 mx-auto mb-4 text-white/40" />
              <p className="text-lg mb-2">こんにちは！</p>
              <p className="text-sm">
                天気について何でも聞いてください。<br />
                音声入力も利用できます。
              </p>
            </motion.div>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`flex ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/90 text-gray-800'
                  } shadow-lg backdrop-blur-sm`}
                >
                  <div className="flex items-start space-x-2">
                    <div className={`flex-shrink-0 ${
                      message.type === 'user' ? 'order-2' : 'order-1'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-5 h-5 mt-1" />
                      ) : (
                        <Bot className="w-5 h-5 mt-1 text-blue-600" />
                      )}
                    </div>
                    <div className={`flex-1 ${
                      message.type === 'user' ? 'order-1' : 'order-2'
                    }`}>
                      <p className="text-sm md:text-base font-noto leading-relaxed">
                        {typeof message.content === 'string' ? message.content : JSON.stringify(message.content)}
                      </p>
                      <div className={`flex items-center mt-2 text-xs ${
                        message.type === 'user' 
                          ? 'text-blue-100 justify-end' 
                          : 'text-gray-500'
                      }`}>
                        {message.isVoiceInput && (
                          <span className="mr-2">🎤</span>
                        )}
                        <span>{formatTime(message.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white/90 px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-blue-600" />
                <LoadingSpinner size="small" />
                <span className="text-gray-600 text-sm font-noto">
                  考えています...
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t border-white/20 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="メッセージを入力してください..."
              disabled={isLoading}
              className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm rounded-xl 
                       border border-white/30 focus:border-blue-400 focus:ring-2 
                       focus:ring-blue-400/20 focus:outline-none transition-all
                       text-gray-800 placeholder-gray-500 font-noto
                       disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <motion.button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400
                     text-white rounded-xl transition-colors duration-200
                     disabled:cursor-not-allowed disabled:hover:bg-gray-400
                     flex items-center justify-center min-w-[52px]"
          >
            {isLoading ? (
              <LoadingSpinner size="small" color="white" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;

