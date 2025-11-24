// app/components/Sidebar.jsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext'; 
import { useSidebar } from '../context/SidebarContext';
import { useDarkMode } from '../context/DarkModeContext';
import { Home, Compass, BookOpen, Users, MessageCircle, Settings, ChevronsLeft, ChevronsRight, Trophy } from 'lucide-react';

export default function Sidebar() { 
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { stats, loading: statsLoading } = useGamification(); 
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { darkMode } = useDarkMode();

  const level = stats?.level || 1;
  const rank = stats?.rank || 'Freshman';

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Discover', href: '/discover', icon: Compass },
    { name: 'Courses', href: '/my-courses', icon: BookOpen },
    { name: 'Friends', href: '/friends', icon: Users },
    { name: 'Messages', href: '/messages', icon: MessageCircle },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (href) => pathname === href;

  if (isCollapsed) {
    return (
      <div className={`h-screen fixed left-0 top-0 w-20 flex flex-col border-r z-50 transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-800/80 backdrop-blur-xl border-gray-700' 
          : 'bg-white/80 backdrop-blur-xl border-gray-100'
      }`}>
        {/* Profile (Collapsed) */}
        <Link
          href={user?._id ? `/profile/${user._id}` : '/dashboard'}
          className={`h-20 flex items-center justify-center border-b transition-all ${
            darkMode 
              ? 'border-gray-700 hover:bg-gray-700/50' 
              : 'border-gray-100 hover:bg-indigo-50'
          }`}
          title={user?.name || 'Profile'}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 flex items-center justify-center text-white font-medium text-lg shadow-lg shadow-indigo-500/20 relative">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              darkMode 
                ? 'bg-purple-300 border-gray-800' 
                : 'bg-purple-200 border-white'
            }`}>
              <span className="text-xs font-bold text-indigo-900">{level}</span>
            </div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex-1 py-8 flex flex-col items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                    : darkMode
                    ? 'text-gray-400 hover:text-indigo-400 hover:bg-gray-700/50'
                    : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
                title={item.name}
              >
                <Icon className="w-5 h-5" strokeWidth={2} />
              </Link>
            );
          })}
        </nav>

        {/* Expand */}
        <button
          onClick={() => setIsCollapsed(false)}
          className={`p-6 border-t transition ${
            darkMode 
              ? 'border-gray-700 text-gray-400 hover:text-indigo-400' 
              : 'border-gray-100 text-gray-400 hover:text-indigo-600'
          }`}
        >
          <ChevronsRight className="w-6 h-6" strokeWidth={1.5} />
        </button>
      </div>
    );
  }

  return (
    <div className={`h-screen fixed left-0 top-0 w-64 flex flex-col border-r z-50 transition-colors duration-300 ${
      darkMode 
        ? 'bg-gray-800/80 backdrop-blur-xl border-gray-700' 
        : 'bg-white/80 backdrop-blur-xl border-gray-100'
    }`}>
      {/* Profile Section */}
      <Link
        href={user?._id ? `/profile/${user._id}` : '/dashboard'}
        className={`h-24 px-6 flex items-center gap-3 border-b transition-all duration-200 group ${
          darkMode 
            ? 'border-gray-700 hover:bg-gray-700/50' 
            : 'border-gray-100 hover:bg-indigo-50'
        }`}
      >
        {/* Profile Picture with Level Badge */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 flex items-center justify-center text-white font-medium text-xl shadow-lg shadow-indigo-500/20">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            darkMode 
              ? 'bg-purple-300 border-gray-800' 
              : 'bg-purple-200 border-white'
          }`}>
            <span className="text-xs font-bold text-indigo-900">{level}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className={`font-semibold truncate text-base ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {user?.name || 'User'}
          </p>
          <p className={`text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {statsLoading ? 'Loading...' : `Level ${level} ${rank}`}
          </p>
        </div>

        {/* Hover Arrow */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                    isActive(item.href)
                      ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                      : darkMode
                      ? 'text-gray-300 hover:text-indigo-400 hover:bg-gray-700/50'
                      : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={2} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse */}
      <button
        onClick={() => setIsCollapsed(true)}
        className={`p-4 border-t flex items-center justify-center transition ${
          darkMode 
            ? 'border-gray-700 text-gray-400 hover:text-indigo-400' 
            : 'border-gray-100 text-gray-400 hover:text-indigo-600'
        }`}
      >
        <ChevronsLeft className="w-5 h-5" strokeWidth={1.5} />
      </button>
    </div>
  );
}