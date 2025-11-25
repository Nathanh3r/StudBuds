// components/course-detail/StudyGroups.jsx
'use client';

import { useState } from 'react';
import { useDarkMode } from '../../context/DarkModeContext';
import { useStudyGroups } from '../../hooks/useCourseActivity';
import {
  createStudyGroup,
  joinStudyGroup,
  leaveStudyGroup,
  deleteStudyGroup,
} from '../../lib/api/courseActivity';
import LoadingSpinner from '../LoadingSpinner';
import EmptyState from '../EmptyState';
import { Users, Plus, Calendar, MapPin, User as UserIcon } from 'lucide-react';
import { useGamification } from '../../context/GamificationContext';


/**
 * StudyGroups Component
 * 
 * Manages study groups for a class:
 * - View all study groups
 * - Create new groups
 * - Join/leave groups
 * - Delete groups (creator only)
 * 
 * @param {string} classId - Class ID
 * @param {string} token - Auth token
 * @param {object} user - Current user object
 */
export default function StudyGroups({ classId, token, user }) {
  const { darkMode } = useDarkMode();
  const { studyGroups, loading, refetch, setStudyGroups } = useStudyGroups(classId, token);
  const { handleXPAward } = useGamification();
  const [groupActionLoading, setGroupActionLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    scheduledAt: '',
    location: '',
  });

  const handleCreateStudyGroup = async (e) => {
    e.preventDefault();

    if (!newGroup.name || !newGroup.name.trim()) {
      alert('Group name is required');
      return;
    }

    setGroupActionLoading(true);

    try {
      const { group, xpAwarded } = await createStudyGroup(
        classId,
        newGroup,
        token
      );

      if (xpAwarded) {
        handleXPAward(xpAwarded);
      }

      setStudyGroups((prev) => [group, ...prev]);

      setNewGroup({
        name: '',
        description: '',
        scheduledAt: '',
        location: '',
      });
      setShowCreateForm(false);
    } catch (err) {
      alert(err.message || 'Failed to create study group');
    } finally {
      setGroupActionLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    setGroupActionLoading(true);

    try {
      const { group: updatedGroup, xpAwarded } = await joinStudyGroup(
        classId,
        groupId,
        token
      );

      if (xpAwarded) {
        handleXPAward(xpAwarded);
      }

      setStudyGroups((prev) =>
        prev.map((g) => (g._id === groupId ? updatedGroup : g))
      );
    } catch (err) {
      alert(err.message || 'Failed to join study group');
    } finally {
      setGroupActionLoading(false);
    }
  };


  const handleLeaveGroup = async (groupId) => {
    setGroupActionLoading(true);

    try {
      const updatedGroup = await leaveStudyGroup(classId, groupId, token);
      
      // Optimistic update
      setStudyGroups((prev) =>
        prev.map((g) => (g._id === groupId ? updatedGroup : g))
      );
    } catch (err) {
      alert(err.message || 'Failed to leave study group');
    } finally {
      setGroupActionLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm("Delete this study group? This can't be undone.")) {
      return;
    }

    setGroupActionLoading(true);

    try {
      await deleteStudyGroup(classId, groupId, token);
      
      // Optimistic update
      setStudyGroups((prev) => prev.filter((g) => g._id !== groupId));
    } catch (err) {
      alert(err.message || 'Failed to delete study group');
    } finally {
      setGroupActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`rounded-xl shadow-sm border ${
        darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        <LoadingSpinner message="Loading study groups..." darkMode={darkMode} />
      </div>
    );
  }

  return (
    <div className={`rounded-xl shadow-sm border ${
      darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'
    }`}>
      {/* Header */}
      <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Study Groups
            </h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {studyGroups.length} {studyGroups.length === 1 ? 'group' : 'groups'} available
            </p>
          </div>

          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" strokeWidth={2} />
              Create Group
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Create form */}
        {showCreateForm && (
          <StudyGroupForm
            newGroup={newGroup}
            setNewGroup={setNewGroup}
            onSubmit={handleCreateStudyGroup}
            onCancel={() => setShowCreateForm(false)}
            loading={groupActionLoading}
            darkMode={darkMode}
          />
        )}

        {/* Empty state */}
        {studyGroups.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No study groups yet"
            description="Be the first to create a study group!"
            actionLabel="Create Study Group"
            onAction={() => setShowCreateForm(true)}
            darkMode={darkMode}
          />
        ) : (
          /* List of groups */
          <div className="space-y-3">
            {studyGroups.map((group) => (
              <StudyGroupCard
                key={group._id}
                group={group}
                user={user}
                onJoin={handleJoinGroup}
                onLeave={handleLeaveGroup}
                onDelete={handleDeleteGroup}
                loading={groupActionLoading}
                darkMode={darkMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * StudyGroupForm - Subcomponent for creating study groups
 */
function StudyGroupForm({ newGroup, setNewGroup, onSubmit, onCancel, loading, darkMode }) {
  return (
    <form onSubmit={onSubmit} className={`rounded-xl p-6 border ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
    }`}>
      <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Create New Study Group
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Group Name *
          </label>
          <input
            type="text"
            value={newGroup.name}
            onChange={(e) =>
              setNewGroup((prev) => ({ ...prev, name: e.target.value }))
            }
            className={`w-full border rounded-lg px-4 py-2.5 text-sm ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            placeholder="CS180 Midterm 1 Review"
            required
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Description
          </label>
          <textarea
            value={newGroup.description}
            onChange={(e) =>
              setNewGroup((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            className={`w-full border rounded-lg px-4 py-2.5 text-sm ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            placeholder="Topics, expectations, etc."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={newGroup.scheduledAt}
              onChange={(e) =>
                setNewGroup((prev) => ({
                  ...prev,
                  scheduledAt: e.target.value,
                }))
              }
              className={`w-full border rounded-lg px-4 py-2.5 text-sm ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Location
            </label>
            <input
              type="text"
              value={newGroup.location}
              onChange={(e) =>
                setNewGroup((prev) => ({
                  ...prev,
                  location: e.target.value,
                }))
              }
              className={`w-full border rounded-lg px-4 py-2.5 text-sm ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Library Room 204"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition ${
              loading ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition ${
              darkMode 
                ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

/**
 * StudyGroupCard - Subcomponent for displaying a study group
 */
function StudyGroupCard({ group, user, onJoin, onLeave, onDelete, loading, darkMode }) {
  const isMember = group.members?.some((m) => m._id === user?._id);
  const isCreator = group.createdBy?._id === user?._id;

  return (
    <div
      className={`rounded-xl p-6 transition-all duration-300 border ${
        darkMode 
          ? 'bg-gray-800 border-gray-700 hover:border-indigo-500' 
          : 'bg-white border-gray-200 hover:border-indigo-200 hover:shadow-lg'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {group.name}
          </h3>

          {group.description && (
            <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {group.description}
            </p>
          )}
        </div>

        {/* Member badge */}
        {isMember && (
          <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
            darkMode 
              ? 'bg-indigo-900/50 text-indigo-300' 
              : 'bg-indigo-100 text-indigo-700'
          }`}>
            Joined
          </span>
        )}
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* Scheduled time */}
        {group.scheduledAt && (
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              darkMode ? 'bg-blue-900/40' : 'bg-blue-50'
            }`}>
              <Calendar className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Time</p>
              <p className={`font-medium text-xs leading-tight truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {new Date(group.scheduledAt).toLocaleString([], { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: 'numeric', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        )}

        {/* Location */}
        {group.location && (
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              darkMode ? 'bg-emerald-900/40' : 'bg-emerald-50'
            }`}>
              <MapPin className={`w-4 h-4 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Location</p>
              <p className={`font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {group.location}
              </p>
            </div>
          </div>
        )}

        {/* Members */}
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            darkMode ? 'bg-purple-900/40' : 'bg-purple-50'
          }`}>
            <Users className={`w-4 h-4 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Members</p>
            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {group.members?.length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`flex items-center gap-2 pt-4 border-t ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        {isMember ? (
          <button
            onClick={() => onLeave(group._id)}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
              darkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            Leave Group
          </button>
        ) : (
          <button
            onClick={() => onJoin(group._id)}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-semibold ${
              loading ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            Join Group
          </button>
        )}

        {isCreator && (
          <button
            onClick={() => onDelete(group._id)}
            disabled={loading}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition border ${
              darkMode
                ? 'border-red-900/50 text-red-400 hover:bg-red-900/20'
                : 'border-red-200 text-red-600 hover:bg-red-50'
            } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}