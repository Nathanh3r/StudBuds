// components/ClassCard.jsx
'use client';

import Link from 'next/link';

export default function ClassCard({ course }) {
  return (
    <Link href={`/classes/${course._id}`}>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 h-full flex flex-col group border border-transparent hover:border-indigo-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">📚</span>
          </div>
          <div className="text-right">
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
              {course.memberCount} {course.memberCount === 1 ? 'student' : 'students'}
            </span>
          </div>
        </div>

        {/* Course Code & Badges */}
        <div className="mb-2">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
            {course.code}
          </h3>
          {course.isUserCreated && (
            <span className="inline-block bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium mt-1">
              User Created
            </span>
          )}
        </div>

        {/* Course Name - Fixed 2 line height */}
        <p className="text-gray-700 mb-3 font-medium line-clamp-2">
          {course.name}
        </p>

        {/* Description */}
        {course.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-4">
            {course.description}
          </p>
        )}

        {/* Spacer to push button to bottom */}
        <div className="flex-1"></div>

        {/* View Details Button - Bottom Right */}
        <div className="flex justify-end mt-4">
          <div className="flex items-center gap-1 text-indigo-600 font-semibold group-hover:gap-2 transition-all">
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