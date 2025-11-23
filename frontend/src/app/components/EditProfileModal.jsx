// components/EditProfileModal.jsx
'use client';

import { useState, useEffect } from 'react';
import { X, User, Briefcase, FileText } from 'lucide-react';

export default function EditProfileModal({ isOpen, onClose, user, onSave, darkMode = false }) {
  const [formData, setFormData] = useState({
    bio: '',
    major: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        bio: user.bio || '',
        major: user.major || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-2xl rounded-3xl shadow-2xl animate-slideUp ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b-2 ${
          darkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Edit Profile
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Update your profile information
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              darkMode 
                ? 'hover:bg-gray-700 text-gray-400' 
                : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Major Field */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" strokeWidth={2} />
                Major
              </div>
            </label>
            <input
              type="text"
              name="major"
              value={formData.major}
              onChange={handleChange}
              placeholder="e.g., Computer Science"
              className={`w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-indigo-500'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400'
              }`}
            />
          </div>

          {/* Bio Field */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" strokeWidth={2} />
                Bio
              </div>
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              rows={5}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none resize-none ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-indigo-500'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400'
              }`}
            />
            <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {formData.bio.length} characters
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`p-4 rounded-xl border-2 ${
              darkMode
                ? 'bg-red-900/20 border-red-800 text-red-300'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`flex-1 px-6 py-3 rounded-full font-medium border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-full font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}