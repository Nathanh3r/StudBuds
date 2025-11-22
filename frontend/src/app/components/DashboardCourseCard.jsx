// components/DashboardCourseCard.jsx
'use client';

import Link from 'next/link';
import { useDarkMode } from '../context/DarkModeContext';
import { 
  Users, 
  ChevronRight, 
  Dna,           
  FlaskConical,   
  Code,          
  Calculator,    
  Brain,         
  Zap,           
  TrendingUp,    
  BookOpen,      
  Globe,         
  Landmark,      
  Languages,     
  Microscope,    
  Palette,       
  Music,         
  Scale,         
  Building2,     
  Pencil,        
  Activity,      
} from 'lucide-react';

export default function DashboardCourseCard({ course }) {
  const { darkMode } = useDarkMode();

  const getSubjectConfig = (department) => {
    const dept = department?.toUpperCase() || '';
    
    const configs = {
      'BIOL': { 
        icon: Dna, 
        iconColor: 'text-emerald-600',
        iconBg: 'bg-emerald-50',
      },
      'CHEM': { 
        icon: FlaskConical, 
        iconColor: 'text-violet-600',
        iconBg: 'bg-violet-50',
      },
      'CS': { 
        icon: Code, 
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-50',
      },
      'CSE': { 
        icon: Code, 
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-50',
      },
      'MATH': { 
        icon: Calculator, 
        iconColor: 'text-amber-600',
        iconBg: 'bg-amber-50',
      },
      'PSYC': { 
        icon: Brain, 
        iconColor: 'text-pink-600',
        iconBg: 'bg-pink-50',
      },
      'PHYS': { 
        icon: Zap, 
        iconColor: 'text-yellow-600',
        iconBg: 'bg-yellow-50',
      },
      'ECON': { 
        icon: TrendingUp, 
        iconColor: 'text-green-600',
        iconBg: 'bg-green-50',
      },
      'GEOG': { 
        icon: Globe, 
        iconColor: 'text-teal-600',
        iconBg: 'bg-teal-50',
      },
      'HIST': { 
        icon: Landmark, 
        iconColor: 'text-stone-600',
        iconBg: 'bg-stone-50',
      },
      'ENGL': { 
        icon: Pencil, 
        iconColor: 'text-indigo-600',
        iconBg: 'bg-indigo-50',
      },
      'SPAN': { 
        icon: Languages, 
        iconColor: 'text-red-600',
        iconBg: 'bg-red-50',
      },
      'FREN': { 
        icon: Languages, 
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-50',
      },
      'ART': { 
        icon: Palette, 
        iconColor: 'text-fuchsia-600',
        iconBg: 'bg-fuchsia-50',
      },
      'MUS': { 
        icon: Music, 
        iconColor: 'text-purple-600',
        iconBg: 'bg-purple-50',
      },
      'LAW': { 
        icon: Scale, 
        iconColor: 'text-slate-600',
        iconBg: 'bg-slate-50',
      },
      'ENGR': { 
        icon: Building2, 
        iconColor: 'text-orange-600',
        iconBg: 'bg-orange-50',
      },
      'PE': { 
        icon: Activity, 
        iconColor: 'text-lime-600',
        iconBg: 'bg-lime-50',
      },
      'BCOE': { 
        icon: Building2, 
        iconColor: 'text-sky-600',
        iconBg: 'bg-sky-50',
      },
    };

    for (const [key, config] of Object.entries(configs)) {
      if (dept.startsWith(key)) {
        return config;
      }
    }

    return {
      icon: BookOpen,
      iconColor: 'text-gray-600',
      iconBg: 'bg-gray-50',
    };
  };

  const subjectConfig = getSubjectConfig(course.department);
  const SubjectIcon = subjectConfig.icon;

  return (
    <Link href={`/classes/${course._id}`}>
      <div className={`group border-2 rounded-2xl p-4 flex flex-col hover:shadow-lg transition-all duration-300 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700 hover:border-indigo-500 hover:shadow-indigo-500/10' 
          : 'bg-white border-gray-100 hover:border-indigo-200 hover:shadow-indigo-500/10'
      }`}>
        
        {/* Icon and Course Code */}
        <div className="flex items-center gap-2.5 mb-3">
          {/* Subject Icon - Unique colors that become unified purple gradient on hover */}
          <div className={`w-10 h-10 rounded-xl ${subjectConfig.iconBg} flex items-center justify-center flex-shrink-0 group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:via-purple-600 group-hover:to-indigo-700 group-hover:shadow-md transition-all`}>
            <SubjectIcon className={`w-5 h-5 ${subjectConfig.iconColor} group-hover:text-white transition-all`} strokeWidth={2} />
          </div>
          
          {/* Course Code */}
          <h3 className={`text-xl font-semibold group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {course.code}
          </h3>
        </div>

        {/* Course Name */}
        <p className={`text-sm mb-2 leading-relaxed line-clamp-2 ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {course.name}
        </p>

        {/* Description - Single Line */}
        {course.description && (
          <p className={`text-xs mb-3 leading-relaxed line-clamp-1 ${
            darkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>
            {course.description}
          </p>
        )}

        {/* Footer */}
        <div className={`flex items-center justify-between pt-3 border-t ${
          darkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          {/* Student Count */}
          <div className={`flex items-center gap-1.5 ${
            darkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>
            <Users className="w-3.5 h-3.5" strokeWidth={2} />
            <span className="text-xs font-medium">
              {course.memberCount}
            </span>
          </div>

          {/* View Details */}
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
              View
            </span>
            <ChevronRight 
              className="w-4 h-4 text-indigo-600 group-hover:text-indigo-700 group-hover:translate-x-0.5 transition-all" 
              strokeWidth={2}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}