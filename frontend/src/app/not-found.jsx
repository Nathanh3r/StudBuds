'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 flex items-center justify-center px-4">
      <div className="text-center max-w-md">

        {/* 404 Text */}
        <h1 className="text-8xl font-bold text-white mb-4 animate-pulse">404</h1>
        <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-indigo-100 text-lg mb-8">
          Oops! The page you're looking for seems to have gone on a study break.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="bg-white/20 hover:bg-white/30 text-white font-semibold px-8 py-3 rounded-lg transition backdrop-blur-sm border border-white/30"
          >
            ← Go Back
          </button>
          <Link
            href="/dashboard"
            className="bg-white hover:bg-indigo-50 text-indigo-600 font-semibold px-8 py-3 rounded-lg transition"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <p className="text-indigo-100 text-sm mb-4">Quick links:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/discover" className="text-white hover:text-indigo-200 transition text-sm">
              Discover Classes
            </Link>
            <Link href="/friends" className="text-white hover:text-indigo-200 transition text-sm">
              Friends
            </Link>
            <Link href="/messages" className="text-white hover:text-indigo-200 transition text-sm">
              Messages
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}