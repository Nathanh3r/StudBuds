// components/ClassCard.jsx
'use client';
import { useDarkMode } from '../context/DarkModeContext';

import Link from 'next/link';
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

export default function ClassCard({ course }) {
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
      <div className={`group rounded-3xl p-6 h-full flex flex-col transition-all duration-300
        border-2 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'}
        hover:shadow-xl hover:shadow-indigo-500/10`}
        >
        {/* Icon and Course Code */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Subject Icon - Unique colors that become unified purple gradient on hover */}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0
              ${darkMode ? 'bg-gray-700 group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:via-purple-600 group-hover:to-indigo-700' 
                         : subjectConfig.iconBg + ' group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:via-purple-600 group-hover:to-indigo-700'} 
              transition-all`}
            >
              <SubjectIcon
                className={`${darkMode ? 'text-white group-hover:text-white' : subjectConfig.iconColor + ' group-hover:text-white'} w-6 h-6 transition-all`}
                strokeWidth={2}
              />
            </div>
            {/* Course Code */}
            <h3 className={`text-2xl font-semibold transition-all
              ${darkMode ? 'text-white group-hover:text-indigo-400' : 'text-gray-900 group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent'}`}
              >
              {course.code}
            </h3>
          </div>
        </div>

        {/* Course Name */}
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-4 leading-relaxed line-clamp-2 flex-shrink-0`}>
          {course.name}
        </p>

        {course.description && (
          <p className={`${darkMode ? 'text-gray-400' : 'text-sm text-gray-400'} line-clamp-3 mb-4 leading-relaxed`}>
            {course.description}
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Footer */}
        <div className={`flex items-center justify-between pt-4 mt-4 border-t
        ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          {/* Student Count */}
          <div className={`flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
            <Users className="w-4 h-4" strokeWidth={2} />
            <span className="text-sm font-medium">
              {course.memberCount}
            </span>
          </div>

          {/* View Details */}
          <div className="flex items-center gap-1">
            <span className={`${darkMode ? 'text-indigo-400' : 'text-indigo-600'} text-sm font-semibold group-hover:text-indigo-700`}>
            </span>
            <ChevronRight 
              className={`${darkMode ? 'text-indigo-400' : 'text-indigo-600'} w-5 h-5 group-hover:translate-x-0.5 transition-all`}
              strokeWidth={2}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
