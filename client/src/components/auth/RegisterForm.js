import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, UserPlus, Globe, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../LoadingSpinner';

const RegisterForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    preferences: {
      language: 'en',
      theme: 'travel',
      location: {
        city: '',
        country: ''
      }
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const { register, error, clearError } = useAuth();

  const themes = [
    { id: 'travel', name: '旅行 / Travel', icon: '✈️' },
    { id: 'fashion', name: 'ファッション / Fashion', icon: '👗' },
    { id: 'sports', name: 'スポーツ / Sports', icon: '⚽' },
    { id: 'music', name: '音楽 / Music', icon: '🎵' },
    { id: 'agriculture', name: '農業 / Agriculture', icon: '🌱' },
    { id: 'general', name: '一般 / General', icon: '💬' }
  ];

  const languages = [
    { id: 'en', name: 'English', flag: '🇺🇸' },
    { id: 'zh', name: '中文', flag: '🇨🇳' },
    { id: 'ja', name: '日本語', flag: '🇯🇵' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (name.includes('location.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          location: {
            ...prev.preferences.location,
            [field]: value
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    clearError();
    setValidationErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        preferences: formData.preferences
      };
      
      await register(userData);
    } catch (error) {
      // Error is handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <UserPlus className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2 font-noto">
            新規登録 / 注册 / Register
          </h2>
          <p className="text-white/70 font-noto">
            AIチャットボットアカウントを作成
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-100 text-sm font-noto"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2 font-noto">
                名 / First Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-white/50" />
                </div>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg
                           text-white placeholder-white/50 focus:border-blue-400 focus:ring-2
                           focus:ring-blue-400/20 focus:outline-none transition-all font-noto"
                  placeholder="John"
                />
              </div>
              {validationErrors.firstName && (
                <p className="mt-1 text-red-400 text-xs">{validationErrors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2 font-noto">
                姓 / Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg
                         text-white placeholder-white/50 focus:border-blue-400 focus:ring-2
                         focus:ring-blue-400/20 focus:outline-none transition-all font-noto"
                placeholder="Doe"
              />
              {validationErrors.lastName && (
                <p className="mt-1 text-red-400 text-xs">{validationErrors.lastName}</p>
              )}
            </div>
          </div>

          {/* Username and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2 font-noto">
                ユーザー名 / Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg
                         text-white placeholder-white/50 focus:border-blue-400 focus:ring-2
                         focus:ring-blue-400/20 focus:outline-none transition-all font-noto"
                placeholder="johndoe"
              />
              {validationErrors.username && (
                <p className="mt-1 text-red-400 text-xs">{validationErrors.username}</p>
              )}
            </div>

            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2 font-noto">
                メール / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-white/50" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg
                           text-white placeholder-white/50 focus:border-blue-400 focus:ring-2
                           focus:ring-blue-400/20 focus:outline-none transition-all font-noto"
                  placeholder="john@example.com"
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-red-400 text-xs">{validationErrors.email}</p>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2 font-noto">
                パスワード / Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-white/50" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/30 rounded-lg
                           text-white placeholder-white/50 focus:border-blue-400 focus:ring-2
                           focus:ring-blue-400/20 focus:outline-none transition-all font-noto"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white/80"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-red-400 text-xs">{validationErrors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2 font-noto">
                パスワード確認 / Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-white/50" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/30 rounded-lg
                           text-white placeholder-white/50 focus:border-blue-400 focus:ring-2
                           focus:ring-blue-400/20 focus:outline-none transition-all font-noto"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white/80"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-red-400 text-xs">{validationErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold font-noto flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>設定 / Preferences</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2 font-noto">
                  言語 / Language
                </label>
                <select
                  name="preferences.language"
                  value={formData.preferences.language}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg
                           text-white focus:border-blue-400 focus:ring-2
                           focus:ring-blue-400/20 focus:outline-none transition-all font-noto"
                >
                  {languages.map(lang => (
                    <option key={lang.id} value={lang.id} className="bg-gray-800">
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2 font-noto">
                  テーマ / Theme
                </label>
                <select
                  name="preferences.theme"
                  value={formData.preferences.theme}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg
                           text-white focus:border-blue-400 focus:ring-2
                           focus:ring-blue-400/20 focus:outline-none transition-all font-noto"
                >
                  {themes.map(theme => (
                    <option key={theme.id} value={theme.id} className="bg-gray-800">
                      {theme.icon} {theme.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2 font-noto">
                  都市 / City
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="w-5 h-5 text-white/50" />
                  </div>
                  <input
                    type="text"
                    name="location.city"
                    value={formData.preferences.location.city}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg
                             text-white placeholder-white/50 focus:border-blue-400 focus:ring-2
                             focus:ring-blue-400/20 focus:outline-none transition-all font-noto"
                    placeholder="Tokyo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2 font-noto">
                  国 / Country
                </label>
                <input
                  type="text"
                  name="location.country"
                  value={formData.preferences.location.country}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg
                           text-white placeholder-white/50 focus:border-blue-400 focus:ring-2
                           focus:ring-blue-400/20 focus:outline-none transition-all font-noto"
                  placeholder="JP"
                />
              </div>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-400
                     text-white font-semibold rounded-lg transition-colors
                     disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-noto"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="small" color="white" />
                <span>登録中...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>アカウント作成 / Create Account</span>
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-white/70 font-noto">
            既にアカウントをお持ちですか？
          </p>
          <button
            onClick={onSwitchToLogin}
            className="mt-2 text-blue-300 hover:text-blue-200 font-semibold transition-colors font-noto"
          >
            ログイン / Sign In
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default RegisterForm;
