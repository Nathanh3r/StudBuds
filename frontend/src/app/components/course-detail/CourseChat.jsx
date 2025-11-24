// components/course-detail/CourseChat.jsx
'use client';

import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGamification } from '../../context/GamificationContext'; 
import { useCoursePosts } from '../../hooks/useCourseActivity';
import {
  createCoursePost,
  editCoursePost,
  deleteCoursePost,
} from '../../lib/api/courseActivity';
import { formatSessionDate, formatSessionTime, isSameDay } from '../../lib/studySessionUtils';
import LoadingSpinner from '../LoadingSpinner';
import EmptyState from '../EmptyState';
import UserAvatar from '../UserAvatar';
import { MessageCircle } from 'lucide-react';
import { useDarkMode } from '../../context/DarkModeContext';

export default function CourseChat({ classId, token, baseUrl }) {
  const { user } = useAuth();
  const { handleXPAward } = useGamification(); 
  const { messages, count, loading, refetch, setMessages } = useCoursePosts(classId, token);
  
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState('');
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const { darkMode } = useDarkMode();

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const data = await createCoursePost(classId, newMessage, token);
      
      if (data.xpAwarded) handleXPAward(data.xpAwarded);
      
      setNewMessage('');
      refetch();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
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
      await editCoursePost(classId, messageId, editContent, token);
      setEditingMessageId(null);
      setEditContent('');
      refetch();
    } catch (error) {
      console.error('Error editing message:', error);
      alert('Failed to edit message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await deleteCoursePost(classId, messageId, token);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
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
      <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} rounded-xl shadow-sm h-[600px] flex items-center justify-center`}>
        <LoadingSpinner message="Loading chat..." />
      </div>
    );
  }

  return (
    <div className={`${darkMode ? "bg-gray-900 border-gray-700 shadow-none" : "bg-white border-gray-100 shadow-sm"} rounded-xl flex flex-col h-[600px]`}>

      {/* Chat Header */}
      <div className={`p-6 border-b ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
        <h2 className={`text-xl font-bold flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
          Class Chat
        </h2>
        <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          {count} {count === 1 ? 'message' : 'messages'}
        </p>
      </div>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className={`flex-1 overflow-y-auto p-4 space-y-4 ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              icon={MessageCircle}
              title="No messages yet"
              description="Start the conversation!"
              darkMode={darkMode} // optionally handle darkMode inside EmptyState
            />
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const showDateSeparator =
                index === 0 || !isSameDay(messages[index - 1].createdAt, message.createdAt);
              return (
                <div key={message._id}>
                  {showDateSeparator && <DateSeparator date={message.createdAt} darkMode={darkMode} />}
                  <MessageBubble
                    message={message}
                    currentUser={user}
                    isEditing={editingMessageId === message._id}
                    editContent={editContent}
                    onEdit={handleEditMessage}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={() => setEditingMessageId(null)}
                    onDelete={handleDeleteMessage}
                    onEditContentChange={setEditContent}
                  />
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <MessageInput
        value={newMessage}
        onChange={setNewMessage}
        onSubmit={handleSendMessage}
        onKeyPress={handleKeyPress}
        sending={sending}
      />
    </div>
  );
}

/* ----------------------- CHILD COMPONENTS ----------------------- */

function DateSeparator({ date, darkMode }) {
  return (
    <div className="flex items-center justify-center my-4">
      <div className={`${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'} text-xs px-3 py-1 rounded-full`}>
        {formatSessionDate(date)}
      </div>
    </div>
  );
}

function MessageBubble({ 
  message, 
  currentUser, 
  isEditing, 
  editContent, 
  onEdit, 
  onSaveEdit, 
  onCancelEdit, 
  onDelete,
  onEditContentChange 
}) {
  const { darkMode } = useDarkMode();
  const isOwnMessage = message.author?._id?.toString() === currentUser?._id?.toString();

  return (
    <div className={`flex items-start gap-3 p-2 rounded-lg transition group ${darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-white/50'}`}>
      <UserAvatar user={message.author} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{message.author?.name || 'Anonymous'}</span>
          {message.author?.major && <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{message.author.major}</span>}
          <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{formatSessionTime(message.createdAt)}</span>

          {isOwnMessage && (
            <div className="flex gap-2 ml-auto opacity-0 group-hover:opacity-100 transition">
              {!isEditing ? (
                <>
                  <button onClick={() => onEdit(message._id, message.content)} className={`text-xs hover:text-indigo-600 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>Edit</button>
                  <button onClick={() => onDelete(message._id)} className={`text-xs hover:text-red-600 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>Delete</button>
                </>
              ) : (
                <button onClick={onCancelEdit} className={`text-xs hover:text-gray-600 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>Cancel</button>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => onEditContentChange(e.target.value)}
              className={`w-full px-3 py-2 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border ${
                darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'
              }`}
              rows="2"
            />
            <button onClick={() => onSaveEdit(message._id)} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">Save</button>
          </div>
        ) : (
          <p className={`text-sm break-words whitespace-pre-wrap ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            {message.content}
            {message.editedAt && <span className={`text-xs ml-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}> (edited)</span>}
          </p>
        )}
      </div>
    </div>
  );
}

function MessageInput({ value, onChange, onSubmit, onKeyPress, sending }) {
  const { darkMode } = useDarkMode();

  return (
    <div className={`p-4 border-t ${darkMode ? "border-gray-700 bg-gray-800/80" : "border-gray-200 bg-white"}`}>
      <form onSubmit={onSubmit} className="flex gap-2 items-center">
        <div className="flex-1 relative">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="Type a message... (Press Enter to send)"
            className={`w-full px-4 py-3 pr-12 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
              ${darkMode ? "bg-gray-800 text-white border-gray-700 placeholder-gray-500" : "bg-white text-gray-900 border-gray-300 placeholder-gray-400"}`}
            rows="1"
            style={{ minHeight: "44px", maxHeight: "120px" }}
          />
          {value.length > 0 && (
            <div className={`absolute right-3 bottom-3 text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              {value.length} chars
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!value.trim() || sending}
          className={`font-semibold px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 py-2 
            ${darkMode ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
        >
          {sending ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <span>Send</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
}