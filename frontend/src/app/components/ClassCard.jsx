// components/ClassCard.jsx
'use client';

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
  const getSubjectIcon = (department) => {
    const dept = department?.toUpperCase() || '';
    
    const icons = {
      'BIOL': Dna,
      'CHEM': FlaskConical,
      'CS': Code,
      'CSE': Code,
      'MATH': Calculator,
      'PSYC': Brain,
      'PHYS': Zap,
      'ECON': TrendingUp,
      'GEOG': Globe,
      'HIST': Landmark,
      'ENGL': Pencil,
      'SPAN': Languages,
      'FREN': Languages,
      'ART': Palette,
      'MUS': Music,
      'LAW': Scale,
      'ENGR': Building2,
      'PE': Activity,
      'BCOE': Building2,
    };

    for (const [key, icon] of Object.entries(icons)) {
      if (dept.startsWith(key)) {
        return icon;
      }
    }

    return BookOpen;
  };

  const SubjectIcon = getSubjectIcon(course.department);

  return (
    <Link href={`/classes/${course._id}`}>
      <div className="group bg-white border-2 border-gray-100 rounded-3xl p-6 h-full flex flex-col hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
        
        {/* Icon and Course Code */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Subject Icon - All use same gradient */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0 group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:shadow-lg transition-all">
              <SubjectIcon className="w-6 h-6 text-indigo-600 group-hover:text-white transition-all" strokeWidth={2} />
            </div>
            
            {/* Course Code */}
            <h3 className="text-2xl font-semibold text-gray-900 group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all">
              {course.code}
            </h3>
          </div>
        </div>

        {/* Course Name */}
        <p className="text-gray-700 mb-4 leading-relaxed line-clamp-2 flex-shrink-0">
          {course.name}
        </p>

        {/* Description */}
        {course.description && (
          <p className="text-sm text-gray-400 line-clamp-3 mb-4 leading-relaxed">
            {course.description}
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
          {/* Student Count */}
          <div className="flex items-center gap-2 text-gray-400">
            <Users className="w-4 h-4" strokeWidth={2} />
            <span className="text-sm font-medium">
              {course.memberCount}
            </span>
          </div>

          {/* View Details */}
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">
              View Details
            </span>
            <ChevronRight 
              className="w-5 h-5 text-indigo-600 group-hover:text-indigo-700 group-hover:translate-x-0.5 transition-all" 
              strokeWidth={2}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}