'use client';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo/Icon */}
        <div className="mb-8 relative">
          {/* Outer spinning ring */}
          <div className="w-24 h-24 mx-auto border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          
          {/* Inner icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl animate-pulse">📚</span>
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-2xl font-bold text-white mb-2">StudBuds</h2>
        <p className="text-indigo-100">Loading...</p>

        {/* Animated dots */}
        <div className="flex justify-center gap-2 mt-4">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}