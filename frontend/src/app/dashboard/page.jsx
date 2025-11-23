// app/dashboard/page.jsx
'use client';

import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { useDarkMode } from '../context/DarkModeContext';
import { useRouter } from 'next/navigation';
import PageHeader from '../components/PageHeader';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import LoadingScreen from '../components/LoadingScreen';
import DashboardCourseCard from '../components/DashboardCourseCard';
import { 
  Compass, 
  Users, 
  MessageCircle, 
  ChevronRight, 
  BookOpen, 
  Clock,
  Trophy,
  Target,
  TrendingUp,
  Flame,
  Star,
  Calendar,
  Award
} from 'lucide-react';

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
  const [greeting, setGreeting] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !token) router.push('/login');
  }, [authLoading, token, router]);

  // Fetch dashboard data once we have user + token
  useEffect(() => {
    if (token && user) {
      fetchDashboardData();
    }
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
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
      
      const enrolledClasses = allClasses.filter(course => 
        course.isUserMember || user.courses?.includes(course._id)
      );
      setMyClasses(enrolledClasses);

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

  // Mock stats data - replace with real data from your API
  const stats = [
    {
      label: 'Learning Streak',
      value: '7 days',
      icon: Flame,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      label: 'Total Study Time',
      value: '24h 15m',
      icon: Clock,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Achievements',
      value: '12',
      icon: Trophy,
      color: 'from-amber-500 to-yellow-500',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Current Level',
      value: 'Level 8',
      subValue: '2,450 XP',
      icon: Star,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className={`min-h-screen flex ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-white'
      }`}>
      <Sidebar />

      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="max-w-7xl mx-auto px-8 pt-8 pb-16">
          <PageHeader
            title={`${greeting}, ${user.name?.split(' ')[0]}`}
            subtitle={
              myClasses.length === 0 
                ? "Let's get started with your first course"
                : `You have ${myClasses.length} ${myClasses.length === 1 ? 'course' : 'courses'} this semester`
            }
          />

          {/* Stats Grid */}
          <div className="mb-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className={`group relative rounded-xl p-4 border-2 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                        : 'bg-white border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 opacity-5">
                      <Icon className={`w-full h-full ${darkMode ? 'text-white' : 'text-gray-900'}`} />
                    </div>
                    <div className="relative z-10">
                      <div className={`${stat.bgColor} w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-5 h-5 ${stat.iconColor}`} strokeWidth={2} />
                      </div>
                      <p className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
                      <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                      {stat.subValue && (
                        <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{stat.subValue}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Your Courses Section */}
          <div className="mb-8">
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Your Courses</h2>
                {myClasses.length > 0 && (
                  <Link
                    href="/my-courses"
                    className={`text-sm font-medium transition flex items-center gap-1 ${
                      darkMode ? 'text-gray-400 hover:text-indigo-400' : 'text-gray-400 hover:text-indigo-600'
                    }`}
                  >
                    View all
                    <ChevronRight className="w-4 h-4" strokeWidth={2} />
                  </Link>
                )}
              </div>

              {myClasses.length === 0 ? (
                <div className={`rounded-2xl p-12 text-center border-2 ${
                  darkMode 
                    ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-gray-700 border-gray-700' 
                    : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-indigo-100'
                }`}>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <BookOpen className={`w-32 h-32 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} strokeWidth={1} />
                    </div>
                    <div className="relative z-10">
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg ${
                        darkMode ? 'bg-gray-700' : 'bg-white'
                      }`}>
                        <BookOpen className={`w-8 h-8 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} strokeWidth={2} />
                      </div>
                      <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        No courses yet
                      </h3>
                      <p className={`mb-6 max-w-md mx-auto text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Discover courses to start your learning journey
                      </p>
                      <Link
                        href="/discover"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-6 py-3 rounded-full hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:scale-105"
                      >
                        Explore Courses
                        <ChevronRight className="w-4 h-4" strokeWidth={2} />
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {myClasses.slice(0, 2).map((course) => (
                    <DashboardCourseCard key={course._id} course={course} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Study Sessions Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Upcoming Study Sessions
              </h2>
            </div>

            {groupsError ? (
              <p className="text-red-500 text-sm">{groupsError}</p>
            ) : myStudyGroups.length === 0 ? (
              <div className={`rounded-2xl p-12 text-center border-2 ${
                darkMode 
                  ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-gray-700 border-gray-700' 
                  : 'bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border-indigo-100'
              }`}>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <Users className={`w-32 h-32 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} strokeWidth={1} />
                  </div>
                  <div className="relative z-10">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg ${
                      darkMode ? 'bg-gray-700' : 'bg-white'
                    }`}>
                      <Users className={`w-8 h-8 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} strokeWidth={2} />
                    </div>
                    <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      No study sessions yet
                    </h3>
                    <p className={`mb-6 max-w-md mx-auto text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Join or create study groups in your courses to collaborate with classmates
                    </p>
                    <Link
                      href="/my-courses"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-6 py-3 rounded-full hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:scale-105"
                    >
                      View My Courses
                      <ChevronRight className="w-4 h-4" strokeWidth={2} />
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myStudyGroups.map((group) => {
                  const attendeeCount = group.members ? group.members.length : 0;
                  const classLabel = group.class
                    ? `${group.class.code || ''}${group.class.name ? ` – ${group.class.name}` : ''}`
                    : '';
                  const when = group.scheduledAt
                    ? new Date(group.scheduledAt).toLocaleString()
                    : 'Time TBA';
                  const location = group.location || 'Location TBA';

                  return (
                    <div
                      key={group._id}
                      className={`rounded-xl shadow-sm p-5 hover:shadow-md transition ${
                        darkMode ? 'bg-gray-800' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {group.name}
                        </h3>
                        {classLabel && (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            darkMode 
                              ? 'bg-indigo-900/50 text-indigo-300' 
                              : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            {classLabel}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 mb-4">
                        <div className={`flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <span className="text-base">🕐</span>
                          <span className="text-sm">{when}</span>
                        </div>
                        <div className={`flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <span className="text-base">📍</span>
                          <span className="text-sm">{location}</span>
                        </div>
                        <div className={`flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <span className="text-base">👥</span>
                          <span className="text-sm">{attendeeCount} students attending</span>
                        </div>
                      </div>

                      <Link
                        href={
                          group.class && group.class._id
                            ? `/classes/${group.class._id}?tab=study-groups`
                            : '/dashboard'
                        }
                        className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition text-sm"
                      >
                        View Session
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}