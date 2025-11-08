'use client';

import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { useRouter, useParams } from 'next/navigation';
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
  const classId = params.id;

  const [classData, setClassData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [members, setMembers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

          // Mock data for announcements and events
          setAnnouncements([
            {
              id: 1,
              title: 'Midterm Exam Schedule',
              content: 'The midterm exam will be held on November 15th. Review materials are now available.',
              timestamp: '2 days ago',
            },
            {
              id: 2,
              title: 'New Reading Assignment',
              content: 'Chapter 8: Virtual Memory - Due next Friday',
              timestamp: '5 days ago',
            },
          ]);

          setUpcomingEvents([
            { id: 1, title: 'Midterm Exam', date: 'Nov 15, 2:00 PM', type: 'exam', color: 'red' },
            { id: 2, title: 'Study Group', date: 'Nov 12, 7:00 PM', type: 'study', color: 'blue' },
            { id: 3, title: 'Assignment Due', date: 'Nov 10, 11:59 PM', type: 'assignment', color: 'green' },
          ]);
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

  const tabs = [
    { id: 'overview', label: 'Overview' },
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
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Course Header */}
          <CourseHeader
            code={classData.code}
            name={classData.name}
            term="Fall 2025"
            instructor="Dr. Miller"
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
                      className={`pb-3 px-1 font-medium transition relative whitespace-nowrap ${
                        activeTab === tab.id
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
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

                      {/* Recent Announcements */}
                      <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Announcements</h2>
                        <div className="space-y-4">
                          {announcements.map((announcement) => (
                            <div key={announcement.id} className="bg-indigo-50 rounded-lg p-4">
                              <h3 className="font-semibold text-gray-900 mb-2">{announcement.title}</h3>
                              <p className="text-sm text-gray-700 mb-2">{announcement.content}</p>
                              <p className="text-xs text-gray-500">{announcement.timestamp}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
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
                  {activeTab === 'study-groups' && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Study Groups</h2>
                      <p className="text-gray-500">Study groups feature coming soon...</p>
                    </div>
                  )}
                </div>

                {/* Sidebar - Upcoming Events */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl shadow-sm p-6 lg:sticky lg:top-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
                    <div className="space-y-3">
                      {upcomingEvents.map((event) => (
                        <div key={event.id} className="flex items-start gap-3">
                          <div className={`w-3 h-3 rounded-full bg-${event.color}-500 mt-1.5 flex-shrink-0`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">{event.title}</p>
                            <p className="text-xs text-gray-500">{event.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}