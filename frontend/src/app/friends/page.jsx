// app/friends/page.jsx
'use client';

import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import LoadingScreen from '../components/LoadingScreen';
import { Search, UserPlus, Users, MessageCircle, User, AlertCircle, Check } from 'lucide-react';

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

  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login');
    }
  }, [authLoading, token, router]);

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
    router.push(`/messages?userId=${userId}`);
  };

  if (authLoading || loading) {
    return <LoadingScreen />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />

      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-72'}`}>
        <div className="max-w-7xl mx-auto px-8 py-16">
          {/* Page Header */}
          <PageHeader
            title="Friends"
            subtitle="Connect with classmates and study together"
          />

          {/* Search Bar */}
          <div className="mb-12">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-2xl focus:border-indigo-300 focus:outline-none transition text-lg"
                />
              </div>
              <button
                type="submit"
                disabled={searchLoading || !searchQuery.trim()}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-8 py-4 rounded-2xl transition disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-indigo-500/30 flex items-center gap-2"
              >
                <Search className="w-5 h-5" strokeWidth={2} />
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5" strokeWidth={2} />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-8 border-b-2 border-gray-50">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('friends')}
                className={`pb-4 px-1 font-semibold transition relative ${
                  activeTab === 'friends'
                    ? 'text-indigo-600'
                    : 'text-gray-400 hover:text-gray-900'
                }`}
              >
                My Friends ({friends.length})
                {activeTab === 'friends' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-full"></div>
                )}
              </button>
              {searchResults.length > 0 && (
                <button
                  onClick={() => setActiveTab('search')}
                  className={`pb-4 px-1 font-semibold transition relative ${
                    activeTab === 'search'
                      ? 'text-indigo-600'
                      : 'text-gray-400 hover:text-gray-900'
                  }`}
                >
                  Search Results ({searchResults.length})
                  {activeTab === 'search' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-full"></div>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Friends List */}
          {activeTab === 'friends' && (
            <div>
              {friends.length === 0 ? (
                <div className="bg-gray-50 rounded-3xl p-20 text-center">
                  <Users className="w-20 h-20 mx-auto mb-6 text-gray-300" strokeWidth={1.5} />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">No friends yet</h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">
                    Search for classmates to connect with and start studying together
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {friends.map((friend) => (
                    <div
                      key={friend._id}
                      className="bg-white border-2 border-gray-100 rounded-3xl p-6 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
                          <span className="text-white font-semibold text-2xl">
                            {friend.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
                            {friend.name}
                          </h3>
                          <p className="text-sm text-indigo-600 mb-1 truncate font-medium">{friend.major}</p>
                          <p className="text-xs text-gray-400 truncate">{friend.email}</p>
                        </div>
                      </div>
                      
                      {friend.bio && (
                        <p className="text-sm text-gray-600 mb-6 line-clamp-2 leading-relaxed">{friend.bio}</p>
                      )}

                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleSendMessage(friend._id)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-4 py-3 rounded-xl transition hover:shadow-lg hover:shadow-indigo-500/30 text-sm flex items-center justify-center gap-2"
                          >
                            <MessageCircle className="w-4 h-4" strokeWidth={2} />
                            Message
                          </button>
                          <button
                            onClick={() => router.push(`/profile/${friend._id}`)}
                            className="bg-indigo-50 text-indigo-600 font-medium px-4 py-3 rounded-xl transition hover:bg-indigo-100 text-sm flex items-center justify-center gap-2"
                          >
                            <User className="w-4 h-4" strokeWidth={2} />
                            Profile
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveFriend(friend._id)}
                          className="w-full bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-600 font-medium px-4 py-3 rounded-xl transition text-sm"
                        >
                          Remove Friend
                        </button>
                      </div>
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
                <div className="bg-gray-50 rounded-3xl p-20 text-center">
                  <Search className="w-20 h-20 mx-auto mb-6 text-gray-300" strokeWidth={1.5} />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">No results found</h3>
                  <p className="text-gray-500 text-lg">
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
                        className="bg-white border-2 border-gray-100 rounded-3xl p-6 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
                            <span className="text-white font-semibold text-2xl">
                              {searchUser.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
                              {searchUser.name}
                            </h3>
                            <p className="text-sm text-indigo-600 mb-1 truncate font-medium">{searchUser.major}</p>
                            <p className="text-xs text-gray-400 truncate">{searchUser.email}</p>
                          </div>
                        </div>
                        
                        {searchUser.bio && (
                          <p className="text-sm text-gray-600 mb-6 line-clamp-2 leading-relaxed">{searchUser.bio}</p>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push(`/profile/${searchUser._id}`)}
                            className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium px-4 py-3 rounded-xl transition text-sm flex items-center justify-center gap-2"
                          >
                            <User className="w-4 h-4" strokeWidth={2} />
                            View Profile
                          </button>
                          {isFriend ? (
                            <button
                              disabled
                              className="bg-green-50 text-green-700 font-medium px-5 py-3 rounded-xl text-sm cursor-not-allowed flex items-center gap-2"
                            >
                              <Check className="w-4 h-4" strokeWidth={2} />
                              Friends
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAddFriend(searchUser._id)}
                              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-5 py-3 rounded-xl transition hover:shadow-lg hover:shadow-indigo-500/30 text-sm flex items-center gap-2"
                            >
                              <UserPlus className="w-4 h-4" strokeWidth={2} />
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