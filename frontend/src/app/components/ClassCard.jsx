// components/ClassCard.jsx
'use client';

import Link from 'next/link';
import { useDarkMode } from '../context/DarkModeContext';

export default function ClassCard({ course }) {
  const { darkMode } = useDarkMode();

  return (
    <Link href={`/classes/${course._id}`}>
      <div className={`${darkMode ? 'bg-gray-900 border-gray-700 hover:border-indigo-500' : 'bg-white border-transparent hover:border-indigo-200'} rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 h-full flex flex-col group border`}>
        <div className="flex items-start justify-between mb-4">
          <div className={`${darkMode ? 'bg-indigo-900' : 'bg-indigo-100'} w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0`}>
            <span className="text-2xl">📚</span>
          </div>
          <div className="text-right">
            <span className={`${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'} px-3 py-1 rounded-full text-xs`}>
              {course.memberCount} {course.memberCount === 1 ? 'student' : 'students'}
            </span>
          </div>
        </div>

        <div className="mb-2">
          <h3 className={`${darkMode ? 'text-gray-100 group-hover:text-indigo-400' : 'text-gray-900 group-hover:text-indigo-600'} text-xl font-bold transition-colors`}>
            {course.code}
          </h3>
          {course.isUserCreated && (
            <span className={`${darkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700'} inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1`}>
              User Created
            </span>
          )}
        </div>

        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3 font-medium line-clamp-2`}>
          {course.name}
        </p>

        {course.description && (
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm line-clamp-2 mb-4`}>
            {course.description}
          </p>
        )}

        <div className="flex-1"></div>

        <div className="flex justify-end mt-4">
          <div className={`${darkMode ? 'text-indigo-400' : 'text-indigo-600'} flex items-center gap-1 font-semibold group-hover:gap-2 transition-all`}>
            <span className="text-sm">View Details</span>
            <svg 
              className="w-5 h-5 group-hover:translate-x-1 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
