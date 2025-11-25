'use client';

import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { useDarkMode } from '../context/DarkModeContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import LoadingScreen from '../components/LoadingScreen';
import ProtectedPage from '../components/ProtectedPage';
import { Gamepad2, Zap, BookOpen, Trophy, ArrowRight } from 'lucide-react';

export default function GamesPage() {
  const { user, loading: authLoading } = useAuth();
  const { isCollapsed } = useSidebar();
  const { darkMode } = useDarkMode();
  const router = useRouter();

  const games = [
    {
      id: 'pong',
      name: 'Pong',
      description: 'Classic arcade game - test your reflexes!',
      icon: Gamepad2,
      href: '/pong',
      color: 'indigo',
      bgGradient: 'from-indigo-500 to-purple-600',
      iconBg: darkMode ? 'bg-indigo-900/40' : 'bg-indigo-50',
      iconColor: darkMode ? 'text-indigo-400' : 'text-indigo-600',
    },
    {
      id: 'terms',
      name: 'Practice Terms',
      description: 'Study and memorize course terminology',
      icon: BookOpen,
      href: '/terms_game',
      color: 'indigo',
      bgGradient: 'from-indigo-500 to-purple-600',
      iconBg: darkMode ? 'bg-indigo-900/40' : 'bg-indigo-50',
      iconColor: darkMode ? 'text-indigo-400' : 'text-indigo-600',
    },
  ];

  if (authLoading) return <LoadingScreen />;

  return (
    <ProtectedPage>
      <div className={`min-h-screen flex ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <Sidebar />

        <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-0' : 'ml-0'}`}>
          <div className="p-8">
            <PageHeader
              title="Games"
              subtitle="Take a break and have some fun while learning"
            />

            {/* Games Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {games.map((game) => {
                const GameIcon = game.icon;
                
                return (
                  <Link
                    key={game.id}
                    href={game.href}
                    className={`group rounded-3xl p-8 transition-all duration-300 border-2 ${
                      darkMode
                        ? 'bg-gray-800 border-gray-700 hover:border-' + game.color + '-500'
                        : 'bg-white border-gray-100 hover:border-' + game.color + '-200'
                    } hover:shadow-xl hover:shadow-${game.color}-500/10`}
                  >
                    {/* Icon */}
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                        game.iconBg
                      } group-hover:bg-gradient-to-br group-hover:${game.bgGradient} group-hover:shadow-lg`}>
                        <GameIcon
                          className={`w-8 h-8 transition-all ${
                            game.iconColor
                          } group-hover:text-white`}
                          strokeWidth={2}
                        />
                      </div>

                      {/* Arrow */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        darkMode
                          ? 'bg-gray-700 group-hover:bg-' + game.color + '-600'
                          : 'bg-gray-50 group-hover:bg-' + game.color + '-100'
                      }`}>
                        <ArrowRight
                          className={`w-5 h-5 transition-all group-hover:translate-x-0.5 ${
                            darkMode
                              ? 'text-gray-400 group-hover:text-white'
                              : 'text-gray-400 group-hover:text-' + game.color + '-600'
                          }`}
                          strokeWidth={2}
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className={`text-2xl font-semibold mb-2 transition-colors ${
                        darkMode
                          ? 'text-white group-hover:text-' + game.color + '-400'
                          : 'text-gray-900 group-hover:bg-gradient-to-r group-hover:from-' + game.color + '-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent'
                      }`}>
                        {game.name}
                      </h3>
                      <p className={`text-sm leading-relaxed ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {game.description}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className={`mt-6 pt-6 border-t ${
                      darkMode ? 'border-gray-700' : 'border-gray-100'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold transition-colors ${
                          darkMode
                            ? 'text-' + game.color + '-400 group-hover:text-' + game.color + '-300'
                            : 'text-' + game.color + '-600 group-hover:text-' + game.color + '-700'
                        }`}>
                          Play Now
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}