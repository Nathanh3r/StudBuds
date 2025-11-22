// app/messages/page.jsx
'use client';

import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import LoadingScreen from '../components/LoadingScreen';
import { Send, MessageCircle, Users as UsersIcon, AlertCircle } from 'lucide-react';

export default function MessagesPage() {
  const { user, token, loading: authLoading } = useAuth();
  const { isCollapsed } = useSidebar();
  const router = useRouter();
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState('');
  const [backendError, setBackendError] = useState(false);
  const [newChatUser, setNewChatUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login');
    }
  }, [authLoading, token, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const userId = params.get('userId');
      if (userId && token) {
        startNewConversation(userId);
      }
    }
  }, [token]);

  useEffect(() => {
    if (token && user) {
      fetchConversations();
    }
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
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        const targetUser = data.user;
        
        const existingConvo = conversations.find(c => c.user._id === userId);
        
        if (existingConvo) {
          setSelectedConversation(existingConvo);
        } else {
          const newConvo = {
            user: targetUser,
            lastMessage: null,
            unreadCount: 0,
          };
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
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Server returned non-JSON response');
        setBackendError(true);
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      
      if (res.ok) {
        setConversations(data.conversations || []);
        setError('');
        setBackendError(false);
      } else {
        if (res.status !== 404) {
          console.error('API Error:', data.message);
        }
        setConversations([]);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      if (err.message.includes('fetch')) {
        setBackendError(true);
      }
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const res = await fetch(`${baseUrl}/messages/${userId}?limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Server returned non-JSON response for messages');
        setError('Unable to load messages. Please try again.');
        return;
      }
      
      const data = await res.json();
      
      if (res.ok) {
        setMessages(data.messages || []);
      } else {
        setError(data.message || 'Failed to load messages');
      }
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
        headers: { 'Authorization': `Bearer ${token}` },
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
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiver: selectedConversation.user._id,
          content: newMessage,
        }),
      });

      if (res.ok) {
        setNewMessage('');
        
        if (newChatUser) {
          setNewChatUser(null);
        }
        
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

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (authLoading || loading) {
    return <LoadingScreen />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />

      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-72'}`}>
        <div className="h-screen flex flex-col">
          {/* Page Header */}
          <div className="px-8 py-8 border-b-2 border-gray-50">
            <PageHeader
              title="Messages"
              subtitle="Chat with your classmates"
            />
          </div>

          {/* Backend Error Warning */}
          {backendError && (
            <div className="bg-yellow-50 border-b-2 border-yellow-100 px-8 py-4">
              <div className="flex items-center gap-3 text-yellow-800">
                <AlertCircle className="w-5 h-5" strokeWidth={2} />
                <p className="text-sm font-medium">
                  Unable to connect to messaging service. Please make sure the backend is running on port 4000.
                </p>
              </div>
            </div>
          )}

          {/* Messages Layout */}
          <div className="flex-1 flex overflow-hidden">
            {/* Conversations List */}
            <div className="w-full sm:w-80 lg:w-96 border-r-2 border-gray-50 flex flex-col overflow-hidden">
              <div className="p-6 border-b-2 border-gray-50">
                <h2 className="text-xl font-semibold text-gray-900">Conversations</h2>
              </div>

              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-12 text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" strokeWidth={1.5} />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                      Start a conversation with your friends!
                    </p>
                    <button
                      onClick={() => router.push('/friends')}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-6 py-3 rounded-full hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                    >
                      Go to Friends
                    </button>
                  </div>
                ) : (
                  <div>
                    {conversations.map((conversation) => (
                      <button
                        key={conversation.user._id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`w-full p-5 hover:bg-gray-50 transition text-left border-b border-gray-50 ${
                          selectedConversation?.user._id === conversation.user._id
                            ? 'bg-indigo-50 border-l-4 border-indigo-600'
                            : ''
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
                            <span className="text-white font-semibold text-lg">
                              {conversation.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {conversation.user.name}
                              </h3>
                              {conversation.lastMessage && (
                                <span className="text-xs text-gray-400 ml-2 flex-shrink-0 font-medium">
                                  {formatTime(conversation.lastMessage.createdAt)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mb-2 truncate">
                              {conversation.user.major}
                            </p>
                            {conversation.lastMessage && (
                              <p className="text-sm text-gray-600 truncate">
                                {conversation.lastMessage.content}
                              </p>
                            )}
                            {conversation.unreadCount > 0 && (
                              <span className="inline-block mt-2 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
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
            <div className="flex-1 flex flex-col bg-white">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="border-b-2 border-gray-50 px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <span className="text-white font-semibold text-lg">
                          {selectedConversation.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {selectedConversation.user.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {selectedConversation.user.major}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-8 space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" strokeWidth={1.5} />
                          <p className="text-gray-500 text-lg">
                            {newChatUser 
                              ? `Start a conversation with ${selectedConversation.user.name}!`
                              : "Say hi to start the conversation!"
                            }
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
                                className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                                  isCurrentUser
                                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                                    : 'bg-gray-50 text-gray-900'
                                } rounded-3xl px-5 py-3`}
                              >
                                <p className="text-sm break-words leading-relaxed">{message.content}</p>
                                <p
                                  className={`text-xs mt-2 font-medium ${
                                    isCurrentUser ? 'text-indigo-100' : 'text-gray-400'
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
                  <div className="border-t-2 border-gray-50 p-6">
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-5 py-4 border-2 border-gray-100 rounded-2xl focus:border-indigo-300 focus:outline-none transition"
                        disabled={sendingMessage}
                      />
                      <button
                        type="submit"
                        disabled={sendingMessage || !newMessage.trim()}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-8 py-4 rounded-2xl transition disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-indigo-500/30 flex items-center gap-2"
                      >
                        <Send className="w-5 h-5" strokeWidth={2} />
                        {sendingMessage ? 'Sending...' : 'Send'}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-20 h-20 mx-auto mb-6 text-gray-300" strokeWidth={1.5} />
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                      Select a conversation
                    </h3>
                    <p className="text-gray-500 text-lg">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="fixed bottom-8 right-8 bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-xl max-w-md z-50">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5" strokeWidth={2} />
                <span className="font-medium">{error}</span>
                <button
                  onClick={() => setError('')}
                  className="ml-2 text-red-900 hover:text-red-700 font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}