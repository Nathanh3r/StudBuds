'use client';

import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import LoadingScreen from '../components/LoadingScreen';

export default function FriendsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const { isCollapsed } = useSidebar();
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
    if (!authLoading && !token) {
      router.push('/login');
    }
  }, [authLoading, token, router]);

  // Fetch friends on mount
  useEffect(() => {
    if (token && user) {
      fetchFriends();
    }
  }, [token, user]);

  const fetchFriends = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const res = await fetch(`${baseUrl}/users/friends`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (res.ok) {
        setFriends(data.friends || []);
      } else {
        setError(data.message || 'Failed to load friends');
      }
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
      } else {
        setError(data.message || 'Search failed');
      }
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
      
      if (res.ok) {
        await fetchFriends();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to remove friend');
      }
    } catch (err) {
      console.error('Error removing friend:', err);
      setError('Failed to remove friend');
    }
  };

  const handleSendMessage = async (userId) => {
    // Navigate to messages page with userId parameter
    router.push(`/messages?userId=${userId}`);
  };

  if (authLoading || loading) {
    return <LoadingScreen />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <PageHeader
            title="Friends"
            subtitle="Connect with classmates and study together"
          />

          {/* Search Bar */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
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
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('friends')}
                className={`pb-3 px-1 font-medium transition relative ${
                  activeTab === 'friends'
                    ? 'text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My Friends ({friends.length})
                {activeTab === 'friends' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                )}
              </button>
              {searchResults.length > 0 && (
                <button
                  onClick={() => setActiveTab('search')}
                  className={`pb-3 px-1 font-medium transition relative ${
                    activeTab === 'search'
                      ? 'text-indigo-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Search Results ({searchResults.length})
                  {activeTab === 'search' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Friends List */}
          {activeTab === 'friends' && (
            <div>
              {friends.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No friends yet</h3>
                  <p className="text-gray-500 mb-6">
                    Search for classmates to connect with and start studying together
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {friends.map((friend) => (
                    <div
                      key={friend._id}
                      className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-2xl">
                            {friend.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">
                            {friend.name}
                          </h3>
                          <p className="text-sm text-indigo-600 mb-1 truncate">{friend.major}</p>
                          <p className="text-xs text-gray-500 truncate">{friend.email}</p>
                        </div>
                      </div>
                      
                      {friend.bio && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{friend.bio}</p>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleSendMessage(friend._id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition text-sm"
                        >
                          Message
                        </button>
                        <button
                          onClick={() => router.push(`/profile/${friend._id}`)}
                          className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium px-4 py-2 rounded-lg transition text-sm"
                        >
                          Profile
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveFriend(friend._id)}
                        className="w-full mt-2 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 font-medium px-4 py-2 rounded-lg transition text-sm"
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
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-500">
                    Try searching with a different name or email
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.map((searchUser) => {
                    const isFriend = friends.some(f => f._id === searchUser._id);
                    
                    return (
                      <div
                        key={searchUser._id}
                        className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-2xl">
                              {searchUser.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">
                              {searchUser.name}
                            </h3>
                            <p className="text-sm text-indigo-600 mb-1 truncate">{searchUser.major}</p>
                            <p className="text-xs text-gray-500 truncate">{searchUser.email}</p>
                          </div>
                        </div>
                        
                        {searchUser.bio && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{searchUser.bio}</p>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push(`/profile/${searchUser._id}`)}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg transition text-sm"
                          >
                            View Profile
                          </button>
                          {isFriend ? (
                            <button
                              disabled
                              className="bg-green-100 text-green-700 font-medium px-4 py-2 rounded-lg text-sm cursor-not-allowed"
                            >
                              ✓ Friends
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAddFriend(searchUser._id)}
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