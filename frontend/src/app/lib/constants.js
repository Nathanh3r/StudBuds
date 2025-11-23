// lib/constants.js
import {
  Users,
  BookOpen,
  Award,
  Flame,
  Clock,
  Trophy,
  Star,
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
