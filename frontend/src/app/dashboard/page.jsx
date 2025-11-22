// app/dashboard/page.jsx
'use client';

import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { useRouter } from 'next/navigation';
import PageHeader from '../components/PageHeader';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import LoadingScreen from '../components/LoadingScreen';
import ClassCard from '../components/ClassCard';
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
  const router = useRouter();
  const [myClasses, setMyClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login');
    }
  }, [authLoading, token, router]);

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
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      
      const classesRes = await fetch(`${baseUrl}/classes`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const classesData = await classesRes.json();
      
      const allClasses = classesData.classes || [];
      
      const enrolledClasses = allClasses.filter(course => 
        course.isUserMember || user.courses?.includes(course._id)
      );
      
      setMyClasses(enrolledClasses);
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
    <div className="min-h-screen bg-white flex">
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
          <div className="mb-12">
            <div className="grid grid-cols-4 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="group relative bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
                      <Icon className="w-full h-full text-gray-900" />
                    </div>
                    <div className="relative z-10">
                      <div className={`${stat.bgColor} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-6 h-6 ${stat.iconColor}`} strokeWidth={2} />
                      </div>
                      <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      {stat.subValue && (
                        <p className="text-xs text-gray-400 mt-1">{stat.subValue}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-12">
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Your Courses</h2>
                {myClasses.length > 0 && (
                  <Link
                    href="/my-courses"
                    className="text-gray-400 hover:text-indigo-600 font-medium transition flex items-center gap-2"
                  >
                    View all
                    <ChevronRight className="w-4 h-4" strokeWidth={2} />
                  </Link>
                )}
              </div>

              {myClasses.length === 0 ? (
                <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-16 text-center border-2 border-indigo-100">
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
                        Discover courses to start your learning journey
                      </p>
                      <Link
                        href="/discover"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-8 py-4 rounded-full hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:scale-105"
                      >
                        Explore Courses
                        <ChevronRight className="w-5 h-5" strokeWidth={2} />
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {myClasses.slice(0, 2).map((course) => (
                    <ClassCard key={course._id} course={course} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}