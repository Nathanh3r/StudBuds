// app/classes/[id]/page.jsx
'use client';

import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingScreen from '../../components/LoadingScreen';
import Sidebar from '../../components/Sidebar';
import CourseHeader from '../../components/CourseHeader';
import CourseJoinPrompt from '../../components/course-detail/CourseJoinPrompt';
import CourseOverview from '../../components/course-detail/CourseOverview';
import CourseNotes from '../../components/course-detail/CourseNotes';
import StudyFeed from '../../components/course-detail/StudyFeed';
import CourseChat from '../../components/course-detail/CourseChat';
import CoursePeople from '../../components/course-detail/CoursePeople';
import StudyGroups from '../../components/course-detail/StudyGroups';
import AddNoteModal from '../../components/course-detail/AddNoteModal';
import Link from 'next/link';
  
export default function CourseDetailPage() {
  const { token, user, loading: authLoading } = useAuth();
  const { isCollapsed } = useSidebar();
  const router = useRouter();
  const params = useParams();
  const classId = params.id;

  const [classData, setClassData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login');
    }
  }, [authLoading, token, router]);

  // Fetch class data
  useEffect(() => {
    if (token && classId) {
      fetchClassData();
    }
  }, [token, classId]);

  const fetchClassData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/classes/${classId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (res.ok) {
        setClassData(data);
      } else {
        setError(data.message || 'Failed to load class');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load class');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = async () => {
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
    { id: 'chat', label: 'Chat' },
    { id: 'notes', label: 'Notes' },
    { id: 'study-feed', label: 'Study Feed' },
    { id: 'study-groups', label: 'Study Groups' },
    { id: 'people', label: 'People' },
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
              <div className="text-6xl mb-4">😕</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link 
                href="/discover"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition"
              >
                Browse Courses
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
      <Sidebar />

      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Course Header */}
          <CourseHeader
            code={classData.code}
            name={classData.name}
            term={classData.term}
            instructor={classData.instructor?.name}
            studentCount={classData.memberCount}
          />

          {/* Join Prompt or Course Content */}
          {!isCurrentUserMember ? (
            <CourseJoinPrompt 
              courseCode={classData.code}
              onJoin={handleJoinClass}
            />
          ) : (
            <>
              {/* Tabs */}
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
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                {activeTab === 'overview' && <CourseOverview classData={classData} />}
                {activeTab === 'notes' && <CourseNotes classId={classId} token={token} baseUrl={baseUrl} />}
                {activeTab === 'study-feed' && <StudyFeed classId={classId} token={token} baseUrl={baseUrl} />}
                {activeTab === 'chat' && <CourseChat classId={classId} token={token} baseUrl={baseUrl} />}
                {activeTab === 'people' && <CoursePeople classId={classId} token={token} baseUrl={baseUrl} />}
                {activeTab === 'study-groups' && <StudyGroups classId={classId} token={token} baseUrl={baseUrl} />}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}