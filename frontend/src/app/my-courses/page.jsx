'use client';

import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import LoadingScreen from '../components/LoadingScreen';
import MyCourseCard from '../components/MyCourseCard';

export default function MyCoursesPage() {
  const { user, token, loading: authLoading } = useAuth();
  const { isCollapsed } = useSidebar();
  const router = useRouter();

  // Dark mode state
  const [darkMode, setDarkMode] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('darkMode') === 'true' : false
  );

  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !token) router.push('/login');
  }, [authLoading, token, router]);

  useEffect(() => {
    if (token && user) fetchMyCourses();
  }, [token, user]);

  const fetchMyCourses = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const res = await fetch(`${baseUrl}/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      const enrolledCourses = data.classes.filter(
        (course) => course.isUserMember || user.courses?.includes(course._id)
      );

      setMyCourses(enrolledCourses);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return <LoadingScreen />;
  if (!user) return null;

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} min-h-screen flex`}>
      <Sidebar />

      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <PageHeader
            title="My Courses"
            subtitle={`You're enrolled in ${myCourses.length} ${myCourses.length === 1 ? 'course' : 'courses'}`}
          />

          {/* Courses List */}
          {myCourses.length === 0 ? (
            <div className={`${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} rounded-xl shadow-sm p-12 text-center`}>
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">
                No courses yet
              </h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                Start by discovering and joining courses that interest you
              </p>
              <Link
                href="/discover"
                className={`inline-block font-semibold px-6 py-3 rounded-lg transition ${
                  darkMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {myCourses.map((course) => (
                <MyCourseCard key={course._id} course={course} darkMode={darkMode} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
