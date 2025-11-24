// app/users/[id]/page.jsx
'use client';

import { useAuth } from '../../context/AuthContext';
import { useGamification } from '../../context/GamificationContext'; 
import { useDarkMode } from '../../context/DarkModeContext';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import ProtectedPage from '../../components/ProtectedPage';
import PageHeader from '../../components/PageHeader';
import EditProfileModal from '../../components/EditProfileModal';
import LoadingScreen from '../../components/LoadingScreen';
import EmptyState from '../../components/EmptyState';
import StatsCard from '../../components/StatsCard';
import { useUserProfile } from '../../hooks/useUserProfile';
import { addFriend, removeFriend, updateUserProfile } from '../../lib/api/users';
import { 
  Mail, 
  MessageCircle, 
  UserPlus, 
  UserMinus, 
  Users, 
  BookOpen, 
  Award,
  Settings,
  Briefcase,
  User,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function UserProfilePage() {
  const { token, user: currentUser } = useAuth();
  const { stats, loading: statsLoading } = useGamification(); 
  const { darkMode } = useDarkMode();
  const router = useRouter();
  const params = useParams();
  const userId = params.id;

  const { user: profileUser, loading, error, refetch } = useUserProfile(userId, token);
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [actionError, setActionError] = useState('');

  const handleAddFriend = async () => {
    setActionLoading(true);
    setActionError('');
    try {
      await addFriend(userId, token);
      await refetch();
    } catch (err) {
      console.error('Error adding friend:', err);
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!confirm('Are you sure you want to remove this friend?')) return;

    setActionLoading(true);
    setActionError('');
    try {
      await removeFriend(userId, token);
      await refetch();
    } catch (err) {
      console.error('Error removing friend:', err);
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveProfile = async (formData) => {
    await updateUserProfile(formData, token);
    await refetch();
  };

  if (loading) return <LoadingScreen />;

  if (error && !profileUser) {
    return (
      <ProtectedPage>
        <EmptyState
          icon={User}
          title="Profile Not Found"
          description={error}
          actionLabel="Browse Friends"
          actionHref="/friends"
          darkMode={darkMode}
        />
      </ProtectedPage>
    );
  }

  if (!currentUser || !profileUser) return null;

  const isOwnProfile = currentUser._id === profileUser._id;

  const profileStats = [
    {
      label: 'Friends',
      value: profileUser.friendCount || 0,
      icon: Users,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Classes',
      value: profileUser.classCount || 0,
      icon: BookOpen,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      label: 'Level',
      value: isOwnProfile && stats ? stats.level : '?',
      icon: Award,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    ...(isOwnProfile && stats ? [{
      label: 'Total XP',
      value: stats.xp?.toLocaleString() || '0',
      icon: Zap,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    }] : []),
  ];

  return (
    <ProtectedPage maxWidth="5xl">
      <PageHeader
        title={isOwnProfile ? "Your Profile" : profileUser.name}
        subtitle={isOwnProfile ? "Manage your profile and view your stats" : `View ${profileUser.name.split(' ')[0]}'s profile`}
      />

      {/* Profile Header Card */}
      <div className={`rounded-3xl p-8 mb-8 transition-all duration-300 ${
        darkMode 
          ? 'bg-gray-800 border-2 border-gray-700 hover:border-gray-600 hover:shadow-xl' 
          : 'bg-white border-2 border-gray-100 hover:border-gray-200 hover:shadow-xl'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar with Level Badge */}
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-4xl">
                {profileUser.name.charAt(0).toUpperCase()}
              </span>
            </div>
            {isOwnProfile && stats && (
              <div className={`absolute -bottom-2 -right-2 rounded-full p-2 shadow-lg ${
                darkMode ? 'bg-purple-300' : 'bg-purple-200'
              }`}>
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold text-indigo-900">{stats.level}</span>
                </div>
              </div>
            )}
            {profileUser.isFriend && !isOwnProfile && (
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1.5 shadow-lg">
                <Users className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              {profileUser.name}
            </h1>
            {isOwnProfile && stats && (
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-purple-600" strokeWidth={2} />
                <p className="text-lg font-medium" style={{ color: stats.rankColor || '#8b5cf6' }}>
                  {stats.rank}
                </p>
              </div>
            )}
            {profileUser.major && (
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-5 h-5 text-indigo-600" strokeWidth={2} />
                <p className="text-lg text-indigo-600 font-medium">{profileUser.major}</p>
              </div>
            )}
            <div className={`flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Mail className="w-4 h-4" strokeWidth={2} />
              <p className="text-sm">{profileUser.email}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap sm:flex-nowrap">
            {isOwnProfile ? (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-6 py-3 rounded-full hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:scale-105"
              >
                <Settings className="w-5 h-5" strokeWidth={2} />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={() => router.push(`/messages?userId=${userId}`)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-6 py-3 rounded-full hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:scale-105"
                >
                  <MessageCircle className="w-5 h-5" strokeWidth={2} />
                  Message
                </button>
                {profileUser.isFriend ? (
                  <button
                    onClick={handleRemoveFriend}
                    disabled={actionLoading}
                    className={`inline-flex items-center gap-2 border-2 font-medium px-6 py-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      darkMode
                        ? 'bg-gray-700 border-red-600 text-red-400 hover:bg-red-900/20'
                        : 'bg-white border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300'
                    }`}
                  >
                    <UserMinus className="w-5 h-5" strokeWidth={2} />
                    {actionLoading ? 'Removing...' : 'Remove Friend'}
                  </button>
                ) : (
                  <button
                    onClick={handleAddFriend}
                    disabled={actionLoading}
                    className={`inline-flex items-center gap-2 border-2 font-medium px-6 py-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <UserPlus className="w-5 h-5" strokeWidth={2} />
                    {actionLoading ? 'Adding...' : 'Add Friend'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bio */}
        {profileUser.bio && (
          <div className={`mt-8 pt-8 border-t-2 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <h2 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              About
            </h2>
            <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {profileUser.bio}
            </p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="mb-8">
        <h2 className={`text-2xl font-semibold mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Stats
        </h2>
        <div className={`grid gap-4 ${
          isOwnProfile && stats 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' 
            : 'grid-cols-1 sm:grid-cols-3'
        }`}>
          {profileStats.map((stat, index) => (
            <StatsCard key={index} stat={stat} darkMode={darkMode} />
          ))}
        </div>
      </div>

      {isOwnProfile && stats && (
        <div className="mb-8">
          <h2 className={`text-2xl font-semibold mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Level Progress
          </h2>
          <div className={`rounded-3xl p-6 ${
            darkMode 
              ? 'bg-gray-800 border-2 border-gray-700' 
              : 'bg-white border-2 border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Level {stats.level}
                </p>
                <p className="text-2xl font-bold" style={{ color: stats.rankColor || '#8b5cf6' }}>
                  {stats.rank}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Progress to Level {stats.level + 1}
                </p>
                <p className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {stats.progress?.currentXP || 0} / {stats.progress?.xpNeeded || 0} XP
                </p>
              </div>
            </div>
            <div className={`w-full h-4 rounded-full overflow-hidden ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${stats.progress?.percentage || 0}%`,
                  background: `linear-gradient(90deg, ${stats.rankColor || '#8b5cf6'}, ${stats.rankColor || '#8b5cf6'}dd)`,
                }}
              />
            </div>
            <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {stats.progress?.percentage || 0}% complete
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {actionError && (
        <div className={`mt-6 border-2 px-6 py-4 rounded-2xl ${
          darkMode
            ? 'bg-red-900/20 border-red-800 text-red-300'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <p className="font-medium">{actionError}</p>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={profileUser}
        onSave={handleSaveProfile}
        darkMode={darkMode}
      />
    </ProtectedPage>
  );
}