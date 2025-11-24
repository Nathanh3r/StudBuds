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
import { useDarkMode } from '../../context/DarkModeContext';

export default function StudyFeed({ classId, token, baseUrl }) {
  const { darkMode } = useDarkMode();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [showLogModal, setShowLogModal] = useState(false);

  const filterValue = filter === 'my-sessions' ? user?._id : 'all';

  const { sessions, count, loading, refetch, setSessions } = useStudySessions(
    classId, token, filterValue
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
      refetch();
    } catch (error) {
      console.error('Error liking session:', error);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this study session?')) return;
    try {
      await deleteStudySession(sessionId, token);
      setSessions(prev => prev.filter(s => s._id !== sessionId));
      refetchStats();
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete session');
    }
  };

  if (loading) {
    return (
      <div className={`rounded-xl shadow-sm border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
        <LoadingSpinner message="Loading study sessions..." />
      </div>
    );
  }

  return (
    <>
      <div className={`rounded-xl shadow-sm border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>

        {/* Header */}
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Study Sessions
          </h2>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {count} {count === 1 ? 'study session' : 'study sessions'} created
          </p>
        </div>

        {/* Filters and Actions */}
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'all'
                    ? 'bg-indigo-100 text-indigo-700'
                    : darkMode
                      ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
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
                    : darkMode
                      ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                My Sessions
              </button>
            </div>

            <button
              onClick={() => setShowLogModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              <span className="hidden sm:inline">Log Session</span>
              <span className="sm:hidden">Log</span>
            </button>
          </div>

          {userStats && <UserStatsPanel stats={userStats} darkMode={darkMode} />}
        </div>

        {/* Sessions List */}
        <div className="p-6">
          {sessions.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={filter === 'my-sessions' ? 'No sessions logged yet' : 'No study sessions yet'}
              description={filter === 'my-sessions' ? 'Start tracking your study progress!' : 'Be the first to log a study session!'}
              actionLabel="Log Your First Session"
              onAction={() => setShowLogModal(true)}
              darkMode = {darkMode}
            />
          ) : (
            <div className="space-y-4">
              {sessions.map(session => (
                <StudySessionCard
                  key={session._id}
                  session={session}
                  currentUser={user}
                  onLike={handleLikeSession}
                  onDelete={handleDeleteSession}
                  darkMode={darkMode}
                />
              ))}
            </div>
          )}
        </div>
      </div>

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

/* User Stats Panel */
function UserStatsPanel({ stats, darkMode }) {
  return (
    <div className={`mt-4 rounded-lg p-4 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100'}`}>
      <h3 className={`font-semibold flex items-center gap-2 mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Your Study Stats
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard value={stats.totalHours} label="Total Hours" darkMode={darkMode} />
        <StatCard value={stats.totalSessions} label="Sessions" darkMode={darkMode} />
        <StatCard value={stats.currentStreak} label="Day Streak 🔥" darkMode={darkMode} />
        <StatCard value={stats.averageSessionMinutes} label="Avg Minutes" darkMode={darkMode} />
      </div>
    </div>
  );
}

/* StatCard */
function StatCard({ value, label, darkMode }) {
  return (
    <div className={`rounded-lg p-3 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-indigo-100 text-gray-900'}`}>
      <div className={`text-2xl font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{value}</div>
      <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{label}</div>
    </div>
  );
}

/* StudySessionCard */
function StudySessionCard({ session, currentUser, onLike, onDelete, darkMode }) {
  const isOwnSession = session.userId?._id === currentUser?._id;
  const hasLiked = session.likes?.includes(currentUser?._id);

  return (
    <div className={`rounded-lg p-4 transition ${darkMode ? 'bg-gray-800 border-gray-700 hover:border-indigo-600 hover:shadow-sm' : 'bg-white border border-gray-200 hover:border-indigo-200 hover:shadow-sm'}`}>

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <UserAvatar user={session.userId} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={darkMode ? 'font-semibold text-white' : 'font-semibold text-gray-900'}>
                {session.userId?.name || 'Anonymous'}
              </span>
              {session.userId?.major && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{session.userId.major}</span>
                </>
              )}
            </div>
            <div className={`flex flex-wrap items-center gap-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <span className="flex items-center gap-1">⏱️ {formatDuration(session.duration)}</span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1">📅 {formatSessionDate(session.createdAt)}</span>
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
            className={`text-sm transition ${darkMode ? 'text-gray-400 hover:text-red-600' : 'text-gray-400 hover:text-red-600'}`}
          >
            Delete
          </button>
        )}
      </div>

      <div className="ml-13 space-y-2">
        <h4 className={`flex items-center gap-2 font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          📚 {session.topic}
        </h4>

        {session.subtopics?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {session.subtopics.map((subtopic, idx) => (
              <span key={idx} className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                {subtopic}
              </span>
            ))}
          </div>
        )}

        <div className={`rounded-lg p-3 text-sm ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>💡 What I learned: </span>
          {session.whatILearned}
        </div>

        {session.studyTechnique && (
          <div className={`text-sm flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            🎯 Technique: <span className="font-medium">{session.studyTechnique}</span>
          </div>
        )}

        {session.location && (
          <div className={`text-sm flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            📍 {session.location}
          </div>
        )}
      </div>

      <div className="ml-13 mt-3 pt-3 border-t border-gray-100 flex items-center gap-4">
        <button
          onClick={() => onLike(session._id)}
          className={`flex items-center gap-1 text-sm font-medium transition ${
            hasLiked
              ? 'text-red-500 hover:text-red-600'
              : darkMode
                ? 'text-gray-400 hover:text-red-500'
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