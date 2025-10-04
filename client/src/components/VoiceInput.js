// src/components/VoiceInput.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2 } from "lucide-react";

const LANGUAGE_MAP = { ja: "ja-JP", en: "en-US", zh: "zh-CN", "zh-CN": "zh-CN", "zh-TW": "zh-TW" };

const VoiceInput = ({
  onVoiceInput,                // (text, true) -> set search bar + run search
  isEnabled = true,
  language = "auto",           // "auto" | "ja" | "en"
  silenceTimeoutMs = 2000,     // commit after 2s of silence
  maxDurationMs = 60000,       // hard stop after 60s just in case
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [bubble, setBubble] = useState(""); // visual only
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const startingRef = useRef(false);
  const silenceTimerRef = useRef(null);
  const hardStopTimerRef = useRef(null);
  const langTriedRef = useRef([]);
  const userWantsListeningRef = useRef(false);

  // Build recognition
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setIsSupported(false);
      setError("お使いのブラウザは音声認識をサポートしていません");
      return;
    }
    setIsSupported(true);

    const rec = new SR();
    rec.continuous = true;         
    rec.interimResults = true; 
    rec.maxAlternatives = 1;
    rec.lang = language === "auto" ? LANGUAGE_MAP.ja : (LANGUAGE_MAP[language] || LANGUAGE_MAP.ja);

    rec.onstart = () => {
      setError(null);
      setIsListening(true);
      setBubble("");
      startingRef.current = false;

      if (hardStopTimerRef.current) clearTimeout(hardStopTimerRef.current);
      hardStopTimerRef.current = setTimeout(() => {
        // Hard stop if something goes wrong
        commitAndStop();
      }, maxDurationMs);
      kickSilenceTimer(); // start silence window
    };

    rec.onresult = (e) => {
      let finalChunk = "";
      let interimChunk = "";

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const text = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalChunk += text;
        else interimChunk += text;
      }

      // Update bubble for UX (but DO NOT emit).
      const preview = (finalChunk || interimChunk || "").trim();
      if (preview) setBubble(preview);

      // Reset silence timer on any speech activity
      kickSilenceTimer();
    };

    rec.onerror = (e) => {
      // Auto-fallback to the other language in "auto" mode for early end errors
      if (
        language === "auto" &&
        (e.error === "no-speech" || e.error === "aborted" || e.error === "network")
      ) {
        attemptAutoFallback();
        return;
      }

      let msg = "音声認識でエラーが発生しました";
      if (e.error === "no-speech") msg = "音声が検出されませんでした";
      else if (e.error === "audio-capture") msg = "マイクにアクセスできません";
      else if (e.error === "not-allowed") msg = "マイクの使用が許可されていません";
      else if (e.error === "network") msg = "ネットワークエラーが発生しました";
      else if (e.error === "aborted") msg = "認識が中断されました";

      setError(msg);
      setTimeout(() => setError(null), 2500);
      cleanupTimers();
      setIsListening(false);
      startingRef.current = false;
      userWantsListeningRef.current = false;
    };

    rec.onend = () => {
      setIsListening(false);
      startingRef.current = false;
      if (userWantsListeningRef.current) {
        tryRestart();
      } else {
        cleanupTimers();
      }
    };

    recognitionRef.current = rec;

    return () => {
      try {
        rec.onresult = rec.onstart = rec.onend = rec.onerror = null;
        rec.abort();
        rec.stop();
      } catch {}
      cleanupTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, maxDurationMs, silenceTimeoutMs]);

  const cleanupTimers = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (hardStopTimerRef.current) clearTimeout(hardStopTimerRef.current);
  };

  const kickSilenceTimer = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      // 2s of silence -> commit and stop
      commitAndStop();
    }, silenceTimeoutMs);
  };

  const ensureHttpsOrLocalhost = () => {
    const { protocol, hostname } = window.location;
    if (protocol === "https:" || hostname === "localhost") return true;
    setError("Voice input needs HTTPS or localhost.");
    setTimeout(() => setError(null), 3000);
    return false;
  };

  const warmupMic = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch {
      setError("マイクの権限が必要です");
      setTimeout(() => setError(null), 3000);
      return false;
    }
  }, []);

  const setRecLang = (bcp47) => {
    if (recognitionRef.current) recognitionRef.current.lang = bcp47;
  };

  const safeStart = useCallback(async () => {
    if (!isSupported || !isEnabled || isListening || startingRef.current) return;
    if (!ensureHttpsOrLocalhost()) return;

    startingRef.current = true;
    userWantsListeningRef.current = true;

    const ok = await warmupMic();
    if (!ok) {
      startingRef.current = false;
      userWantsListeningRef.current = false;
      return;
    }

    // Language selection for this attempt
    if (language === "auto") {
      const tried = langTriedRef.current;
      const next = tried.includes("ja-JP") ? "en-US" : "ja-JP";
      setRecLang(next);
    } else {
      setRecLang(LANGUAGE_MAP[language] || "ja-JP");
    }

    try {
      recognitionRef.current?.start();
    } catch {
      startingRef.current = false;
      userWantsListeningRef.current = false;
      setError("音声認識の開始に失敗しました（既に実行中の可能性）");
      setTimeout(() => setError(null), 2500);
    }
  }, [isEnabled, isListening, isSupported, language, warmupMic]);

  const safeStop = useCallback(() => {
    userWantsListeningRef.current = false;
    try {
      recognitionRef.current?.stop();
      recognitionRef.current?.abort();
    } catch {}
    cleanupTimers();
  }, []);

  const tryRestart = () => {
    setTimeout(() => {
      if (!userWantsListeningRef.current) return;
      try {
        recognitionRef.current?.start();
      } catch {}
    }, 150);
  };

  const attemptAutoFallback = () => {
    if (language !== "auto") return;
    const tried = langTriedRef.current;
    const current = recognitionRef.current?.lang;
    if (!current) return;

    if (!tried.includes(current)) tried.push(current);
    if (tried.length === 1) {
      const other = current === "ja-JP" ? "en-US" : "ja-JP";
      setRecLang(other);
      tryRestart();
      return;
    }
    // tried both
    setError("音声が検出されませんでした（自動言語判定）");
    setTimeout(() => setError(null), 2500);
    userWantsListeningRef.current = false;
    cleanupTimers();
  };

  // Commit the last seen bubble and stop listening
  const commitAndStop = () => {
    const text = (bubble || "").trim();
    if (text) {
      // Single, final commit to the parent
      onVoiceInput?.(text, false);
    }
    setBubble("");
    safeStop();
  };

  // Stop when tab hidden
  useEffect(() => {
    const onVis = () => {
      if (document.hidden && isListening) commitAndStop();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [isListening]); // commitAndStop is stable via refs/closures

  const toggleListening = () => (isListening ? commitAndStop() : safeStart());

  // TTS helper (optional)
  const speakText = (text) => {
    if (!("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const langCode = language === "auto" ? "ja-JP" : (LANGUAGE_MAP[language] || "ja-JP");
    utterance.lang = langCode;
    utterance.rate = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
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
            isListening ? "bg-red-500 hover:bg-red-600 recording-pulse" : "bg-blue-500 hover:bg-blue-600"
          } ${!isEnabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} text-white shadow-lg`}
        >
          {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
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
          onClick={() =>
            speakText(language === "en" ? "Hello! How can I help you?" : "こんにちは。何かお手伝いできることはありますか？")
          }
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-full transition-colors duration-200 shadow-lg"
          title="音声で挨拶"
        >
          <Volume2 className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Status Bubble (visual only; NOT committed until silence) */}
      <AnimatePresence>
        {(isListening || bubble || error) && (
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
                  <p className="text-sm font-noto">{bubble || "聞いています..."}</p>
                </div>
              </div>
            ) : bubble ? (
              <div className="bg-green-500/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                <p className="text-sm font-noto">{bubble}</p>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {!isListening && !error && (
        <div className="text-center text-white/60 font-noto">
          <p className="text-sm">🎤 話し終えて2秒静かになると検索に送信されます</p>
          <p className="text-xs mt-1">
            {language === "en" ? "English supported" : language === "auto" ? "日本語／英語 自動" : "日本語対応"}
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;