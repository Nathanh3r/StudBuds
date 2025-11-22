// app/components/course-detail/CourseJoinPrompt.jsx
// components/course-detail/CourseJoinPrompt.jsx
'use client';

import { UserPlus, ChevronRight } from 'lucide-react';

export default function CourseJoinPrompt({ courseCode, onJoin }) {
  return (
    <div className="mt-8">
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-16 text-center border-2 border-indigo-100">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
          </div>
          <div className="relative z-10">
            <div className="bg-white w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <UserPlus className="w-10 h-10 text-indigo-600" strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Join {courseCode}
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Access course materials, connect with classmates, participate in discussions, and share notes.
            </p>
            <button
              onClick={onJoin}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-8 py-4 rounded-full hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:scale-105"
            >
              Join Course
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}