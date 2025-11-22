'use client';

import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { useDarkMode } from '../context/DarkModeContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import LoadingScreen from '../components/LoadingScreen';

export default function FriendsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const { isCollapsed } = useSidebar();
  const { darkMode } = useDarkMode();
  const router = useRouter();
  
  const [friends, setFriends] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('friends');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !token) router.push('/login');
  }, [authLoading, token, router]);

  // Fetch friends on mount
  useEffect(() => {
    if (token && user) fetchFriends();
  }, [token, user]);

  const fetchFriends = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const res = await fetch(`${baseUrl}/users/friends`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setFriends(data.friends || []);
      else setError(data.message || 'Failed to load friends');
    } catch (err) {
      console.error('Error fetching friends:', err);
      setError('Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setError('');

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const res = await fetch(`${baseUrl}/users/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setSearchResults(data.users || []);
        setActiveTab('search');
      } else setError(data.message || 'Search failed');
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Search failed');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddFriend = async (userId) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const res = await fetch(`${baseUrl}/users/add-friend/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchFriends();
        setSearchResults(searchResults.filter(u => u._id !== userId));
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to add friend');
      }
    } catch (err) {
      console.error('Error adding friend:', err);
      setError('Failed to add friend');
    }
  };

  const handleRemoveFriend = async (userId) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const res = await fetch(`${baseUrl}/users/remove-friend/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) await fetchFriends();
      else {
        const data = await res.json();
        setError(data.message || 'Failed to remove friend');
      }
    } catch (err) {
      console.error('Error removing friend:', err);
      setError('Failed to remove friend');
    }
  };

  const handleSendMessage = (userId) => router.push(`/messages?userId=${userId}`);

  if (authLoading || loading) return <LoadingScreen />;
  if (!user) return null;

  const bgClass = darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black';
  const cardBg = darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  const textGray = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textGrayLight = darkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`min-h-screen flex ${bgClass}`}>
      <Sidebar />

      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PageHeader title="Friends" subtitle="Connect with classmates and study together" />

          {/* Search Bar */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-black'}`}
                />
              </div>
              <button
                type="submit"
                disabled={searchLoading || !searchQuery.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`mb-6 px-4 py-3 rounded-lg ${darkMode ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-700'} border`}>
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className={`mb-6 border-b ${borderColor}`}>
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('friends')}
                className={`pb-3 px-1 font-medium transition relative ${activeTab === 'friends' ? 'text-indigo-600' : textGray}`}
              >
                My Friends ({friends.length})
                {activeTab === 'friends' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>}
              </button>
              {searchResults.length > 0 && (
                <button
                  onClick={() => setActiveTab('search')}
                  className={`pb-3 px-1 font-medium transition relative ${activeTab === 'search' ? 'text-indigo-600' : textGray}`}
                >
                  Search Results ({searchResults.length})
                  {activeTab === 'search' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>}
                </button>
              )}
            </div>
          </div>

          {/* Friends List */}
          {activeTab === 'friends' && (
            <div>
              {friends.length === 0 ? (
                <div className={`${cardBg} rounded-xl shadow-sm p-12 text-center`}>
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No friends yet</h3>
                  <p className={textGrayLight}>
                    Search for classmates to connect with and start studying together
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {friends.map(friend => (
                    <div key={friend._id} className={`${cardBg} rounded-xl shadow-sm p-6 hover:shadow-md transition`}>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-2xl">{friend.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-bold text-lg mb-1 truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{friend.name}</h3>
                          <p className="text-sm text-indigo-600 mb-1 truncate">{friend.major}</p>
                          <p className={`text-xs truncate ${textGrayLight}`}>{friend.email}</p>
                        </div>
                      </div>

                      {friend.bio && <p className={`text-sm mb-4 line-clamp-2 ${textGray}`}>{friend.bio}</p>}

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleSendMessage(friend._id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition text-sm"
                        >
                          Message
                        </button>
                        <button
                          onClick={() => router.push(`/profile/${friend._id}`)}
                          className={`font-medium px-4 py-2 rounded-lg transition text-sm
                            ${darkMode 
                              ? 'bg-gray-700 hover:bg-gray-600 text-white'  // Dark mode styles
                              : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700' // Light mode styles
                            }`}
                        >
                          Profile
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveFriend(friend._id)}
                        className={`${darkMode ? 'bg-gray-700 hover:bg-red-800 text-red-400 hover:text-red-200' : 'bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600'} w-full mt-2 font-medium px-4 py-2 rounded-lg transition text-sm`}
                      >
                        Remove Friend
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search Results */}
          {activeTab === 'search' && (
            <div>
              {searchResults.length === 0 ? (
                <div className={`${cardBg} rounded-xl shadow-sm p-12 text-center`}>
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No results found</h3>
                  <p className={textGrayLight}>Try searching with a different name or email</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.map(user => {
                    const isFriend = friends.some(f => f._id === user._id);
                    return (
                      <div key={user._id} className={`${cardBg} rounded-xl shadow-sm p-6 hover:shadow-md transition`}>
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-2xl">{user.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-bold text-lg mb-1 truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</h3>
                            <p className="text-sm text-indigo-600 mb-1 truncate">{user.major}</p>
                            <p className={`text-xs truncate ${textGrayLight}`}>{user.email}</p>
                          </div>
                        </div>
                        {user.bio && <p className={`text-sm mb-4 line-clamp-2 ${textGray}`}>{user.bio}</p>}
                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push(`/profile/${user._id}`)}
                            className={`flex-1 font-medium px-4 py-2 rounded-lg text-sm transition ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                          >
                            View Profile
                          </button>
                          {isFriend ? (
                            <button disabled className="bg-green-100 text-green-700 font-medium px-4 py-2 rounded-lg text-sm cursor-not-allowed">
                              ✓ Friends
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAddFriend(user._id)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition text-sm"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
