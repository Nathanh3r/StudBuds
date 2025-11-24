"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Send, MessageCircle, AlertCircle } from 'lucide-react';
import Link from "next/link"; //allows to go to the game pages

// Context & Hooks
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { useDarkMode } from '../context/DarkModeContext';
import { useConversations } from '../hooks/useConversations';

// Components
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import LoadingScreen from '../components/LoadingScreen';

// API
import { fetchMessages, sendMessage, markMessagesAsRead } from '../lib/api/messages';
import { fetchUserById } from '../lib/api/friends';

export default function MessagesPage() {
  const { user, token, loading: authLoading } = useAuth();
  const { isCollapsed } = useSidebar();
  const { darkMode } = useDarkMode();
  const router = useRouter();

  // Conversations data
  const { conversations, loading, backendError, refetch } = useConversations(token);

  // State
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState('');
  const [newChatUser, setNewChatUser] = useState(null);
  const messagesEndRef = useRef(null);

  // Handle URL params
  useEffect(() => {
    if (typeof window !== 'undefined' && token) {
      const params = new URLSearchParams(window.location.search);
      const userId = params.get('userId');
      if (userId) startNewConversation(userId);
    }
  }, [token]);

  // Load messages when selecting a conversation
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.user._id);
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
      const data = await fetchUserById(userId, token);
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
    } catch (err) {
      setError('Failed to start conversation');
    }
  };

  const loadMessages = async (userId) => {
    try {
      const data = await fetchMessages(userId, token);
      setMessages(data.messages || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load messages');
    }
  };

  const markAsRead = async (userId) => {
    try {
      await markMessagesAsRead(userId, token);
      await refetch();
    } catch (err) {}
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setSendingMessage(true);
    try {
      await sendMessage(selectedConversation.user._id, newMessage, token);
      setNewMessage('');

      if (newChatUser) {
        setNewChatUser(null);
      }

      await loadMessages(selectedConversation.user._id);
      await refetch();
    } catch (err) {
      setError(err.message || 'Failed to send message');
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

  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (!authLoading && !loading) {
      setInitialLoad(false);
    }
  }, [authLoading, loading]);

  if (initialLoad) return <LoadingScreen />;

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>

      <Sidebar />

      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="h-screen flex flex-col">

          {/* HEADER */}
          <div className={`px-8 pt-8 border-b-2 ${
            darkMode ? 'border-gray-800' : 'border-gray-50'
          }`}>
            <PageHeader title="Messages" subtitle="Chat with your classmates" />
          </div>

          {/* game buttons with links to games  */}
          <div className="px-8 pt-4 flex gap-3">
            <Link
              href="/pong"
              className="text-xs px-4 py-2 rounded-full border border-emerald-500 text-emerald-400 hover:bg-emerald-600/20 transition"
            >
              🎮 Play Pong
            </Link>

            {/* term game */}
            <Link
              href="/terms_game"
              className="text-xs px-4 py-2 rounded-full border border-indigo-500 text-indigo-400 hover:bg-indigo-600/20 transition"
            >
              📘 Practice Terms
            </Link>
          </div>

          {/* BACKEND ERROR */}
          {backendError && (
            <div className={`border-b-2 px-8 py-4 ${
              darkMode 
                ? 'bg-yellow-900/50 border-yellow-800' 
                : 'bg-yellow-50 border-yellow-100'
            }`}>
              <div className={`flex items-center gap-3 ${
                darkMode ? 'text-yellow-300' : 'text-yellow-800'
              }`}>
                <AlertCircle className="w-5 h-5" strokeWidth={2} />
                <p className="text-sm font-medium">
                  Unable to connect to messaging service. Please make sure the backend is running.
                </p>
              </div>
            </div>
          )}

          {/* LAYOUT */}
          <div className="flex-1 flex overflow-hidden">

            <ConversationsList
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
              darkMode={darkMode}
              router={router}
              formatTime={formatTime}
            />

            <ChatArea
              selectedConversation={selectedConversation}
              messages={messages}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              sendingMessage={sendingMessage}
              handleSendMessage={handleSendMessage}
              messagesEndRef={messagesEndRef}
              newChatUser={newChatUser}
              user={user}
              darkMode={darkMode}
              formatTime={formatTime}
            />
          </div>

          {/* ERRORS */}
          {error && (
            <div className={`fixed bottom-8 right-8 border-2 px-6 py-4 rounded-2xl shadow-xl max-w-md z-50 ${
              darkMode
                ? 'bg-red-900/90 border-red-700 text-red-200'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{error}</span>
                <button
                  onClick={() => setError('')}
                  className={`ml-2 font-bold ${
                    darkMode ? 'text-red-200' : 'text-red-900'
                  }`}
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

/* SUB COMPONENTS */

function ConversationsList({ conversations, selectedConversation, onSelectConversation, darkMode, router, formatTime }) {
  return (
    <div className={`w-full sm:w-80 lg:w-96 border-r-2 flex flex-col overflow-hidden ${
      darkMode ? 'border-gray-800 bg-gray-800' : 'border-gray-50 bg-white'
    }`}>
      <div className={`p-6 border-b-2 ${
        darkMode ? 'border-gray-700' : 'border-gray-50'
      }`}>
        <h2 className={`text-xl font-semibold ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>Conversations</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-12 text-center">
            <MessageCircle className={`w-16 h-16 mx-auto mb-4 ${
              darkMode ? 'text-gray-600' : 'text-gray-300'
            }`} />
            <h3 className={`text-lg font-semibold mb-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>No messages yet</h3>
            <p className={`text-sm mb-6 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Start a conversation with your friends!
            </p>
            <button
              onClick={() => router.push('/friends')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-6 py-3 rounded-full hover:shadow-lg"
            >
              Go to Friends
            </button>
          </div>
        ) : (
          <div>
            {conversations.map((conversation) => (
              <button
                key={conversation.user._id}
                onClick={() => onSelectConversation(conversation)}
                className={`w-full p-5 transition text-left border-b ${
                  darkMode ? 'border-gray-700' : 'border-gray-50'
                } ${
                  selectedConversation?.user._id === conversation.user._id
                    ? darkMode
                      ? 'bg-gray-700'
                      : 'bg-indigo-50'
                    : darkMode
                    ? 'hover:bg-gray-700'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {conversation.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold truncate ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {conversation.user.name}
                      </h3>
                      {conversation.lastMessage && (
                        <span className={`text-xs ml-2 ${
                          darkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {formatTime(conversation.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mb-2 truncate ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {conversation.user.major}
                    </p>
                    {conversation.lastMessage && (
                      <p className={`text-sm truncate ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {conversation.lastMessage.content}
                      </p>
                    )}
                    {conversation.unreadCount > 0 && (
                      <span className="inline-block mt-2 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full">
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
  );
}

function ChatArea({ 
  selectedConversation, 
  messages, 
  newMessage, 
  setNewMessage, 
  sendingMessage, 
  handleSendMessage,
  messagesEndRef,
  newChatUser,
  user,
  darkMode,
  formatTime
}) {
  if (!selectedConversation) {
    return (
      <div className={`flex-1 flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageCircle className={`w-20 h-20 mx-auto mb-6 ${
              darkMode ? 'text-gray-600' : 'text-gray-300'
            }`} />
            <h3 className={`text-2xl font-semibold mb-3 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Select a conversation
            </h3>
            <p className={`text-lg ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Choose a conversation from the list to start messaging
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>

      <div className={`border-b-2 px-8 py-6 ${
        darkMode ? 'border-gray-800' : 'border-gray-50'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {selectedConversation.user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className={`font-semibold text-lg ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {selectedConversation.user.name}
            </h3>
            <p className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {selectedConversation.user.major}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className={`w-16 h-16 mx-auto mb-4 ${
                darkMode ? 'text-gray-600' : 'text-gray-300'
              }`} />
              <p className={`text-lg ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
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
                    className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-3xl px-5 py-3 ${
                      isCurrentUser
                        ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
                        : darkMode
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-50 text-gray-900'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      isCurrentUser 
                        ? 'text-indigo-100' 
                        : darkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
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

      <div className={`border-t-2 p-6 ${
        darkMode ? 'border-gray-800' : 'border-gray-50'
      }`}>
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className={`flex-1 px-5 py-4 border-2 rounded-2xl ${
              darkMode
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-100 text-gray-900'
            }`}
          />

          <button
            type="submit"
            disabled={sendingMessage || !newMessage.trim()}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-8 py-4 rounded-2xl hover:shadow-lg"
          >
            <Send className="w-5 h-5 inline-block mr-2" />
            {sendingMessage ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>

    </div>
  );
}
