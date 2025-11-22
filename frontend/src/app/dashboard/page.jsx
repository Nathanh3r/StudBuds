'use client';

import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { useDarkMode } from '../context/DarkModeContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import LoadingScreen from '../components/LoadingScreen';

export default function DashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const { isCollapsed } = useSidebar();
  const { darkMode } = useDarkMode();
  const router = useRouter();

  const [myClasses, setMyClasses] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [myStudyGroups, setMyStudyGroups] = useState([]);
  const [groupsError, setGroupsError] = useState('');
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !token) router.push('/login');
  }, [authLoading, token, router]);

  // Fetch dashboard data once we have user + token
  useEffect(() => {
    if (token && user) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  const fetchDashboardData = async () => {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

      // 1) Fetch all classes
      const classesRes = await fetch(`${baseUrl}/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const classesData = await classesRes.json();

      const allClasses = classesData.classes || [];
      const userClassIds = user.classes || []; // class IDs user is enrolled in

      const enrolledClasses = allClasses.filter((cls) =>
        userClassIds.includes(cls._id)
      );
      setMyClasses(enrolledClasses);

      // 2) Mock recent activity (same as before)
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

      // 3) Fetch *real* study groups the user is in
      setGroupsError('');
      const groupsRes = await fetch(`${baseUrl}/users/me/study-groups`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const groupsData = await groupsRes.json();

      if (groupsRes.ok) {
        setMyStudyGroups(groupsData.groups || []);
      } else {
        setGroupsError(groupsData.message || 'Failed to load study groups');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setGroupsError('Failed to load study groups');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return <LoadingScreen />;
  if (!user) return null;

  return (
    <div
      className={`min-h-screen flex ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'
      }`}
    >
      <Sidebar />

      <div
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="max-w-7xl mx-auto px-8 py-8">
          <PageHeader
            title={`Welcome back, ${user.name}!`}
            subtitle="Here's what's new in your classes today"
          />

          {/* Recent Activity Section */}
          <div className="mb-8">
            <h2
              className={`text-2xl font-bold mb-4 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Recent Activity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className={`rounded-xl shadow-sm p-6 hover:shadow-md transition ${
                    darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 ${activity.color} rounded-lg flex items-center justify-center flex-shrink-0`}
                    >
                      <span className="text-2xl">{activity.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3
                          className={`font-semibold ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {activity.title}
                        </h3>
                      </div>
                      <p
                        className={`text-sm mb-2 ${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        {activity.description}
                      </p>
                      <p
                        className={`text-xs ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        {activity.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Your Courses Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Your Courses
              </h2>
              <Link
                href="/discover"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View All
              </Link>
            </div>

            {myClasses.length === 0 ? (
              <div
                className={`rounded-xl shadow-sm p-12 text-center ${
                  darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
                }`}
              >
                <p
                  className={`text-lg mb-4 ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  You haven&apos;t joined any classes yet
                </p>
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
                    className={`rounded-xl shadow-sm p-6 hover:shadow-md transition group ${
                      darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
                    }`}
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
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>

                    <h3
                      className={`text-lg font-bold mb-1 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {course.code}
                    </h3>
                    <p
                      className={`text-sm mb-3 ${
                        darkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}
                    >
                      Fall 2025
                    </p>
                    <p
                      className={`mb-3 text-sm ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {course.name}
                    </p>
                    <p
                      className={`text-xs ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {course.memberCount} students
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Study Sessions Section (real study groups) */}
          {(myStudyGroups.length > 0 || groupsError) && (
            <div className="mb-8">
              <h2
                className={`text-2xl font-bold mb-4 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Upcoming Study Sessions
              </h2>

              {groupsError ? (
                <p className="text-red-500 text-sm">{groupsError}</p>
              ) : myStudyGroups.length === 0 ? (
                <p
                  className={`text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  You haven&apos;t joined any study groups yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myStudyGroups.map((group) => {
                    const attendeeCount = group.members
                      ? group.members.length
                      : 0;

                    const classLabel = group.class
                      ? `${group.class.code || ''}${
                          group.class.name ? ` – ${group.class.name}` : ''
                        }`
                      : '';

                    const when = group.scheduledAt
                      ? new Date(group.scheduledAt).toLocaleString()
                      : 'Time TBA';

                    const location = group.location || 'Location TBA';

                    return (
                      <div
                        key={group._id}
                        className={`rounded-xl shadow-sm p-6 ${
                          darkMode
                            ? 'bg-gray-800 text-white'
                            : 'bg-white text-black'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <h3
                            className={`text-lg font-bold ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {group.name}
                          </h3>
                          {classLabel && (
                            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
                              {classLabel}
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="text-lg">🕐</span>
                            <span className="text-sm">{when}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="text-lg">📍</span>
                            <span className="text-sm">{location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="text-lg">👥</span>
                            <span className="text-sm">
                              {attendeeCount} students attending
                            </span>
                          </div>
                        </div>

                        <Link
                          href={
                            group.class && group.class._id
                              ? `/classes/${group.class._id}?tab=study-groups`
                              : '/dashboard'
                          }
                          className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition"
                        >
                          View Session
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
