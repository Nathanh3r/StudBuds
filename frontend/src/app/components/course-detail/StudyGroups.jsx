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
import { Users } from 'lucide-react';
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
      <div className={`rounded-xl shadow-sm p-6 ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        <LoadingSpinner message="Loading study groups..." darkMode={darkMode} />
      </div>
    );
  }

  return (
    <div className={`rounded-xl shadow-sm p-6 space-y-4 ${
      darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
    }`}>
      <h2 className="text-xl font-bold">Study Groups</h2>

      {/* Toggle create form */}
      {!showCreateForm ? (
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
        >
          Create Study Group
        </button>
      ) : (
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
        studyGroups.map((group) => (
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
        ))
      )}
    </div>
  );
}

/**
 * StudyGroupForm - Subcomponent for creating study groups
 */
function StudyGroupForm({ newGroup, setNewGroup, onSubmit, onCancel, loading, darkMode }) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className={`block text-sm font-medium mb-1 ${
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
          className={`w-full border rounded-lg px-3 py-2 text-sm ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
          placeholder="CS180 Midterm 1 Review"
          required
        />
      </div>

      <div>
        <label className={`block text-sm font-medium mb-1 ${
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
          className={`w-full border rounded-lg px-3 py-2 text-sm ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
          placeholder="Topics, expectations, etc."
          rows={2}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className={`block text-sm font-medium mb-1 ${
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
            className={`w-full border rounded-lg px-3 py-2 text-sm ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${
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
            className={`w-full border rounded-lg px-3 py-2 text-sm ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            placeholder="Library Room 204"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={loading}
          className={`bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition ${
            loading ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
        >
          Cancel
        </button>
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
      className={`border rounded-lg p-4 flex items-center justify-between ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}
    >
      <div>
        <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {group.name}
        </p>

        {group.description && (
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {group.description}
          </p>
        )}

        {(group.scheduledAt || group.location) && (
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            {group.scheduledAt &&
              `🕒 ${new Date(group.scheduledAt).toLocaleString()} `}
            {group.location && `📍 ${group.location}`}
          </p>
        )}

        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {group.members?.length || 0} members
        </p>
      </div>

      <div className="flex items-center gap-2">
        {isMember ? (
          <button
            onClick={() => onLeave(group._id)}
            disabled={loading}
            className={`text-sm px-3 py-1 border rounded-lg transition ${
              darkMode 
                ? 'text-gray-300 border-gray-600 hover:bg-gray-700' 
                : 'text-gray-700 border-gray-300 hover:bg-gray-50'
            } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            Leave
          </button>
        ) : (
          <button
            onClick={() => onJoin(group._id)}
            disabled={loading}
            className={`text-sm px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition ${
              loading ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            Join
          </button>
        )}

        {isCreator && (
          <button
            onClick={() => onDelete(group._id)}
            disabled={loading}
            className={`text-sm px-3 py-1 border border-red-400 text-red-600 rounded-lg hover:bg-red-50 transition ${
              loading ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}