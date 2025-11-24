// components/course-detail/CourseJoinPrompt.jsx
'use client';

import { UserPlus } from 'lucide-react';
import EmptyState from '../EmptyState';
import { useDarkMode } from '../../context/DarkModeContext';

export default function CourseJoinPrompt({ courseCode, onJoin }) {
  const { darkMode } = useDarkMode();

  return (
    <div className="mt-8">
      <EmptyState
        icon={UserPlus}
        title={`Join ${courseCode}`}
        description="Access course materials, connect with classmates, participate in discussions, and share notes."
        actionLabel="Join Course"
        onAction={onJoin}
        darkMode={darkMode}
      />
    </div>
  );
}