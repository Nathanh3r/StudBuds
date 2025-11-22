// app/my-courses/page.jsx
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
import { BookOpen, ChevronRight } from 'lucide-react';

export default function MyCoursesPage() {
  const { user, token, loading: authLoading } = useAuth();
  const { isCollapsed } = useSidebar();
  const router = useRouter();
  
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login');
    }
  }, [authLoading, token, router]);

  useEffect(() => {
    if (token && user) {
      fetchMyCourses();
    }
  }, [token, user]);

  const fetchMyCourses = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      
      const res = await fetch(`${baseUrl}/classes`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      
      // Filter to only courses user is enrolled in
      const enrolledCourses = data.classes.filter(course => 
        course.isUserMember || user.courses?.includes(course._id)
      );
      
        setMyCourses(enrolledCourses);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingScreen />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
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
            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-20 text-center border-2 border-indigo-100">
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <BookOpen className="w-48 h-48 text-indigo-600" strokeWidth={1} />
                </div>
                <div className="relative z-10">
                  <div className="bg-white w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <BookOpen className="w-10 h-10 text-indigo-600" strokeWidth={2} />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                    No courses yet
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
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
              {/* For horizontal cards */}
              {myCourses.map((course) => (
                <MyCourseCard key={course._id} course={course} />
              ))}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}