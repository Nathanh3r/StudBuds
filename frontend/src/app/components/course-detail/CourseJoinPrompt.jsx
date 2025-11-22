// app/components/course-detail/CourseJoinPrompt.jsx
export default function CourseJoinPrompt({ courseCode, onJoin }) {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-sm p-8 sm:p-12 text-center border border-indigo-100">
      <div className="text-6xl mb-4">🎓</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Join {courseCode}</h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Access course materials, connect with classmates, participate in discussions, and share notes.
      </p>
      <button
        onClick={onJoin}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg transition shadow-md hover:shadow-lg"
      >
        Join Course
      </button>
    </div>
  );
}