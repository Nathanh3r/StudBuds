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
import { Compass, Users, MessageCircle, ChevronRight, BookOpen } from 'lucide-react';

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

  const quickActions = [
    {
      id: 'discover',
      title: 'Discover',
      description: 'Find new courses',
      icon: Compass,
      href: '/discover',
    },
    {
      id: 'friends',
      title: 'Friends',
      description: 'Connect with peers',
      icon: Users,
      href: '/friends',
    },
    {
      id: 'messages',
      title: 'Messages',
      description: 'Check your inbox',
      icon: MessageCircle,
      href: '/messages',
    },
  ];

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />

      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="max-w-7xl mx-auto px-8 py-16">
          <PageHeader
            title={`${greeting}, ${user.name?.split(' ')[0]}`}
            subtitle={
              myClasses.length === 0 
                ? "Let's get started with your first course"
                : `You have ${myClasses.length} ${myClasses.length === 1 ? 'course' : 'courses'} this semester`
            }
          />

          {/* Quick Actions */}
          <div className="mb-20">
            <div className="grid grid-cols-3 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                const isActive = hoveredCard === action.id || (hoveredCard === null && action.id === 'discover');
                
                return (
                  <Link
                    key={action.id}
                    href={action.href}
                    onMouseEnter={() => setHoveredCard(action.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className={`group relative overflow-hidden rounded-3xl p-8 transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 text-white shadow-2xl shadow-indigo-500/30 scale-[1.02]'
                        : 'bg-white border-2 border-gray-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10 hover:scale-[1.02]'
                    }`}
                  >
                    <div className="relative z-10">
                      <Icon 
                        className={`w-10 h-10 mb-4 transition-colors ${
                          isActive ? 'text-white' : 'text-gray-400'
                        }`}
                        strokeWidth={1.5}
                      />
                      <h3 className={`text-xl font-semibold mb-2 transition-colors ${
                        isActive ? 'text-white' : 'text-gray-900'
                      }`}>
                        {action.title}
                      </h3>
                      <p className={`text-sm transition-colors ${
                        isActive ? 'text-indigo-100' : 'text-gray-500'
                      }`}>
                        {action.description}
                      </p>
                    </div>
                    {isActive && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Your Courses */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-semibold text-gray-900">Your Courses</h2>
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
              <div className="bg-gray-50 rounded-3xl p-20 text-center">
                <BookOpen className="w-20 h-20 mx-auto mb-6 text-gray-300" strokeWidth={1.5} />
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  No courses yet
                </h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">
                  Discover courses to start your learning journey
                </p>
                <Link
                  href="/discover"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-8 py-4 rounded-full hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                >
                  Explore Courses
                  <ChevronRight className="w-5 h-5" strokeWidth={2} />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {myClasses.slice(0, 4).map((course) => (
                  <ClassCard key={course._id} course={course} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}