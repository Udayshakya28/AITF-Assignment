import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../LoadingSpinner';

const LoginForm = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, error, clearError } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await login(formData.email, formData.password);
      // No hard navigation: AuthContext will set isAuthenticated and switch view
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
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <LogIn className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2 font-noto">
            ログイン / 登录 / Sign In
          </h2>
          <p className="text-white/70 font-noto">
            AIチャットボットにアクセス
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
          <div>
            <label className="block text-white/80 text-sm font-semibold mb-2 font-noto">
              メールアドレス / Email
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
                placeholder="example@email.com"
              />
            </div>
          </div>

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
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400
                     text-white font-semibold rounded-lg transition-colors
                     disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-noto"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="small" color="white" />
                <span>ログイン中...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>ログイン / Sign In</span>
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-white/70 font-noto">
            アカウントをお持ちでない場合は
          </p>
          <button
            onClick={onSwitchToRegister}
            className="mt-2 text-blue-300 hover:text-blue-200 font-semibold transition-colors font-noto"
          >
            新規登録 / Register
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-white/50 text-xs font-noto">
            Demo credentials: demo@example.com / password123
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginForm;
