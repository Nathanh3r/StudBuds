// components/MyCourseCard.jsx
'use client';

import { Calendar, User, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import { getSubjectConfig } from '../lib/constants';
import { getPrimaryMeeting, formatInstructor } from '../lib/courseUtils';
import { useDarkMode } from '../context/DarkModeContext';

export default function MyCourseCard({ course }) {
  const { darkMode } = useDarkMode();

  if (!course) {
    return null;
  }

  const subjectConfig = getSubjectConfig(course.department, true);
  const SubjectIcon = subjectConfig.icon;

  const { meeting: meetingDisplay, location: locationDisplay } = getPrimaryMeeting(course);

  const instructorName = formatInstructor(course.instructor);

  return (
    <Link href={`/classes/${course._id}`} className='w-full'>
      <div className={`${darkMode ? "bg-[#1e1e1e] border-gray-700 hover:border-indigo-400 shadow-none" : "bg-white border-gray-100 hover:border-indigo-200 shadow-sm"} rounded-xl hover:shadow-xl transition-all duration-300 overflow-hidden group border w-full h-[280px]`}>
        <div className="flex flex-col md:flex-row h-full">
        
          {/* Left side - Course Icon & Code */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 md:w-48 flex flex-col items-center justify-center text-white flex-shrink-0">
            <div className={`w-16 h-16 ${subjectConfig.iconBg} backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3`}>
              <SubjectIcon className={`w-8 h-8 ${subjectConfig.iconColor}`} strokeWidth={2} />
            </div>
            <h3 className="text-2xl font-bold text-center mb-1">{course.code}</h3>
            {course.units && (
              <p className="text-indigo-100 text-sm">{course.units} Units</p>
            )}
            {course.isUserCreated && (
              <span className="mt-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                User Created
              </span>
            )}
          </div>

          {/* Right side */}
          <div className="flex-1 p-6 w-full flex flex-col">
            <div className="flex items-start justify-between mb-4 w-full flex-shrink-0">
              <div className="flex-1 min-w-0 pr-4">
                <h4 className={`${darkMode ? "text-white group-hover:text-indigo-300" : "text-gray-900 group-hover:text-indigo-600"} text-xl font-bold mb-2 transition-colors line-clamp-1`}>{course.name}</h4>
                {course.description && (
                  <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} text-sm line-clamp-2 mb-0`}>{course.description}</p>
                )}
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0">
                <div className={`${darkMode ? "bg-indigo-900/40 group-hover:bg-indigo-900/60" : "bg-indigo-50 group-hover:bg-indigo-100"} w-10 h-10 rounded-full flex items-center justify-center transition-colors`}>
                  <svg className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Metadata grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">

              {/* Term */}
              {course.term && (
                <div className="flex items-center gap-2 text-sm min-w-0">
                  <div className={`${darkMode ? "bg-blue-900/40" : "bg-blue-50"} w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Calendar className={`${darkMode ? "text-blue-300" : "text-blue-600"} w-5 h-5`} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className={`${darkMode ? "text-gray-400" : "text-gray-500"} text-xs`}>Term</p>
                    <p className={`${darkMode ? "text-white" : "text-gray-900"} font-medium truncate`}>{course.term}</p>
                  </div>
                </div>
              )}

              {/* Instructor */}
              {instructorName && (
                <div className="flex items-center gap-2 text-sm min-w-0">
                  <div className={`${darkMode ? "bg-purple-900/40" : "bg-purple-50"} w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <User className={`${darkMode ? "text-purple-300" : "text-purple-600"} w-5 h-5`} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className={`${darkMode ? "text-gray-400" : "text-gray-500"} text-xs`}>Instructor</p>
                    <p className={`${darkMode ? "text-white" : "text-gray-900"} font-medium truncate`}>{instructorName}</p>
                  </div>
                </div>
              )}

              {/* Meeting time */}
              {meetingDisplay && (
                <div className="flex items-center gap-2 text-sm min-w-0">
                  <div className={`${darkMode ? "bg-green-900/40" : "bg-green-50"} w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Clock className={`${darkMode ? "text-green-300" : "text-green-600"} w-5 h-5`} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className={`${darkMode ? "text-gray-400" : "text-gray-500"} text-xs`}>Schedule</p>
                    <p className={`${darkMode ? "text-white" : "text-gray-900"} font-medium text-xs leading-tight`}>{meetingDisplay}</p>
                  </div>
                </div>
              )}

            </div>

            {/* Location - takes remaining space */}
            {locationDisplay && (
              <div className={`mt-auto pt-4 ${darkMode ? "border-gray-700" : "border-gray-100"} border-t flex-shrink-0`}>
                <div className={`flex items-center gap-2 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  <MapPin className={`${darkMode ? "text-gray-500" : "text-gray-400"} w-5 h-5 flex-shrink-0`} strokeWidth={2} />
                  <span className="truncate">{locationDisplay}</span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </Link>
  );
}