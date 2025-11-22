// app/components/course-detail/CourseChat.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext'; 

export default function CourseChat({ classId, token, baseUrl }) {
  const { user } = useAuth(); 
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [msgCount, setMsgCount] = useState(0);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${baseUrl}/classes/${classId}/posts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
        if (res.ok) {
            setMessages(data.posts || []);
            setMsgCount(data.count);
        }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const res = await fetch(`${baseUrl}/classes/${classId}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newMessage })
      });

      if (res.ok) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };


  const handleEditMessage = (messageId, currentContent) => {
    setEditingMessageId(messageId);
    setEditContent(currentContent);
  };


  const handleSaveEdit = async (messageId) => {
    try {
      const res = await fetch(`${baseUrl}/classes/${classId}/posts/${messageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: editContent })
      });

      if (res.ok) {
        setEditingMessageId(null);
        setEditContent('');
        fetchMessages();
      }
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };


  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const res = await fetch(`${baseUrl}/classes/${classId}/posts/${messageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        fetchMessages();
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
      {/* Chat Header */}
        <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          Class Chat
        </h2>
        <p className="text-sm text-gray-600 mt-1">
        {msgCount} {msgCount == 1 ? "message": "messages"}
        </p>
      </div>
      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">💭</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-600">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
                const showDate = index === 0 || 
                new Date(messages[index - 1].createdAt).toDateString() !== 
                new Date(message.createdAt).toDateString();

                const isOwnMessage = message.author?._id?.toString() === user?._id?.toString();
                console.log('Message author ID:', message.author?._id);
                console.log('Current user ID:', user?.id);
                console.log('Is own message:', isOwnMessage);

              return (
                <div key={message._id}>
                  {/* Date Separator */}
                  {showDate && (
                    <div className="flex items-center justify-center my-4">
                      <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                        {new Date(message.createdAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className="flex items-start gap-3 hover:bg-white/50 p-2 rounded-lg transition group">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {message.author?.name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-semibold text-gray-900 text-sm">
                          {message.author?.name || 'Anonymous'}
                        </span>
                        {message.author?.major && (
                          <span className="text-xs text-gray-500">
                            {message.author.major}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {new Date(message.createdAt).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </span>
                        {isOwnMessage && (
                          <div className="flex gap-2 ml-auto opacity-0 group-hover:opacity-100 transition">
                            {editingMessageId !== message._id ? (
                              <>
                                <button
                                  onClick={() => handleEditMessage(message._id, message.content)}
                                  className="text-xs text-gray-400 hover:text-indigo-600"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteMessage(message._id)}
                                  className="text-xs text-gray-400 hover:text-red-600"
                                >
                                  Delete
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setEditingMessageId(null)}
                                className="text-xs text-gray-400 hover:text-gray-600"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      {editingMessageId === message._id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            rows="2"
                          />
                          <button
                            onClick={() => handleSaveEdit(message._id)}
                            className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <p className="text-gray-700 text-sm break-words whitespace-pre-wrap">
                          {message.content}
                          {message.editedAt && (
                            <span className="text-xs text-gray-400 ml-2">(edited)</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message... (Press Enter to send)"
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              rows="1"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            <div className="absolute right-3 bottom-3 text-xs text-gray-400">
              {newMessage.length > 0 && `${newMessage.length} chars`}
            </div>
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 max-h-full py-2"
          >
            {sending ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <>
                <span>Send</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}