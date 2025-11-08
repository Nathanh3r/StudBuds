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

  // Check for userId in URL params (for starting new conversations)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const userId = params.get('userId');
      if (userId && token) {
        startNewConversation(userId);
      }
    }
  }, [token]);

  // Fetch conversations on mount
  useEffect(() => {
    if (token && user) {
      fetchConversations();
    }
  }, [token, user]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.user._id);
      markAsRead(selectedConversation.user._id);
    }
  }, [selectedConversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Start a new conversation with a specific user
  const startNewConversation = async (userId) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      
      // Fetch the user's profile
      const res = await fetch(`${baseUrl}/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        const targetUser = data.user;
        
        // Check if conversation already exists
        const existingConvo = conversations.find(c => c.user._id === userId);
        
        if (existingConvo) {
          // Select existing conversation
          setSelectedConversation(existingConvo);
        } else {
          // Create a new conversation object (it will be saved when first message is sent)
          const newConvo = {
            user: targetUser,
            lastMessage: null,
            unreadCount: 0,
          };
          setNewChatUser(newConvo);
          setSelectedConversation(newConvo);
        }
        
        // Clear the URL parameter
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
      
      // Check if response is JSON
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
        // Only show error if it's not a 404 or empty result
        if (res.status !== 404) {
          console.error('API Error:', data.message);
        }
        setConversations([]);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      // Check if it's a network error
      if (err.message.includes('fetch')) {
        setBackendError(true);
      }
      // Don't show error for empty conversations
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
      
      // Check if response is JSON
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
      // Refresh conversations to update unread counts
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
        
        // If this was a new conversation, clear the newChatUser state
        if (newChatUser) {
          setNewChatUser(null);
        }
        
        // Refresh messages
        await fetchMessages(selectedConversation.user._id);
        // Refresh conversations to update last message and add new conversation to list
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="h-screen flex flex-col">
          {/* Page Header */}
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
            <PageHeader
              title="Messages"
              subtitle="Chat with your classmates"
            />
          </div>

          {/* Backend Error Warning */}
          {backendError && (
            <div className="bg-yellow-50 border-b border-yellow-200 px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center gap-2 text-yellow-800">
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
            <div className="w-full sm:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
              </div>

              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Start a conversation with your friends!
                    </p>
                    <button
                      onClick={() => router.push('/friends')}
                      className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition text-sm"
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
                        className={`w-full p-4 hover:bg-gray-50 transition text-left ${
                          selectedConversation?.user._id === conversation.user._id
                            ? 'bg-indigo-50 border-l-4 border-indigo-600'
                            : ''
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
                              <h3 className="font-semibold text-gray-900 truncate">
                                {conversation.user.name}
                              </h3>
                              {conversation.lastMessage && (
                                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                  {formatTime(conversation.lastMessage.createdAt)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mb-1 truncate">
                              {conversation.user.major}
                            </p>
                            {conversation.lastMessage && (
                              <p className="text-sm text-gray-600 truncate">
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
            <div className="flex-1 flex flex-col bg-gray-50">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {selectedConversation.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedConversation.user.name}
                        </h3>
                        <p className="text-sm text-gray-600">
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
                          <p className="text-gray-500 text-sm">
                            {newChatUser 
                              ? `Start a conversation with ${selectedConversation.user.name}!`
                              : "No messages yet. Say hi to start the conversation!"
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
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-gray-900'
                                } rounded-2xl px-4 py-2 shadow-sm`}
                              >
                                <p className="text-sm break-words">{message.content}</p>
                                <p
                                  className={`text-xs mt-1 ${
                                    isCurrentUser ? 'text-indigo-200' : 'text-gray-500'
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
                  <div className="bg-white border-t border-gray-200 p-4">
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        disabled={sendingMessage}
                      />
                      <button
                        type="submit"
                        disabled={sendingMessage || !newMessage.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-gray-500">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-md z-50">
              {error}
              <button
                onClick={() => setError('')}
                className="ml-4 text-red-900 hover:text-red-700"
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