// components/course-detail/StudyFeed.jsx
'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStudySessions, useStudySessionStats } from '../../hooks/useCourseActivity';
import {
  likeStudySession,
  deleteStudySession,
} from '../../lib/api/courseActivity';
import {
  formatDuration,
  getDifficultyColor,
  formatSessionDate,
} from '../../lib/studySessionUtils';
import LoadingSpinner from '../LoadingSpinner';
import EmptyState from '../EmptyState';
import UserAvatar from '../UserAvatar';
import LogStudySessionModal from './LogStudySessionModal';
import { BookOpen } from 'lucide-react';

/**
 * StudyFeed Component
 * 
 * Displays study sessions feed with filtering and statistics
 * 
 * @param {string} classId - Class ID
 * @param {string} token - Auth token
 * @param {string} baseUrl - API base URL
 */
export default function StudyFeed({ classId, token, baseUrl }) {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all'); // 'all' or 'my-sessions'
  const [showLogModal, setShowLogModal] = useState(false);

  // Determine filter for hook
  const filterValue = filter === 'my-sessions' ? user?._id : 'all';
  
  const { sessions, count, loading, refetch, setSessions } = useStudySessions(
    classId, 
    token, 
    filterValue
  );
  const { userStats, refetch: refetchStats } = useStudySessionStats(classId, token);

  const handleSessionLogged = () => {
    setShowLogModal(false);
    refetch();
    refetchStats();
  };

  const handleLikeSession = async (sessionId) => {
    try {
      await likeStudySession(sessionId, token);
      refetch(); // Refetch to get updated likes
    } catch (error) {
      console.error('Error liking session:', error);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this study session?')) return;

    try {
      await deleteStudySession(sessionId, token);
      
      // Optimistic update
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
      refetchStats();
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete session');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <LoadingSpinner message="Loading study sessions..." />
      </div>
    );
  }

  return (
    <>
      {/* Study Sessions Feed */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Study Sessions
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {count} {count === 1 ? 'study session' : 'study sessions'} created
          </p>
        </div>

        {/* Filters and Actions */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between gap-4 mb-4">
            {/* Filter Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'all'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Sessions
              </button>
              <button
                onClick={() => setFilter('my-sessions')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'my-sessions'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                My Sessions
              </button>
            </div>

            {/* Log Session Button */}
            <button
              onClick={() => setShowLogModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              <span className="hidden sm:inline">Log Session</span>
              <span className="sm:hidden">Log</span>
            </button>
          </div>

          {/* User Stats Panel */}
          {userStats && <UserStatsPanel stats={userStats} />}
        </div>

        {/* Sessions List */}
        <div className="p-6">
          {sessions.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={filter === 'my-sessions' ? 'No sessions logged yet' : 'No study sessions yet'}
              description={
                filter === 'my-sessions' 
                  ? 'Start tracking your study progress!'
                  : 'Be the first to log a study session!'
              }
              actionLabel="Log Your First Session"
              onAction={() => setShowLogModal(true)}
            />
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <StudySessionCard
                  key={session._id}
                  session={session}
                  currentUser={user}
                  onLike={handleLikeSession}
                  onDelete={handleDeleteSession}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Log Study Session Modal */}
      <LogStudySessionModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        onSessionLogged={handleSessionLogged}
        classId={classId}
        token={token}
        baseUrl={baseUrl}
      />
    </>
  );
}

/**
 * UserStatsPanel - Display user's study statistics
 */
function UserStatsPanel({ stats }) {
  return (
    <div className="mt-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
        Your Study Stats
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard value={stats.totalHours} label="Total Hours" />
        <StatCard value={stats.totalSessions} label="Sessions" />
        <StatCard value={stats.currentStreak} label="Day Streak 🔥" />
        <StatCard value={stats.averageSessionMinutes} label="Avg Minutes" />
      </div>
    </div>
  );
}

/**
 * StatCard - Individual stat display
 */
function StatCard({ value, label }) {
  return (
    <div className="bg-white rounded-lg p-3 border border-indigo-100">
      <div className="text-2xl font-bold text-indigo-600">{value}</div>
      <div className="text-xs text-gray-600">{label}</div>
    </div>
  );
}

/**
 * StudySessionCard - Display a single study session
 */
function StudySessionCard({ session, currentUser, onLike, onDelete }) {
  const isOwnSession = session.userId?._id === currentUser?._id;
  const hasLiked = session.likes?.includes(currentUser?._id);

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-indigo-200 hover:shadow-sm transition">
      {/* Session Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <UserAvatar user={session.userId} size="md" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900">
                {session.userId?.name || 'Anonymous'}
              </span>
              {session.userId?.major && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-500">{session.userId.major}</span>
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <span>⏱️</span>
                {formatDuration(session.duration)}
              </span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1">
                <span>📅</span>
                {formatSessionDate(session.createdAt)}
              </span>
              <span className="text-gray-300">•</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(session.difficulty)}`}>
                {session.difficulty}
              </span>
            </div>
          </div>
        </div>
        
        {isOwnSession && (
          <button
            onClick={() => onDelete(session._id)}
            className="text-gray-400 hover:text-red-600 transition text-sm"
          >
            Delete
          </button>
        )}
      </div>

      {/* Session Content */}
      <div className="ml-13 space-y-2">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <span>📚</span>
          {session.topic}
        </h4>
        
        {session.subtopics && session.subtopics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {session.subtopics.map((subtopic, idx) => (
              <span
                key={idx}
                className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
              >
                {subtopic}
              </span>
            ))}
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
          <span className="font-medium text-gray-900">💡 What I learned: </span>
          {session.whatILearned}
        </div>

        {session.studyTechnique && (
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <span>🎯</span>
            <span>Technique: <span className="font-medium">{session.studyTechnique}</span></span>
          </div>
        )}

        {session.location && (
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <span>📍</span>
            <span>{session.location}</span>
          </div>
        )}
      </div>

      {/* Session Footer */}
      <div className="ml-13 mt-3 pt-3 border-t border-gray-100 flex items-center gap-4">
        <button
          onClick={() => onLike(session._id)}
          className={`flex items-center gap-1 text-sm font-medium transition ${
            hasLiked
              ? 'text-red-500 hover:text-red-600'
              : 'text-gray-500 hover:text-red-500'
          }`}
        >
          <span className="text-lg">{hasLiked ? '❤️' : '🤍'}</span>
          <span>{session.likes?.length || 0}</span>
        </button>
      </div>
    </div>
  );
}