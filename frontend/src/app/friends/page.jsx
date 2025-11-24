// app/friends/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, UserPlus, Users, MessageCircle, User, AlertCircle, Check } from 'lucide-react';

// Context & Hooks
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext'; 
import { useSidebar } from '../context/SidebarContext';
import { useDarkMode } from '../context/DarkModeContext';
import { useFriends } from '../hooks/useFriends';

// Components
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import LoadingScreen from '../components/LoadingScreen';

// API
import { searchUsers, addFriend, removeFriend } from '../lib/api/friends';

export default function FriendsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const { handleXPAward } = useGamification(); 
  const { isCollapsed } = useSidebar();
  const { darkMode } = useDarkMode();
  const router = useRouter();
  
  // Friends data
  const { friends, loading, refetch } = useFriends(token);
  
  // Search state
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('friends');
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setError('');

    try {
      const data = await searchUsers(searchQuery, token);
      setSearchResults(data.users || []);
      setActiveTab('search');
    } catch (err) {
      console.error('Error searching users:', err);
      setError(err.message || 'Search failed');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddFriend = async (userId) => {
    try {
      const data = await addFriend(userId, token);
      
      if (data.xpAwarded) {
        handleXPAward(data.xpAwarded);
      }
      
      await refetch();
      setSearchResults(searchResults.filter(u => u._id !== userId));
    } catch (err) {
      console.error('Error adding friend:', err);
      setError(err.message || 'Failed to add friend');
    }
  };

  const handleRemoveFriend = async (userId) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;

    try {
      await removeFriend(userId, token);
      await refetch();
    } catch (err) {
      console.error('Error removing friend:', err);
      setError(err.message || 'Failed to remove friend');
    }
  };

  const handleSendMessage = (userId) => {
    router.push(`/messages?userId=${userId}`);
  };

  // Show loading screen while auth or data is loading
  if (authLoading || loading) {
    return <LoadingScreen />;
  }

  // Redirect if not authenticated
  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <Sidebar />
      
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="max-w-7xl mx-auto px-8 pt-8 pb-16">
          {/* Page Header */}
          <PageHeader
            title="Friends"
            subtitle="Connect with classmates and study together"
          />

          {/* Search Bar */}
          <div className="mb-12">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1 relative">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  darkMode ? 'text-gray-500' : 'text-gray-400'
                }`} strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:outline-none transition text-lg ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500' 
                      : 'bg-white border-gray-100 text-gray-900 placeholder-gray-400 focus:border-indigo-300'
                  }`}
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
            <div className={`mb-8 border-2 px-6 py-4 rounded-2xl flex items-center gap-3 ${
              darkMode 
                ? 'bg-red-900/50 border-red-700 text-red-200' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <AlertCircle className="w-5 h-5" strokeWidth={2} />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Tabs */}
          <div className={`mb-8 border-b-2 ${
            darkMode ? 'border-gray-800' : 'border-gray-50'
          }`}>
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('friends')}
                className={`pb-4 px-1 font-semibold transition relative ${
                  activeTab === 'friends'
                    ? 'text-indigo-600'
                    : darkMode
                    ? 'text-gray-400 hover:text-gray-200'
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
                      : darkMode
                      ? 'text-gray-400 hover:text-gray-200'
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
                <div className={`rounded-3xl p-20 text-center ${
                  darkMode ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                  <Users className={`w-20 h-20 mx-auto mb-6 ${
                    darkMode ? 'text-gray-600' : 'text-gray-300'
                  }`} strokeWidth={1.5} />
                  <h3 className={`text-2xl font-semibold mb-3 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>No friends yet</h3>
                  <p className={`mb-8 max-w-md mx-auto text-lg ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Search for classmates to connect with and start studying together
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {friends.map((friend) => (
                    <FriendCard
                      key={friend._id}
                      friend={friend}
                      darkMode={darkMode}
                      onSendMessage={() => handleSendMessage(friend._id)}
                      onViewProfile={() => router.push(`/profile/${friend._id}`)}
                      onRemove={() => handleRemoveFriend(friend._id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search Results */}
          {activeTab === 'search' && (
            <div>
              {searchResults.length === 0 ? (
                <div className={`rounded-3xl p-20 text-center ${
                  darkMode ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                  <Search className={`w-20 h-20 mx-auto mb-6 ${
                    darkMode ? 'text-gray-600' : 'text-gray-300'
                  }`} strokeWidth={1.5} />
                  <h3 className={`text-2xl font-semibold mb-3 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>No results found</h3>
                  <p className={`text-lg ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Try searching with a different name or email
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.map(searchUser => {
                    const isFriend = friends.some(f => f._id === searchUser._id);
                    return (
                      <SearchUserCard
                        key={searchUser._id}
                        user={searchUser}
                        isFriend={isFriend}
                        darkMode={darkMode}
                        onViewProfile={() => router.push(`/profile/${searchUser._id}`)}
                        onAddFriend={() => handleAddFriend(searchUser._id)}
                      />
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

// Friend Card Component
function FriendCard({ friend, darkMode, onSendMessage, onViewProfile, onRemove }) {
  return (
    <div
      className={`border-2 rounded-3xl p-6 transition-all duration-300 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10' 
          : 'bg-white border-gray-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10'
      }`}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
          <span className="text-white font-semibold text-2xl">
            {friend.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-lg mb-1 truncate ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {friend.name}
          </h3>
          <p className="text-sm text-indigo-600 mb-1 truncate font-medium">{friend.major}</p>
          <p className={`text-xs truncate ${
            darkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>{friend.email}</p>
        </div>
      </div>
      
      {friend.bio && (
        <p className={`text-sm mb-6 line-clamp-2 leading-relaxed ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>{friend.bio}</p>
      )}

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onSendMessage}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-4 py-3 rounded-xl transition hover:shadow-lg hover:shadow-indigo-500/30 text-sm flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" strokeWidth={2} />
            Message
          </button>
          <button
            onClick={onViewProfile}
            className={`font-medium px-4 py-3 rounded-xl transition text-sm flex items-center justify-center gap-2 ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
            }`}
          >
            <User className="w-4 h-4" strokeWidth={2} />
            Profile
          </button>
        </div>
        <button
          onClick={onRemove}
          className={`w-full font-medium px-4 py-3 rounded-xl transition text-sm ${
            darkMode 
              ? 'bg-gray-700 hover:bg-red-900 text-gray-300 hover:text-red-200' 
              : 'bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-600'
          }`}
        >
          Remove Friend
        </button>
      </div>
    </div>
  );
}

// Search User Card Component
function SearchUserCard({ user, isFriend, darkMode, onViewProfile, onAddFriend }) {
  return (
    <div
      className={`border-2 rounded-3xl p-6 transition-all duration-300 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10' 
          : 'bg-white border-gray-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10'
      }`}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
          <span className="text-white font-semibold text-2xl">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-lg mb-1 truncate ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {user.name}
          </h3>
          <p className="text-sm text-indigo-600 mb-1 truncate font-medium">{user.major}</p>
          <p className={`text-xs truncate ${
            darkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>{user.email}</p>
        </div>
      </div>
      
      {user.bio && (
        <p className={`text-sm mb-6 line-clamp-2 leading-relaxed ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>{user.bio}</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={onViewProfile}
          className={`flex-1 font-medium px-4 py-3 rounded-xl transition text-sm flex items-center justify-center gap-2 ${
            darkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
          }`}
        >
          <User className="w-4 h-4" strokeWidth={2} />
          View Profile
        </button>
        {isFriend ? (
          <button
            disabled
            className={`font-medium px-5 py-3 rounded-xl text-sm cursor-not-allowed flex items-center gap-2 ${
              darkMode 
                ? 'bg-green-900/50 text-green-300' 
                : 'bg-green-50 text-green-700'
            }`}
          >
            <Check className="w-4 h-4" strokeWidth={2} />
            Friends
          </button>
        ) : (
          <button
            onClick={onAddFriend}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-5 py-3 rounded-xl transition hover:shadow-lg hover:shadow-indigo-500/30 text-sm flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" strokeWidth={2} />
            Add
          </button>
        )}
      </div>
    </div>
  );
}