'use client';

import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingScreen from '../../components/LoadingScreen';
import Sidebar from '../../components/Sidebar';
import CourseHeader from '../../components/CourseHeader';
import Link from 'next/link';

export default function CourseDetailPage() {
  const { token, user, loading: authLoading } = useAuth();
  const { isCollapsed } = useSidebar();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const classId = params.id;
  
  const initialTabFromUrl = searchParams?.get('tab');
  const initialTab =
    initialTabFromUrl === 'study-groups' ? 'study-groups' : 'overview';
  
  const [classData, setClassData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [studyGroups, setStudyGroups] = useState([]);
  const [groupActionLoading, setGroupActionLoading] = useState(false);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    scheduledAt: "",
    location: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login');
    }
  }, [authLoading, token, router]);

  // Fetch data
  useEffect(() => {
    if (token && classId) {
      fetchAllData();
    }
  }, [token, classId]);

  const fetchAllData = async () => {
    setLoading(true);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

    try {
      // Fetch class data
      const classRes = await fetch(`${baseUrl}/classes/${classId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const classData = await classRes.json();
      
      if (classRes.ok) {
        setClassData(classData);
        
        // Only fetch additional data if user is a member
        if (classData.isCurrentUserMember) {
          // Fetch posts
          const postsRes = await fetch(`${baseUrl}/classes/${classId}/posts`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const postsData = await postsRes.json();
          if (postsRes.ok) setPosts(postsData.posts || []);

          // Fetch members
          const membersRes = await fetch(`${baseUrl}/classes/${classId}/members`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const membersData = await membersRes.json();
          if (membersRes.ok) setMembers(membersData.members || []);

          // Fetch study groups
          const groupsRes = await fetch(`${baseUrl}/classes/${classId}/study-groups`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const groupsData = await groupsRes.json();
          if (groupsRes.ok) setStudyGroups(groupsData.groups || []);
        }
      } else {
        setError(classData.message || 'Failed to load class');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load class');
    } finally {
      setLoading(false);
    }
  };


  const handleJoinClass = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    try {
      const res = await fetch(`${baseUrl}/classes/${classId}/join`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to join class');
      }
    } catch (err) {
      setError('Failed to join class');
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
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
  
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
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

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
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

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
    if (!window.confirm("Delete this study group? This can’t be undone.")) {
      return;
    }

    setGroupActionLoading(true);
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

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



  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'sections', label: 'Sections' },
    { id: 'notes', label: 'Notes' },
    { id: 'study-feed', label: 'Study Feed' },
    { id: 'chat', label: 'Chat' },
    { id: 'people', label: 'People' },
    { id: 'study-groups', label: 'Study Groups' },
  ];

  // Loading state
  if (authLoading || loading) {
    return <LoadingScreen />;
  }

  // Error state
  if (error && !classData) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center max-w-md">
              <div className="text-xl text-red-600 mb-4">Error Loading Course</div>
              <div className="text-gray-600 mb-4">{error}</div>
              <Link href="/discover" className="text-indigo-600 hover:underline">
                ← Back to Discover
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !classData) return null;

  const isCurrentUserMember = classData.isCurrentUserMember;

    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content with dynamic left margin */}
        <div
          className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'
            }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Course Header */}
            <CourseHeader
              code={classData.code}
              name={classData.name}
              term={classData.term}
              instructor={classData.instructor.name}
              studentCount={classData.memberCount}
            />

            {/* Show join prompt if not a member */}
            {!isCurrentUserMember ? (
              <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Join this class</h2>
                <p className="text-gray-600 mb-6">
                  Join {classData.code} to access course materials, connect with classmates, and participate in discussions.
                </p>
                <button
                  onClick={handleJoinClass}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg transition"
                >
                  Join {classData.code}
                </button>
              </div>
            ) : (
              <>
                {/* Tabs - Scrollable on mobile */}
                <div className="mb-6 border-b border-gray-200 overflow-x-auto">
                  <div className="flex gap-4 sm:gap-8 min-w-max sm:min-w-0">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-3 px-1 font-medium transition relative whitespace-nowrap ${activeTab === tab.id
                            ? 'text-indigo-600'
                            : 'text-gray-600 hover:text-gray-900'
                          }`}
                      >
                        {tab.label}
                        {activeTab === tab.id && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content - Responsive grid */}
                <div className="flex flex-col gap-6 lg:gap-8">
                  {/* Main Content Area */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                      <>
                        {/* Course Description */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                          <h2 className="text-xl font-bold text-gray-900 mb-4">Course Description</h2>
                          <p className="text-gray-700 leading-relaxed">
                            {classData.description ||
                              "This course covers fundamental concepts of operating systems including process management, memory management, file systems, and system security. Students will gain hands-on experience with Unix/Linux systems and learn about concurrent programming, synchronization, and distributed systems."}
                          </p>
                        </div>
                        {/* Course Details */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                          <h2 className="text-xl font-bold text-gray-900 mb-4">Course Details</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {classData.department && (
                              <div>
                                <span className="font-semibold text-gray-700">Department:</span>
                                <span className="ml-2 text-gray-600">{classData.department}</span>
                              </div>
                            )}
                            {classData.units && (
                              <div>
                                <span className="font-semibold text-gray-700">Units:</span>
                                <span className="ml-2 text-gray-600">{classData.units}</span>
                              </div>
                            )}
                            {classData.instructionalMethod && (
                              <div>
                                <span className="font-semibold text-gray-700">Format:</span>
                                <span className="ml-2 text-gray-600">{classData.instructionalMethod}</span>
                              </div>
                            )}
                            {classData.instructor && classData.instructor.email && (
                              <div>
                                <span className="font-semibold text-gray-700">Email:</span>
                                <a
                                  href={`mailto:${classData.instructor.email}`}
                                  className="ml-2 text-indigo-600 hover:underline"
                                >
                                  {classData.instructor.email}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                    
                    {/* Sections Tab */}
                    {activeTab === 'sections' && (
                      <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Course Sections</h2>
                        {classData.sections && classData.sections.length > 0 ? (
                          <div className="space-y-4">
                            {classData.sections.map((section, idx) => (
                              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h3 className="font-semibold text-gray-900">
                                      Section {section.sectionNumber}
                                    </h3>
                                    <p className="text-sm text-gray-600">{section.scheduleType}</p>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-medium text-gray-900">
                                      {section.enrollment}/{section.maxEnrollment}
                                    </div>
                                    <div className="text-xs text-gray-500">enrolled</div>
                                  </div>
                                </div>
                                {section.instructor && (
                                  <p className="text-sm text-gray-700 mb-2">
                                    <span className="font-medium">Instructor:</span> {section.instructor}
                                  </p>
                                )}
                                {section.meetingTimes && section.meetingTimes.map((mt, i) => {
                                  const isOnline = mt.location?.toLowerCase().includes("online");
                                  return (
                                    <div key={i} className="text-sm text-gray-600">
                                      {mt.days && mt.days.length > 0 && (
                                        <span className="mr-2">{mt.days.join(' ')}</span>
                                      )}
                                      {mt.startTime && mt.endTime && (
                                        <span className="mr-2">{mt.startTime} - {mt.endTime}</span>
                                      )}
                                      {isOnline ? "Online" : mt.location}
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No sections available.</p>
                        )}
                      </div>
                    )}

                    {/* Notes Tab */}
                    {activeTab === 'notes' && (
                      <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Course Notes</h2>
                        <p className="text-gray-500">Notes feature coming soon...</p>
                      </div>
                    )}

                    {/* Study Feed Tab */}
                    {activeTab === 'study-feed' && (
                      <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Study Feed</h2>
                        <div className="space-y-4">
                          {posts.length === 0 ? (
                            <p className="text-gray-500">No posts yet. Be the first to share!</p>
                          ) : (
                            posts.map((post) => (
                              <div key={post._id} className="border-b border-gray-200 pb-4 last:border-0">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-semibold">
                                      {post.author.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                      <span className="font-semibold text-gray-900">{post.author.name}</span>
                                      <span className="text-sm text-gray-500">{post.author.major}</span>
                                    </div>
                                    <p className="text-gray-700 break-words">{post.content}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* Chat Tab */}
                    {activeTab === 'chat' && (
                      <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Class Chat</h2>
                        <p className="text-gray-500">Chat feature coming soon...</p>
                      </div>
                    )}

                    {/* People Tab */}
                    {activeTab === 'people' && (
                      <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Class Members</h2>
                        <div className="space-y-4">
                          {members.map((member) => (
                            <div key={member._id} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition">
                              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-semibold text-lg">
                                  {member.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate">{member.name}</h3>
                                <p className="text-sm text-gray-600 truncate">{member.major}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  {/* Study Groups Tab */}
                  {activeTab === "study-groups" && (
                    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                      <h2 className="text-xl font-bold text-gray-900">Study Groups</h2>

                      {/* Toggle create form */}
                      {!showCreateForm ? (
                        <button
                          onClick={() => setShowCreateForm(true)}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                        >
                          Create Study Group
                        </button>
                      ) : (
                        <form onSubmit={handleCreateStudyGroup} className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Group Name *
                            </label>
                            <input
                              type="text"
                              value={newGroup.name}
                              onChange={(e) =>
                                setNewGroup((prev) => ({ ...prev, name: e.target.value }))
                              }
                              className="w-full border rounded-lg px-3 py-2 text-sm"
                              placeholder="CS180 Midterm 1 Review"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                              className="w-full border rounded-lg px-3 py-2 text-sm"
                              placeholder="Topics, expectations, etc."
                              rows={2}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                placeholder="Library Room 204"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="submit"
                              disabled={groupActionLoading}
                              className={`bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold ${
                                groupActionLoading ? "opacity-60 cursor-not-allowed" : ""
                              }`}
                            >
                              {groupActionLoading ? "Creating..." : "Create"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowCreateForm(false)}
                              className="text-sm text-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}

                      {/* List of groups */}
                      {studyGroups.length === 0 && (
                        <p className="text-gray-500 text-sm">No study groups yet.</p>
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
                            className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                          >
                            <div>
                              <p className="font-semibold text-gray-900">{group.name}</p>

                              {group.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {group.description}
                                </p>
                              )}

                              {(group.scheduledAt || group.location) && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {group.scheduledAt &&
                                    `🕒 ${new Date(group.scheduledAt).toLocaleString()} `}
                                  {group.location && `📍 ${group.location}`}
                                </p>
                              )}

                              <p className="text-sm text-gray-500 mt-1">
                                {group.members ? group.members.length : 0} members
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {isMember ? (
                                <button
                                  onClick={() => handleLeaveGroup(group._id)}
                                  disabled={groupActionLoading}
                                  className={`text-sm px-3 py-1 border rounded-lg text-gray-700 hover:bg-gray-50 ${
                                    groupActionLoading ? "opacity-60 cursor-not-allowed" : ""
                                  }`}
                                >
                                  Leave
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleJoinGroup(group._id)}
                                  disabled={groupActionLoading}
                                  className={`text-sm px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 ${
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
                                  className={`text-sm px-3 py-1 border border-red-400 text-red-600 rounded-lg hover:bg-red-50 ${
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
                  )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }