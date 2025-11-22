// app/components/course-detail/StudyGroups.jsx
'use client';

import { useState, useEffect } from 'react';
import { useDarkMode } from '../../context/DarkModeContext';

export default function StudyGroups({ classId, token, baseUrl, user }) {
  const { darkMode } = useDarkMode();
  const [studyGroups, setStudyGroups] = useState([]);
  const [groupActionLoading, setGroupActionLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    scheduledAt: "",
    location: "",
  });

  // Fetch study groups on mount
  useEffect(() => {
    if (token && classId) {
      fetchStudyGroups();
    }
  }, [token, classId]);

  const fetchStudyGroups = async () => {
    try {
      const groupsRes = await fetch(`${baseUrl}/classes/${classId}/study-groups`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const groupsData = await groupsRes.json();
      if (groupsRes.ok) setStudyGroups(groupsData.groups || []);
    } catch (err) {
      console.error('Error fetching study groups:', err);
    }
  };

  const handleCreateStudyGroup = async (e) => {
    // so the page doesn't refresh on submit
    e.preventDefault();
  
    // basic validation
    if (!newGroup.name || !newGroup.name.trim()) {
      alert("Group name is required");
      return;
    }
  
    setGroupActionLoading(true);
  
    try {
      const res = await fetch(
        `${baseUrl}/classes/${classId}/study-groups`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newGroup.name.trim(),
            description: newGroup.description.trim(),
            location: newGroup.location.trim(),
            // only send scheduledAt if user picked one
            scheduledAt: newGroup.scheduledAt || undefined,
          }),
        }
      );
  
      const data = await res.json();
  
      if (res.ok) {
        // prepend new group
        setStudyGroups((prev) => [data.group, ...(prev || [])]);
  
        // reset the form
        setNewGroup({
          name: "",
          description: "",
          scheduledAt: "",
          location: "",
        });
  
        // hide the form
        setShowCreateForm(false);
      } else {
        alert(data.message || "Failed to create study group");
      }
    } catch (err) {
      console.error("Error creating study group:", err);
      alert("Failed to create study group");
    } finally {
      setGroupActionLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    setGroupActionLoading(true);

    try {
      const res = await fetch(
        `${baseUrl}/classes/${classId}/study-groups/${groupId}/join`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (res.ok) {
        setStudyGroups((prev) =>
          (prev || []).map((g) => (g._id === groupId ? data.group : g))
        );
      } else {
        alert(data.message || 'Failed to join study group');
      }
    } catch (err) {
      console.error('Error joining study group:', err);
      alert('Failed to join study group');
    } finally {
      setGroupActionLoading(false);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    setGroupActionLoading(true);

    try {
      const res = await fetch(
        `${baseUrl}/classes/${classId}/study-groups/${groupId}/leave`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (res.ok) {
        setStudyGroups((prev) =>
          (prev || []).map((g) => (g._id === groupId ? data.group : g))
        );
      } else {
        alert(data.message || 'Failed to leave study group');
      }
    } catch (err) {
      console.error('Error leaving study group:', err);
      alert('Failed to leave study group');
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
      const res = await fetch(
        `${baseUrl}/classes/${classId}/study-groups/${groupId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (res.ok) {
        // Remove deleted group from the list
        setStudyGroups((prev) =>
          (prev || []).filter((g) => g._id !== groupId)
        );
      } else {
        alert(data.message || "Failed to delete study group");
      }
    } catch (err) {
      console.error("Error deleting study group:", err);
      alert("Failed to delete study group");
    } finally {
      setGroupActionLoading(false);
    }
  };

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
        <form onSubmit={handleCreateStudyGroup} className="space-y-3">
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
              disabled={groupActionLoading}
              className={`bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition ${
                groupActionLoading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {groupActionLoading ? "Creating..." : "Create"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List of groups */}
      {studyGroups.length === 0 && (
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No study groups yet.
        </p>
      )}

      {studyGroups.map((group) => {
        const isMember =
          group.members &&
          user &&
          group.members.some((m) => m._id === user._id);

        const isCreator =
          group.createdBy &&
          user &&
          group.createdBy._id === user._id;

        return (
          <div
            key={group._id}
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
                {group.members ? group.members.length : 0} members
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isMember ? (
                <button
                  onClick={() => handleLeaveGroup(group._id)}
                  disabled={groupActionLoading}
                  className={`text-sm px-3 py-1 border rounded-lg transition ${
                    darkMode 
                      ? 'text-gray-300 border-gray-600 hover:bg-gray-700' 
                      : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                  } ${
                    groupActionLoading ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  Leave
                </button>
              ) : (
                <button
                  onClick={() => handleJoinGroup(group._id)}
                  disabled={groupActionLoading}
                  className={`text-sm px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition ${
                    groupActionLoading ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  Join
                </button>
              )}

              {isCreator && (
                <button
                  onClick={() => handleDeleteGroup(group._id)}
                  disabled={groupActionLoading}
                  className={`text-sm px-3 py-1 border border-red-400 text-red-600 rounded-lg hover:bg-red-50 transition ${
                    groupActionLoading ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}