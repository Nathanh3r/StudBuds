import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import { DarkModeProvider } from './context/DarkModeContext'; 

import { GamificationProvider } from './context/GamificationContext'; 
import XPNotification from './components/XPNotification'; 
import LevelUpModal from './components/LevelUpModal'; 
import AchievementToast from './components/AchievementToast'; 

import './globals.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "StudBuds",
  description: "Study together, level up, and stay connected.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <DarkModeProvider>
          <AuthProvider>
            <SidebarProvider>
             <GamificationProvider>
                {children}
                <XPNotification />
                <LevelUpModal />
                <AchievementToast />
              </GamificationProvider>
            </SidebarProvider>
          </AuthProvider>
        </DarkModeProvider>
      </body>
    </html>
  );
}
