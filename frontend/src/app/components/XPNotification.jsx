// components/XPNotification.jsx
'use client';

import { useGamification } from '../context/GamificationContext';
import { Sparkles } from 'lucide-react';

/**
 * XP Notification Toast
 * Shows "+X XP!" notifications when user earns XP
 * Auto-manages multiple notifications with stacking
 */
export default function XPNotification() {
  const { xpNotifications } = useGamification();

  if (xpNotifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {xpNotifications.map((notification, index) => (
        <div
          key={notification.id}
          className="animate-slideInRight"
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 min-w-[200px]">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <div className="flex-1">
              <div className="font-bold text-lg">
                +{notification.xp} XP
              </div>
              {notification.multiplier > 1 && (
                <div className="text-xs text-indigo-200">
                  {notification.multiplier}x multiplier!
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}