// app/classes/[id]/page.jsx
'use client';

import { useAuth } from '../../context/AuthContext';
import { useGamification } from '../../context/GamificationContext'; 
import { useSidebar } from '../../context/SidebarContext';
import { useDarkMode } from '../../context/DarkModeContext';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
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
import Link from 'next/link';
import { LogOut } from 'lucide-react';
  
export default function CourseDetailPage() {
  const { token, user, loading: authLoading } = useAuth();
  const { handleXPAward } = useGamification(); 
  const { isCollapsed } = useSidebar();
  const { darkMode } = useDarkMode();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const classId = params.id;
  
  const initialTabFromUrl = searchParams?.get('tab');
  const initialTab =
    initialTabFromUrl === 'study-groups' ? 'study-groups' : 'overview';
  
  const [classData, setClassData] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab);
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
      
      const data = await res.json();
      
      if (res.ok) {
        if (data.xpAwarded) {
          handleXPAward(data.xpAwarded);
        }
        
        // Refresh page after short delay to show XP notification
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setError(data.message || 'Failed to join class');
      }
    } catch (err) {
      setError('Failed to join class');
    }
  };

  const handleLeaveClass = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to leave this class? You can always rejoin later from Discover.'
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`${baseUrl}/classes/${classId}/leave`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/discover'); 
      } else {
        setError(data.message || 'Failed to leave class');
      }
    } catch (err) {
      console.error('Leave class error:', err);
      setError('Failed to leave class');
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
      <div className={`min-h-screen flex ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Sidebar />
        <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">😕</div>
              <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Course Not Found
              </h2>
              <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{error}</p>
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
    <div className={`min-h-screen flex ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar />
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Course Header */}
          <div className="mb-4">
            <CourseHeader
              code={classData.code}
              name={classData.name}
              term={classData.term}
              instructor={classData.instructor?.name}
              studentCount={classData.memberCount}
            />
          </div>

          {/* Join Prompt or Course Content */}
          {!isCurrentUserMember ? (
            <CourseJoinPrompt 
              courseCode={classData.code}
              onJoin={handleJoinClass}
            />
          ) : (
            <>
              {/* Tabs with Leave Button */}
              <div className={`mb-6 border-b flex items-center justify-between ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex gap-4 sm:gap-8 overflow-x-auto flex-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-3 px-1 font-medium transition relative whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'text-indigo-600'
                          : darkMode
                          ? 'text-gray-400 hover:text-gray-200'
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

                {/* Leave Class Button */}
                <button
                  onClick={handleLeaveClass}
                  className={`ml-4 flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    darkMode 
                      ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300' 
                      : 'text-red-600 hover:bg-red-50'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                {activeTab === 'overview' && <CourseOverview classData={classData} />}
                {activeTab === 'notes' && <CourseNotes classId={classId} token={token} baseUrl={baseUrl} />}
                {activeTab === 'study-feed' && <StudyFeed classId={classId} token={token} baseUrl={baseUrl} />}
                {activeTab === 'chat' && <CourseChat classId={classId} token={token} baseUrl={baseUrl} />}
                {activeTab === 'people' && <CoursePeople classId={classId} token={token} baseUrl={baseUrl} />}
                {activeTab === 'study-groups' && (
                  <StudyGroups 
                    classId={classId} 
                    token={token} 
                    baseUrl={baseUrl}
                    user={user}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}