// app/components/course-detail/StudyFeed.jsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import LogStudySessionModal from './LogStudySessionModal';

export default function StudyFeed({ classId, token, baseUrl }) {
  const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
 const [stats, setStats] = useState(null);
  const [sessionsLength, setSessionsLength] = useState(0);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' or 'my-sessions'

  useEffect(() => {
    fetchSessions();
    fetchUserStats();
  }, [filter]);

  const fetchSessions = async () => {
    try {
      const url = filter === 'my-sessions' 
        ? `${baseUrl}/classes/${classId}/study-sessions?userId=${user._id}`
        : `${baseUrl}/classes/${classId}/study-sessions`;
        
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSessions(data.studySessions || []);
          setStats(data.stats);
          setSessionsLength(data.count);
      }
    } catch (error) {
      console.error('Error fetching study sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const res = await fetch(`${baseUrl}/classes/${classId}/study-sessions/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUserStats(data);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleSessionLogged = () => {
    setShowLogModal(false);
    fetchSessions();
    fetchUserStats();
  };

  const handleLikeSession = async (sessionId) => {
    try {
      const res = await fetch(`${baseUrl}/study-sessions/${sessionId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchSessions();
      }
    } catch (error) {
      console.error('Error liking session:', error);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this study session?')) return;

    try {
      const res = await fetch(`${baseUrl}/study-sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchSessions();
        fetchUserStats();
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'challenging': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading study sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Study Sessions Feed */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          Study Sessions
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {sessionsLength} {sessionsLength === 1 ? 'study session' : 'study sessions'} created
        </p>
      </div>
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

            {/* Action Buttons */}
            <div className="flex gap-2">
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
          </div>

          {/* Collapsible Stats Panel */}
          {userStats && (
            <div className="mt-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100 animate-slideDown">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  Your Study Stats
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded-lg p-3 border border-indigo-100">
                  <div className="text-2xl font-bold text-indigo-600">{userStats.totalHours}</div>
                  <div className="text-xs text-gray-600">Total Hours</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-indigo-100">
                  <div className="text-2xl font-bold text-indigo-600">{userStats.totalSessions}</div>
                  <div className="text-xs text-gray-600">Sessions</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-indigo-100">
                  <div className="text-2xl font-bold text-indigo-600">{userStats.currentStreak}</div>
                  <div className="text-xs text-gray-600">Day Streak 🔥</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-indigo-100">
                  <div className="text-2xl font-bold text-indigo-600">{userStats.averageSessionMinutes}</div>
                  <div className="text-xs text-gray-600">Avg Minutes</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sessions List */}
        <div className="p-6">
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📖</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {filter === 'my-sessions' ? 'No sessions logged yet' : 'No study sessions yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'my-sessions' 
                  ? 'Start tracking your study progress!'
                  : 'Be the first to log a study session!'}
              </p>
              <button
                onClick={() => setShowLogModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition inline-flex items-center gap-2"
              >
                <span className="text-xl">+</span>
                Log Your First Session
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => {
                const isOwnSession = session.userId?._id === user?._id;
                const hasLiked = session.likes?.includes(user?._id);

                return (
                  <div
                    key={session._id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-indigo-200 hover:shadow-sm transition"
                  >
                    {/* Session Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-sm">
                            {session.userId?.name?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
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
                              {new Date(session.createdAt).toLocaleDateString()}
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
                          onClick={() => handleDeleteSession(session._id)}
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
                        onClick={() => handleLikeSession(session._id)}
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
              })}
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