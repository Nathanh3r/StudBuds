'use client'; // MUST be first line

import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { useRouter } from 'next/navigation';
import { useDarkMode } from '../context/DarkModeContext';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import LoadingScreen from '../components/LoadingScreen';

export default function SettingsPage() {
  const { user, token, loading: authLoading, logout } = useAuth();
  const { isCollapsed } = useSidebar();
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useDarkMode();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !token) router.push('/login');
  }, [authLoading, token, router]);

  if (authLoading) return <LoadingScreen />;
  if (!user) return null;

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <Sidebar />

      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="max-w-4xl mx-auto px-8 py-8">
          <PageHeader title="Settings" subtitle="Manage your account preferences" />

          {/* Appearance Settings */}
          <div className={`rounded-xl shadow-sm p-8 mt-8 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>Appearance</h2>
            <button
              onClick={toggleDarkMode} // global toggle
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg cursor-pointer"
            >
              Toggle Dark Mode
            </button>
          </div>

          {/* Danger Zone */}
          <div className={`rounded-xl shadow-sm p-8 mt-8 border ${darkMode ? 'bg-gray-800 text-white border-red-700' : 'bg-white text-black border-red-300'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>Danger Zone</h2>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg cursor-pointer"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
