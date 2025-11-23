// components/MyCourseCard.jsx
'use client';
import { 
  Calendar, 
  User, 
  Clock, 
  MapPin, 
  ChevronRight, 
  BookOpen,
  BookText,
  Dna,           
  FlaskConical,   
  Code,          
  Calculator,    
  Brain,         
  Zap,           
  TrendingUp,    
  Globe,         
  Landmark,      
  Languages,     
  Palette,       
  Music,         
  Scale,         
  Building2,     
  Pencil,        
  Activity,      
} from 'lucide-react';
import Link from 'next/link';

export default function MyCourseCard({ course }) {
  // Safety check
  if (!course) {
    return null;
  }

  // Get subject-specific icon and colors
  const getSubjectConfig = (department) => {
    const dept = department?.toUpperCase() || '';
    
    const configs = {
      'BIOL': { 
        icon: Dna, 
        iconColor: 'text-white',
        iconBg: 'bg-white/20',
      },
      'CHEM': { 
        icon: FlaskConical, 
        iconColor: 'text-white',
        iconBg: 'bg-white/20',
      },
      'CS': { 
        icon: Code, 
        iconColor: 'text-white',
        iconBg: 'bg-white/20',
      },
      'CSE': { 
        icon: Code, 
        iconColor: 'text-white',
        iconBg: 'bg-white/20',
      },
      'MATH': { 
        icon: Calculator, 
        iconColor: 'text-white',
        iconBg: 'bg-white/20',
      },
      'PSYC': { 
        icon: Brain, 
        iconColor: 'text-white',
        iconBg: 'bg-white/20',
      },
      'PHYS': { 
        icon: Zap, 
        iconColor: 'text-white',
        iconBg: 'bg-white/20',
      },
      'ECON': { 
        icon: TrendingUp, 
        iconColor: 'text-white',
        iconBg: 'bg-white/20',
      },
      'GEOG': { 
        icon: Globe, 
        iconColor: 'text-white',
        iconBg: 'bg-white/20',
      },
      'HIST': { 
        icon: Landmark, 
        iconColor: 'text-white',
        iconBg: 'bg-white/20',
      },
      'ENGL': { 
        icon: Pencil, 
        iconColor: 'text-white',
        iconBg: 'bg-white/20',
      },
      'SPAN': { 
        icon: Languages, 
        iconColor: 'text-white',
        iconBg: 'bg-white/20',
      },
      'FREN': { 
        icon: Languages, 
        iconColor: 'text-white',
        iconBg: 'bg-white/20',
      },
      'ART': { 
        icon: Palette, 
        iconColor: 'text-white',
        iconBg: 'bg-white/20',
      },
      'MUS': { 
        icon: Music, 
        iconColor: 'text-white',
        iconBg: 'bg-white/20',
      },
      'LAW': { 
        icon: Scale, 
        iconColor: 'text-white',
        iconBg: 'bg-white/20',
      },
      'ENGR': { 
        icon: Building2, 
        iconColor: 'text-white',
        iconBg: 'bg-white/20',
      },
      'PE': { 
        icon: Activity, 
        iconColor: 'text-white',
        iconBg: 'bg-white/20',
      },
      'BCOE': { 
        icon: Building2, 
        iconColor: 'text-white',
        iconBg: 'bg-white/20',
      },
    };

    for (const [key, config] of Object.entries(configs)) {
      if (dept.startsWith(key)) {
        return config;
      }
    }

    return {
      icon: BookText,
      iconColor: 'text-white',
      iconBg: 'bg-white/20',
    };
  };

  const subjectConfig = getSubjectConfig(course.department);
  const SubjectIcon = subjectConfig.icon;

  // Helper function to abbreviate day names
  const abbreviateDay = (day) => {
    const dayMap = {
      'Monday': 'Mon',
      'Tuesday': 'Tue',
      'Wednesday': 'Wed',
      'Thursday': 'Thu',
      'Friday': 'Fri',
      'Saturday': 'Sat',
      'Sunday': 'Sun'
    };
    return dayMap[day] || day;
  };

  // Get first meeting time for display
  const primaryMeeting = course.meetingTimes?.[0];

  // Format meeting display properly
  let meetingDisplay = null;
  if (primaryMeeting) {
    // Abbreviate and join days with no space (M, W, F -> MWF)
    const days = primaryMeeting.days?.length > 0 
      ? primaryMeeting.days.map(day => abbreviateDay(day)).join(' & ') 
      : '';
    
    const times = (primaryMeeting.startTime && primaryMeeting.endTime) 
      ? `${primaryMeeting.startTime} - ${primaryMeeting.endTime}` 
      : '';
    
    // Combine days and times with space
    if (days && times) {
      meetingDisplay = `${days} ${times}`;
    } else if (days) {
      meetingDisplay = days;
    } else if (times) {
      meetingDisplay = times;
    }
  }

  // Format location properly
  let locationDisplay = null;
  if (primaryMeeting) {
    // Check if it's online
    const isOnline = primaryMeeting.building?.toLowerCase() === 'online' || 
                     primaryMeeting.location?.toLowerCase().includes('online');
    
    if (isOnline) {
      locationDisplay = 'Online';
    } else if (primaryMeeting.building && primaryMeeting.room) {
      locationDisplay = `${primaryMeeting.building} ${primaryMeeting.room}`;
    } else if (primaryMeeting.location) {
      locationDisplay = primaryMeeting.location;
    }
  }

  return (
    <Link href={`/classes/${course._id}`}>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-indigo-200">
        <div className="flex flex-col md:flex-row">
          {/* Left side - Course Icon & Code - Keep purple gradient, change icon */}
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

          {/* Right side - Course Details */}
          <div className="flex-1 p-6 min-w-0">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0 pr-4">
                <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {course.name}
                </h4>
                {course.description && (
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {course.description}
                  </p>
                )}
              </div>
              
              {/* View arrow */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  <svg 
                    className="w-5 h-5 text-indigo-600 group-hover:translate-x-1 transition-transform" 
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

            {/* Course metadata grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Term */}
              {course.term && (
                <div className="flex items-center gap-2 text-sm min-w-0">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Term</p>
                    <p className="font-medium text-gray-900 truncate">{course.term}</p>
                  </div>
                </div>
              )}

              {/* Instructor */}
              {course.instructor?.name && (
                <div className="flex items-center gap-2 text-sm min-w-0">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-purple-600" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Instructor</p>
                    <p className="font-medium text-gray-900 truncate">{course.instructor.name}</p>
                  </div>
                </div>
              )}

              {/* Meeting Time */}
              {meetingDisplay && (
                <div className="flex items-center gap-2 text-sm min-w-0">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-green-600" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Schedule</p>
                    <p className="font-medium text-gray-900 text-xs leading-tight">
                      {meetingDisplay}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Location if available */}
            {locationDisplay && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-5 h-5 text-gray-400" strokeWidth={2} />
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