'use client';

import { useRouter } from 'next/navigation';
import { BookOpen, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// Context & Hooks
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { useDarkMode } from '../context/DarkModeContext';
import { useClasses } from '../hooks/useClasses';

// Components
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import LoadingScreen from '../components/LoadingScreen';
import MyCourseCard from '../components/MyCourseCard';

export default function MyCoursesPage() {
  const { user, token, loading: authLoading } = useAuth();
  const { isCollapsed } = useSidebar();
  const { darkMode } = useDarkMode();
  const router = useRouter();

  // Fetch enrolled courses only
  const { classes: myCourses, loading } = useClasses(token, 'enrolled', user);

  // Show loading screen while auth or data is loading
  if (authLoading || loading) {
    return <LoadingScreen />;
  }

  // Redirect if not authenticated
  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <Sidebar />
      
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="max-w-7xl mx-auto px-8 pt-8 pb-16">
          {/* Page Header */}
          <PageHeader
            title="My Courses"
            subtitle={`You're enrolled in ${myCourses.length} ${myCourses.length === 1 ? 'course' : 'courses'}`}
          />

          {/* Courses List */}
          {myCourses.length === 0 ? (
            <div className={`rounded-3xl p-20 text-center border-2 ${
              darkMode 
                ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-gray-700 border-gray-700' 
                : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-indigo-100'
            }`}>
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <BookOpen className={`w-48 h-48 ${
                    darkMode ? 'text-indigo-400' : 'text-indigo-600'
                  }`} strokeWidth={1} />
                </div>
                <div className="relative z-10">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg ${
                    darkMode ? 'bg-gray-700' : 'bg-white'
                  }`}>
                    <BookOpen className={`w-10 h-10 ${
                      darkMode ? 'text-indigo-400' : 'text-indigo-600'
                    }`} strokeWidth={2} />
                  </div>
                  <h3 className={`text-2xl font-semibold mb-3 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    No courses yet
                  </h3>
                  <p className={`mb-8 max-w-md mx-auto ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Start by discovering and joining courses that interest you
                  </p>
                  <Link
                    href="/discover"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-8 py-4 rounded-full hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:scale-105"
                  >
                    Browse Courses
                    <ChevronRight className="w-5 h-5" strokeWidth={2} />
                  </Link>
                </div>
              </div>
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