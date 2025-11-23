// lib/constants.js
import {
  Users,
  BookOpen,
  Award,
  Flame,
  Clock,
  Trophy,
  Star,
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
  BookText,
} from "lucide-react";

/**
 * Pagination configuration
 */
export const ITEMS_PER_PAGE = 12;

/**
 * Stats configuration for profile and dashboard cards
 */
export const STATS_CONFIG = {
  friends: {
    label: "Friends",
    icon: Users,
    color: "from-blue-500 to-indigo-500",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  classes: {
    label: "Classes",
    icon: BookOpen,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
  },
  level: {
    label: "Level",
    icon: Award,
    color: "from-amber-500 to-yellow-500",
    bgColor: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  streak: {
    label: "Learning Streak",
    icon: Flame,
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  studyTime: {
    label: "Total Study Time",
    icon: Clock,
    color: "from-blue-500 to-indigo-500",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  achievements: {
    label: "Achievements",
    icon: Trophy,
    color: "from-amber-500 to-yellow-500",
    bgColor: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  currentLevel: {
    label: "Current Level",
    icon: Star,
    color: "from-purple-500 to-indigo-500",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
  },
};

/**
 * Color variants for course cards
 */
export const COURSE_COLORS = [
  "from-blue-500 to-indigo-500",
  "from-purple-500 to-pink-500",
  "from-green-500 to-emerald-500",
  "from-orange-500 to-red-500",
  "from-cyan-500 to-blue-500",
  "from-violet-500 to-purple-500",
];

/**
 * Get a consistent color for a course based on its ID
 */
export function getCourseColor(courseId) {
  const index = courseId ? courseId.charCodeAt(0) % COURSE_COLORS.length : 0;
  return COURSE_COLORS[index];
}

/**
 * Subject/Department icon and color configurations
 * Used across ClassCard, DashboardCourseCard, and MyCourseCard
 */
export const SUBJECT_CONFIGS = {
  BIOL: {
    icon: Dna,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
    name: "Biology",
  },
  CHEM: {
    icon: FlaskConical,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50",
    name: "Chemistry",
  },
  CS: {
    icon: Code,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    name: "Computer Science",
  },
  CSE: {
    icon: Code,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    name: "Computer Science & Engineering",
  },
  MATH: {
    icon: Calculator,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
    name: "Mathematics",
  },
  PSYC: {
    icon: Brain,
    iconColor: "text-pink-600",
    iconBg: "bg-pink-50",
    name: "Psychology",
  },
  PHYS: {
    icon: Zap,
    iconColor: "text-yellow-600",
    iconBg: "bg-yellow-50",
    name: "Physics",
  },
  ECON: {
    icon: TrendingUp,
    iconColor: "text-green-600",
    iconBg: "bg-green-50",
    name: "Economics",
  },
  GEOG: {
    icon: Globe,
    iconColor: "text-teal-600",
    iconBg: "bg-teal-50",
    name: "Geography",
  },
  HIST: {
    icon: Landmark,
    iconColor: "text-stone-600",
    iconBg: "bg-stone-50",
    name: "History",
  },
  ENGL: {
    icon: Pencil,
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-50",
    name: "English",
  },
  SPAN: {
    icon: Languages,
    iconColor: "text-red-600",
    iconBg: "bg-red-50",
    name: "Spanish",
  },
  FREN: {
    icon: Languages,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    name: "French",
  },
  ART: {
    icon: Palette,
    iconColor: "text-fuchsia-600",
    iconBg: "bg-fuchsia-50",
    name: "Art",
  },
  MUS: {
    icon: Music,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50",
    name: "Music",
  },
  LAW: {
    icon: Scale,
    iconColor: "text-slate-600",
    iconBg: "bg-slate-50",
    name: "Law",
  },
  ENGR: {
    icon: Building2,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-50",
    name: "Engineering",
  },
  PE: {
    icon: Activity,
    iconColor: "text-lime-600",
    iconBg: "bg-lime-50",
    name: "Physical Education",
  },
  BCOE: {
    icon: Building2,
    iconColor: "text-sky-600",
    iconBg: "bg-sky-50",
    name: "Engineering",
  },
};

/**
 * Get subject configuration based on department code
 * Supports both light and dark mode variants
 * @param {string} department - Department code (e.g., "CS", "MATH")
 * @param {boolean} whiteIcon - Use white icon color (for dark backgrounds)
 * @returns {object} Subject configuration with icon, colors, and name
 */
export function getSubjectConfig(department, whiteIcon = false) {
  const dept = department?.toUpperCase() || "";

  // Find matching subject config
  for (const [key, config] of Object.entries(SUBJECT_CONFIGS)) {
    if (dept.startsWith(key)) {
      if (whiteIcon) {
        return {
          ...config,
          iconColor: "text-white",
          iconBg: "bg-white/20",
        };
      }
      return config;
    }
  }

  // Default fallback
  return {
    icon: whiteIcon ? BookText : BookOpen,
    iconColor: whiteIcon ? "text-white" : "text-gray-600",
    iconBg: whiteIcon ? "bg-white/20" : "bg-gray-50",
    name: "General",
  };
}
