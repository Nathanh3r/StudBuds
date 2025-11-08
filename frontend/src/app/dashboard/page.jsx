'use client';

import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import LoadingScreen from '../components/LoadingScreen';

export default function DashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const { isCollapsed } = useSidebar();
  const router = useRouter();
  const [myClasses, setMyClasses] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login');
    }
  }, [authLoading, token, router]);

  useEffect(() => {
    if (token && user) {
      fetchDashboardData();
    }
  }, [token, user]);

  const fetchDashboardData = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      
      // Fetch all classes
      const classesRes = await fetch(`${baseUrl}/classes`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const classesData = await classesRes.json();
      
      // Filter to only show classes the user is a member of
      const allClasses = classesData.classes || [];
      const userClassIds = user.classes || []; // Array of class IDs user is enrolled in
      
      console.log('All classes:', allClasses);
      console.log('User class IDs:', userClassIds);
      
      // Filter classes where user is a member
      const enrolledClasses = allClasses.filter(cls => 
        userClassIds.includes(cls._id)
      );
      
      setMyClasses(enrolledClasses);
      console.log('User enrolled classes:', enrolledClasses);

      // TODO: Fetch recent activity and upcoming events when backend endpoints are ready
      // For now, using mock data
      setRecentActivity([
        {
          id: 1,
          type: 'notes',
          icon: '📄',
          color: 'bg-blue-100',
          title: 'Notes Shared',
          description: 'Mia shared notes in CS180',
          time: '2h ago',
        },
        {
          id: 2,
          type: 'review',
          icon: '✅',
          color: 'bg-green-100',
          title: 'Review Posted',
          description: 'Alex posted a review in Math 33A',
          time: '6h ago',
        },
        {
          id: 3,
          type: 'xp',
          icon: '⚡',
          color: 'bg-yellow-100',
          title: 'XP Earned',
          description: 'You earned 50 XP for a study session',
          time: '4h ago',
        },
      ]);

      setUpcomingEvents([
        {
          id: 1,
          title: 'CS180 Study Group',
          course: 'Operating Systems',
          courseTag: 'Operating Systems',
          time: 'Tomorrow, 3 PM – 5 PM',
          location: 'Library Room 204',
          attendees: 5,
        },
        {
          id: 2,
          title: 'Math 33A Review',
          course: 'Linear Algebra',
          courseTag: 'Linear Algebra',
          time: 'Friday, 1 PM – 3 PM',
          location: 'Math Building 101',
          attendees: 8,
        },
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Page Header */}
          <PageHeader
            title={`Welcome back, ${user.name}!`}
            subtitle="Here's what's new in your classes today"
          />

          {/* Recent Activity Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${activity.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <span className="text-2xl">{activity.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Your Courses Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Your Courses</h2>
              <Link href="/discover" className="text-indigo-600 hover:text-indigo-700 font-medium">
                View All
              </Link>
            </div>

            {myClasses.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <p className="text-gray-500 text-lg mb-4">You haven't joined any classes yet</p>
                <Link
                  href="/discover"
                  className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition"
                >
                  Discover Classes
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {myClasses.slice(0, 4).map((course) => (
                  <Link
                    key={course._id}
                    href={`/classes/${course._id}`}
                    className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📚</span>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{course.code}</h3>
                    <p className="text-sm text-gray-500 mb-3">Fall 2025</p>
                    <p className="text-gray-700 mb-3 text-sm">{course.name}</p>
                    <p className="text-xs text-gray-500">{course.memberCount} students</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Study Sessions Section */}
          {upcomingEvents.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Study Sessions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                      <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
                        {event.courseTag}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="text-lg">🕐</span>
                        <span className="text-sm">{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="text-lg">📍</span>
                        <span className="text-sm">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="text-lg">👥</span>
                        <span className="text-sm">{event.attendees} students attending</span>
                      </div>
                    </div>

                    <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition">
                      Join Session
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}