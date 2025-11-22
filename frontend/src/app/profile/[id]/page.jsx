'use client';

import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import LoadingScreen from '../../components/LoadingScreen';
import Link from 'next/link';

export default function UserProfilePage() {
  const { token, user: currentUser, loading: authLoading } = useAuth();
  const { isCollapsed } = useSidebar();
  const router = useRouter();
  const params = useParams();
  const userId = params.id;

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Dark mode state
  const [darkMode, setDarkMode] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('darkMode') === 'true' : false
  );

  useEffect(() => {
    if (!authLoading && !token) router.push('/login');
  }, [authLoading, token, router]);

  useEffect(() => {
    if (token && userId) fetchUserProfile();
  }, [token, userId]);

  const fetchUserProfile = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const res = await fetch(`${baseUrl}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setProfileUser(data.user);
      } else {
        setError(data.message || 'Failed to load profile');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async () => {
    setActionLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const res = await fetch(`${baseUrl}/users/add-friend/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        await fetchUserProfile();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to add friend');
      }
    } catch (err) {
      console.error('Error adding friend:', err);
      setError('Failed to add friend');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!confirm('Are you sure you want to remove this friend?')) return;

    setActionLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const res = await fetch(`${baseUrl}/users/remove-friend/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        await fetchUserProfile();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to remove friend');
      }
    } catch (err) {
      console.error('Error removing friend:', err);
      setError('Failed to remove friend');
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || loading) return <LoadingScreen />;

  if (error && !profileUser) {
    return (
      <div className={`${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} min-h-screen flex`}>
        <Sidebar />
        <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center max-w-md">
              <div className="text-xl text-red-600 mb-4">Error Loading Profile</div>
              <div className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser || !profileUser) return null;

  const isOwnProfile = currentUser._id === profileUser._id;

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} min-h-screen flex`}>
      <Sidebar />

      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-8 mb-6`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-4xl">{profileUser.name.charAt(0).toUpperCase()}</span>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h1 className={`${darkMode ? 'text-gray-100' : 'text-gray-900'} text-3xl font-bold mb-2`}>{profileUser.name}</h1>
                <p className="text-lg text-indigo-600 mb-2">{profileUser.major}</p>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{profileUser.email}</p>
              </div>

              {/* Action Buttons */}
              {!isOwnProfile && (
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/messages?userId=${userId}`)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Message
                  </button>
                  {profileUser.isFriend ? (
                    <button
                      onClick={handleRemoveFriend}
                      disabled={actionLoading}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading ? 'Removing...' : 'Remove Friend'}
                    </button>
                  ) : (
                    <button
                      onClick={handleAddFriend}
                      disabled={actionLoading}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading ? 'Adding...' : 'Add Friend'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Bio */}
            {profileUser.bio && (
              <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`${darkMode ? 'text-gray-100' : 'text-gray-900'} text-lg font-semibold mb-2`}>About</h2>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{profileUser.bio}</p>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            {[
              { icon: '👥', value: profileUser.friendCount || 0, label: 'Friends', bg: 'bg-indigo-100', text: 'text-gray-900' },
              { icon: '📚', value: profileUser.classCount || 0, label: 'Classes', bg: 'bg-green-100', text: 'text-gray-900' },
              { icon: '⚡', value: 'Level 2', label: 'Progress', bg: 'bg-yellow-100', text: 'text-gray-900' },
            ].map((card, idx) => (
              <div key={idx} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
                <div className="flex items-center gap-3">
                  <div className={`${card.bg} rounded-lg w-12 h-12 flex items-center justify-center`}>
                    <span className="text-2xl">{card.icon}</span>
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{card.value}</p>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{card.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          {isOwnProfile && (
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`${darkMode ? 'text-gray-100' : 'text-gray-900'} text-xl font-bold`}>Your Profile</h2>
                <Link href="/settings" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Edit Profile
                </Link>
              </div>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                This is how other students see your profile. You can edit your information in Settings.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className={`${darkMode ? 'bg-red-800 text-red-200 border-red-700' : 'bg-red-50 text-red-700 border-red-200'} border px-4 py-3 rounded-lg mt-6`}>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
