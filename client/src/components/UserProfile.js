import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, MapPin, Globe, Palette, Save, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const UserProfile = ({ isOpen, onClose }) => {
  const { user, updateProfile, loading, error } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    preferences: {
      language: user?.preferences?.language || 'en',
      theme: user?.preferences?.theme || 'travel',
      location: {
        city: user?.preferences?.location?.city || '',
        country: user?.preferences?.location?.country || ''
      }
    }
  });

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
    
    if (name.includes('preferences.')) {
      const prefField = name.split('.')[1];
      if (prefField === 'city' || prefField === 'country') {
        setFormData(prev => ({
          ...prev,
          preferences: {
            ...prev.preferences,
            location: {
              ...prev.preferences.location,
              [prefField]: value
            }
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          preferences: {
            ...prev.preferences,
            [prefField]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      preferences: {
        language: user?.preferences?.language || 'en',
        theme: user?.preferences?.theme || 'travel',
        location: {
          city: user?.preferences?.location?.city || '',
          country: user?.preferences?.location?.country || ''
        }
      }
    });
    setIsEditing(false);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white/10 backdrop-blur-md rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white font-noto flex items-center space-x-2">
            <User className="w-6 h-6" />
            <span>プロフィール / Profile</span>
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-100 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-4 font-noto">基本情報 / Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2 font-noto">
                  名 / First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg
                             text-white placeholder-white/50 focus:border-blue-400 focus:ring-2
                             focus:ring-blue-400/20 focus:outline-none transition-all font-noto"
                  />
                ) : (
                  <div className="text-white font-noto">{user?.firstName}</div>
                )}
              </div>

              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2 font-noto">
                  姓 / Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg
                             text-white placeholder-white/50 focus:border-blue-400 focus:ring-2
                             focus:ring-blue-400/20 focus:outline-none transition-all font-noto"
                  />
                ) : (
                  <div className="text-white font-noto">{user?.lastName}</div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-white/80 text-sm font-semibold mb-2 font-noto">
                <Mail className="w-4 h-4 inline mr-1" />
                メールアドレス / Email
              </label>
              <div className="text-white font-noto">{user?.email}</div>
            </div>

            <div className="mt-4">
              <label className="block text-white/80 text-sm font-semibold mb-2 font-noto">
                ユーザー名 / Username
              </label>
              <div className="text-white font-noto">@{user?.username}</div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-4 font-noto flex items-center space-x-2">
              <Palette className="w-5 h-5" />
              <span>設定 / Preferences</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2 font-noto">
                  <Globe className="w-4 h-4 inline mr-1" />
                  言語 / Language
                </label>
                {isEditing ? (
                  <select
                    name="preferences.language"
                    value={formData.preferences.language}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg
                             text-white focus:border-blue-400 focus:ring-2
                             focus:ring-blue-400/20 focus:outline-none transition-all font-noto"
                  >
                    {languages.map(lang => (
                      <option key={lang.id} value={lang.id} className="bg-gray-800">
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-white font-noto">
                    {languages.find(l => l.id === user?.preferences?.language)?.flag}{' '}
                    {languages.find(l => l.id === user?.preferences?.language)?.name}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2 font-noto">
                  テーマ / Theme
                </label>
                {isEditing ? (
                  <select
                    name="preferences.theme"
                    value={formData.preferences.theme}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg
                             text-white focus:border-blue-400 focus:ring-2
                             focus:ring-blue-400/20 focus:outline-none transition-all font-noto"
                  >
                    {themes.map(theme => (
                      <option key={theme.id} value={theme.id} className="bg-gray-800">
                        {theme.icon} {theme.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-white font-noto">
                    {themes.find(t => t.id === user?.preferences?.theme)?.icon}{' '}
                    {themes.find(t => t.id === user?.preferences?.theme)?.name}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2 font-noto">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  都市 / City
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="preferences.city"
                    value={formData.preferences.location.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg
                             text-white placeholder-white/50 focus:border-blue-400 focus:ring-2
                             focus:ring-blue-400/20 focus:outline-none transition-all font-noto"
                  />
                ) : (
                  <div className="text-white font-noto">{user?.preferences?.location?.city || '-'}</div>
                )}
              </div>

              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2 font-noto">
                  国 / Country
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="preferences.country"
                    value={formData.preferences.location.country}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg
                             text-white placeholder-white/50 focus:border-blue-400 focus:ring-2
                             focus:ring-blue-400/20 focus:outline-none transition-all font-noto"
                  />
                ) : (
                  <div className="text-white font-noto">{user?.preferences?.location?.country || '-'}</div>
                )}
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-4 font-noto">統計 / Statistics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{user?.stats?.totalSessions || 0}</div>
                <div className="text-white/70 text-sm font-noto">Total Sessions</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{user?.stats?.totalMessages || 0}</div>
                <div className="text-white/70 text-sm font-noto">Total Messages</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{user?.stats?.totalVoiceInputs || 0}</div>
                <div className="text-white/70 text-sm font-noto">Voice Inputs</div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <div className="text-white/70 text-sm font-noto">
                登録日 / Member since: {user?.createdAt && formatDate(user.createdAt)}
              </div>
              <div className="text-white/70 text-sm font-noto mt-1">
                最終ログイン / Last login: {user?.lastLogin && formatDate(user.lastLogin)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            {isEditing ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-500/20 text-white rounded-lg hover:bg-gray-500/30 transition-colors font-noto"
                >
                  キャンセル / Cancel
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-lg transition-colors font-noto flex items-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner size="small" color="white" />
                      <span>保存中...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>保存 / Save</span>
                    </>
                  )}
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-noto"
              >
                編集 / Edit Profile
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserProfile;
