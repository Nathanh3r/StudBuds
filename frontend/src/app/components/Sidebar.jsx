'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { useDarkMode } from '../context/DarkModeContext';

export default function Sidebar() { 
  const pathname = usePathname();
  const { user } = useAuth();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { darkMode } = useDarkMode();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Discover', href: '/discover', icon: '🔍' },
    { name: 'Friends', href: '/friends', icon: '👥' },
    { name: 'My Courses', href: '/my-courses', icon: '📚' },
    { name: 'Messages', href: '/messages', icon: '💬' },
    { name: 'Settings', href: '/settings', icon: '⚙️' },
  ];

  const isActive = (href) => pathname === href;

  return (
    <div
      className={`h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 z-50 border-r ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
    >
      <Link
        href={user?._id ? `/profile/${user._id}` : '/dashboard'}
        className={`transition-all duration-300 ${isCollapsed ? 'p-4' : 'p-6'} hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer block border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}
        title={isCollapsed ? 'View your profile' : ''}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-lg">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className={`font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {user?.name || 'User'}
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Level 2</p>
            </div>
          )}
        </div>
      </Link>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg transition
                  ${
                    isActive(item.href)
                      ? 'bg-indigo-600 text-white'
                      : darkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                title={isCollapsed ? item.name : ''}
              >
                <span className="text-xl">{item.icon}</span>
                {!isCollapsed && <span className="font-medium">{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Toggle Button */}
      <div className={`p-4 border-t transition-colors duration-300 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg transition
            ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="text-xl">{isCollapsed ? '→' : '←'}</span>
          {!isCollapsed && <span className="font-medium">Collapse</span>}
        </button>
      </div>
    </div>
  );
}
