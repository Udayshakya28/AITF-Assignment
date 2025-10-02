import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2 } from 'lucide-react';

const VoiceInput = ({ onVoiceInput, isEnabled = true, language = 'ja' }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Check if Web Speech API is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      // Initialize speech recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      // Support multiple languages including Chinese
      const languageMap = {
        'ja': 'ja-JP',
        'zh': 'zh-CN',
        'zh-CN': 'zh-CN',
        'zh-TW': 'zh-TW',
        'en': 'en-US'
      };
      recognition.lang = languageMap[language] || 'ja-JP';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        setTranscript('');
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        if (finalTranscript) {
          // Clear timeout if we got a final result
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          // Send the final transcript
          onVoiceInput(finalTranscript.trim(), true);
          setTranscript('');
          setIsListening(false);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        let errorMessage = '音声認識でエラーが発生しました';
        switch (event.error) {
          case 'no-speech':
            errorMessage = '音声が検出されませんでした';
            break;
          case 'audio-capture':
            errorMessage = 'マイクにアクセスできません';
            break;
          case 'not-allowed':
            errorMessage = 'マイクの使用が許可されていません';
            break;
          case 'network':
            errorMessage = 'ネットワークエラーが発生しました';
            break;
          case 'language-not-supported':
            errorMessage = '選択された言語はサポートされていません';
            break;
        }
        
        setError(errorMessage);
        
        // Clear error after 3 seconds
        setTimeout(() => setError(null), 3000);
      };

      recognition.onend = () => {
        setIsListening(false);
        
        // If we have a transcript but recognition ended without final result
        if (transcript && !transcript.trim()) {
          setTranscript('');
        }
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      setError('お使いのブラウザは音声認識をサポートしていません');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [language, onVoiceInput, transcript]);

  const startListening = () => {
    if (!isSupported || !isEnabled || isListening) return;

    try {
      recognitionRef.current.start();
      
      // Set a timeout to stop listening after 10 seconds
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current && isListening) {
          recognitionRef.current.stop();
        }
      }, 10000);
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setError('音声認識の開始に失敗しました');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Text-to-speech for reading responses (bonus feature)
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const languageMap = {
        'ja': 'ja-JP',
        'zh': 'zh-CN',
        'zh-CN': 'zh-CN',
        'zh-TW': 'zh-TW',
        'en': 'en-US'
      };
      utterance.lang = languageMap[language] || 'ja-JP';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!isSupported) {
    return (
      <div className="text-center text-white/60 font-noto">
        <p className="text-sm">音声入力はサポートされていません</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Voice Input Button */}
      <div className="flex items-center space-x-4">
        <motion.button
          onClick={toggleListening}
          disabled={!isEnabled}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative p-4 rounded-full transition-all duration-300 ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 recording-pulse'
              : 'bg-blue-500 hover:bg-blue-600'
          } ${
            !isEnabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          } text-white shadow-lg`}
        >
          {isListening ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
          
          {/* Recording indicator */}
          {isListening && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full"
            />
          )}
        </motion.button>

        {/* Text-to-speech button */}
        <motion.button
          onClick={() => speakText('こんにちは。何かお手伝いできることはありますか？')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-full
                   transition-colors duration-200 shadow-lg"
          title="音声で挨拶"
        >
          <Volume2 className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Status and Transcript Display */}
      <AnimatePresence>
        {(isListening || transcript || error) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center max-w-md"
          >
            {error ? (
              <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                <p className="text-sm font-noto">{error}</p>
              </div>
            ) : isListening ? (
              <div className="bg-blue-500/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                <div className="flex items-center justify-center space-x-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-2 h-2 bg-white rounded-full"
                  />
                  <p className="text-sm font-noto">
                    {transcript || '聞いています...'}
                  </p>
                </div>
              </div>
            ) : transcript ? (
              <div className="bg-green-500/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                <p className="text-sm font-noto">{transcript}</p>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      {!isListening && !error && (
        <div className="text-center text-white/60 font-noto">
          <p className="text-sm">
            🎤 {language === 'zh' || language === 'zh-CN' ? 
              '点击麦克风按钮开始语音输入' : 
              'マイクボタンを押して音声入力を開始'}
          </p>
          <p className="text-xs mt-1">
            {language === 'zh' || language === 'zh-CN' ? 
              '支持中文语音输入' : 
              '日本語での音声入力に対応しています'}
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;

