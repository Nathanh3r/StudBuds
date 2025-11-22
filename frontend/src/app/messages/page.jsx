'use client';

import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import LoadingScreen from '../components/LoadingScreen';

export default function MessagesPage() {
  const { user, token, loading: authLoading } = useAuth();
  const { isCollapsed } = useSidebar();
  const router = useRouter();

  // Dark mode state (replace with your theme context if you have one)
  const [darkMode, setDarkMode] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('darkMode') === 'true' : false
  );

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState('');
  const [backendError, setBackendError] = useState(false);
  const [newChatUser, setNewChatUser] = useState(null); // For starting new conversations
  const messagesEndRef = useRef(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login');
    }
  }, [authLoading, token, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const userId = params.get('userId');
      if (userId && token) startNewConversation(userId);
    }
  }, [token]);

  useEffect(() => {
    if (token && user) fetchConversations();
  }, [token, user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.user._id);
      markAsRead(selectedConversation.user._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startNewConversation = async (userId) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const res = await fetch(`${baseUrl}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const targetUser = data.user;
        const existingConvo = conversations.find(c => c.user._id === userId);

        if (existingConvo) setSelectedConversation(existingConvo);
        else {
          const newConvo = { user: targetUser, lastMessage: null, unreadCount: 0 };
          setNewChatUser(newConvo);
          setSelectedConversation(newConvo);
        }

        window.history.replaceState({}, '', '/messages');
      }
    } catch (err) {
      console.error('Error starting new conversation:', err);
      setError('Failed to start conversation');
    }
  };

  const fetchConversations = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const res = await fetch(`${baseUrl}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setBackendError(true);
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (res.ok) {
        setConversations(data.conversations || []);
        setError('');
        setBackendError(false);
      } else if (res.status !== 404) {
        console.error('API Error:', data.message);
      } else setConversations([]);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      if (err.message.includes('fetch')) setBackendError(true);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const res = await fetch(`${baseUrl}/messages/${userId}?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setError('Unable to load messages. Please try again.');
        return;
      }

      const data = await res.json();
      if (res.ok) setMessages(data.messages || []);
      else setError(data.message || 'Failed to load messages');
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    }
  };

  const markAsRead = async (userId) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      await fetch(`${baseUrl}/messages/${userId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchConversations();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setSendingMessage(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const res = await fetch(`${baseUrl}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiver: selectedConversation.user._id,
          content: newMessage,
        }),
      });

      if (res.ok) {
        setNewMessage('');
        if (newChatUser) setNewChatUser(null);
        await fetchMessages(selectedConversation.user._id);
        await fetchConversations();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24)
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    else if (diffInHours < 48) return 'Yesterday';
    else return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (authLoading || loading) return <LoadingScreen />;
  if (!user) return null;

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} min-h-screen flex`}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="h-screen flex flex-col">
          {/* Page Header */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 sm:px-6 lg:px-8 py-6`}>
            <PageHeader title="Messages" subtitle="Chat with your classmates" />
          </div>

          {/* Backend Error Warning */}
          {backendError && (
            <div className={`${darkMode ? 'bg-yellow-900 text-yellow-200 border-yellow-800' : 'bg-yellow-50 text-yellow-800 border-yellow-200'} border-b px-4 sm:px-6 lg:px-8 py-3`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <p className="text-sm">
                  Unable to connect to messaging service. Please make sure the backend is running on port 4000.
                </p>
              </div>
            </div>
          )}

          {/* Messages Layout */}
          <div className="flex-1 flex overflow-hidden">
            {/* Conversations List */}
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} w-full sm:w-80 lg:w-96 flex flex-col overflow-hidden`}>
              <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className="text-lg font-semibold">{darkMode ? 'text-gray-100' : 'text-gray-900'}Conversations</h2>
              </div>

              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className={`${darkMode ? 'text-gray-100' : 'text-gray-900'} text-lg font-semibold mb-2`}>No messages yet</h3>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mb-4`}>
                      Start a conversation with your friends!
                    </p>
                    <button
                      onClick={() => router.push('/friends')}
                      className={`inline-block font-medium px-4 py-2 rounded-lg transition text-sm ${
                        darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      Go to Friends
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {conversations.map((conversation) => (
                      <button
                        key={conversation.user._id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`w-full p-4 text-left transition ${
                          selectedConversation?.user._id === conversation.user._id
                            ? darkMode
                              ? 'bg-gray-700 border-l-4 border-indigo-400'
                              : 'bg-indigo-50 border-l-4 border-indigo-600'
                            : darkMode
                            ? 'hover:bg-gray-700'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-lg">
                              {conversation.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className={`${darkMode ? 'text-gray-100' : 'text-gray-900'} font-semibold truncate`}>
                                {conversation.user.name}
                              </h3>
                              {conversation.lastMessage && (
                                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-xs ml-2 flex-shrink-0`}>
                                  {formatTime(conversation.lastMessage.createdAt)}
                                </span>
                              )}
                            </div>
                            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-xs mb-1 truncate`}>
                              {conversation.user.major}
                            </p>
                            {conversation.lastMessage && (
                              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm truncate`}>
                                {conversation.lastMessage.content}
                              </p>
                            )}
                            {conversation.unreadCount > 0 && (
                              <span className="inline-block mt-2 bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                {conversation.unreadCount} new
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex-1 flex flex-col`}>
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {selectedConversation.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className={`${darkMode ? 'text-gray-100' : 'text-gray-900'} font-semibold`}>
                          {selectedConversation.user.name}
                        </h3>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                          {selectedConversation.user.major}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="text-4xl mb-2">👋</div>
                          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                            {newChatUser
                              ? `Start a conversation with ${selectedConversation.user.name}!`
                              : "No messages yet. Say hi to start the conversation!"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {messages.map((message) => {
                          const isCurrentUser = message.sender._id === user._id;
                          return (
                            <div
                              key={message._id}
                              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-2xl px-4 py-2 shadow-sm ${
                                  isCurrentUser
                                    ? darkMode
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-indigo-600 text-white'
                                    : darkMode
                                    ? 'bg-gray-800 text-gray-100'
                                    : 'bg-white text-gray-900'
                                }`}
                              >
                                <p className="text-sm break-words">{message.content}</p>
                                <p
                                  className={`text-xs mt-1 ${
                                    isCurrentUser
                                      ? 'text-indigo-200'
                                      : darkMode
                                      ? 'text-gray-400'
                                      : 'text-gray-500'
                                  }`}
                                >
                                  {formatTime(message.createdAt)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t p-4`}>
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        disabled={sendingMessage}
                        className={`flex-1 px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-indigo-500'
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-600'
                        }`}
                      />
                      <button
                        type="submit"
                        disabled={sendingMessage || !newMessage.trim()}
                        className={`font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
                          darkMode
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        {sendingMessage ? 'Sending...' : 'Send'}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className={`${darkMode ? 'text-gray-100' : 'text-gray-900'} text-xl font-semibold mb-2`}>
                      Select a conversation
                    </h3>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`${darkMode ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-700'} fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg max-w-md z-50 flex items-center justify-between`}>
              {error}
              <button
                onClick={() => setError('')}
                className={`${darkMode ? 'text-red-200 hover:text-red-100' : 'text-red-900 hover:text-red-700'} ml-4`}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
