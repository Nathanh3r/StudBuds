// components/ProtectedPage.jsx
'use client';

import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { useDarkMode } from '../context/DarkModeContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import LoadingScreen from './LoadingScreen';

/**
 * Wrapper component for protected pages that require authentication
 * Handles auth checking, loading states, and layout
 * @param {object} props
 * @param {React.ReactNode} props.children - Page content
 * @param {string} [props.maxWidth='7xl'] - Maximum width constraint (Tailwind size)
 * @param {string} [props.padding='px-8'] - Horizontal padding
 */
export default function ProtectedPage({ 
  children, 
  maxWidth = '7xl',
  padding = 'px-8'
}) {
  const { user, token, loading: authLoading } = useAuth();
  const { isCollapsed } = useSidebar();
  const { darkMode } = useDarkMode();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login');
    }
  }, [authLoading, token, router]);

  // Show loading screen while checking auth
  if (authLoading) return <LoadingScreen />;
  
  // Don't render if no user (will redirect)
  if (!user) return null;

  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <Sidebar />
      
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className={`max-w-${maxWidth} mx-auto ${padding} pt-8 pb-16`}>
          {children}
        </div>
      </div>
    </div>
  );
}