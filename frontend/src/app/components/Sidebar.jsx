'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isCollapsed, setIsCollapsed } = useSidebar();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Discover', href: '/discover', icon: '🔍' },
    { name: 'Friends', href: '/friends', icon: '👥' },
    { name: 'Courses', href: '/courses', icon: '📚' },
    { name: 'Messages', href: '/messages', icon: '💬' },
    { name: 'Settings', href: '/settings', icon: '⚙️' },
  ];

  const isActive = (href) => pathname === href;

  return (
    <div
      className={`bg-white h-screen fixed left-0 top-0 border-r border-gray-200 flex flex-col transition-all duration-300 z-50 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <Link 
        href={user?._id ? `/profile/${user._id}` : '/dashboard'}
        className={`border-b border-gray-200 transition-all duration-300 ${isCollapsed ? 'p-4' : 'p-6'} hover:bg-gray-50 cursor-pointer block`}
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
              <p className="font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
              <p className="text-sm text-gray-500">Level 2</p>
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
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg transition ${
                  isActive(item.href)
                    ? 'bg-indigo-600 text-white'
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
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="text-xl">{isCollapsed ? '→' : '←'}</span>
          {!isCollapsed && <span className="font-medium">Collapse</span>}
        </button>
      </div>
    </div>
  );
}