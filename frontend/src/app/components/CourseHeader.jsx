'use client';

export default function CourseHeader({ code, name, term, instructor, studentCount }) {
  return (
    <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 rounded-xl p-8 mb-6 text-white shadow-lg">
      <h1 className="text-4xl font-bold mb-3">{code}: {name}</h1>
      <div className="flex items-center gap-4 text-indigo-100">
        <span>{term}</span>
        <span>•</span>
        {instructor && (
          <>
            <span>Taught by {instructor}</span>
            <span>•</span>
          </>
        )}
        <span>{studentCount} students enrolled</span>
      </div>
    </div>
  );
}