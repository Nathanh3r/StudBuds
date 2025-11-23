import CourseSections from '../../components/course-detail/CourseSections';
import { useDarkMode } from '../../context/DarkModeContext';

export default function CourseOverview({ classData }) {
  const { darkMode } = useDarkMode();

  return (
    <>
      {/* Course Description */}
      <div className={darkMode ? "bg-gray-800/80 rounded-xl shadow-sm p-6 border border-gray-700" : "bg-white rounded-xl shadow-sm p-6 border border-gray-100"}>
        <h2 className={darkMode ? "text-xl font-bold text-gray-100 mb-4" : "text-xl font-bold text-gray-900 mb-4"}>Course Description</h2>
        <p className={darkMode ? "text-gray-300 leading-relaxed" : "text-gray-700 leading-relaxed"}>
          {classData.description || "No description available for this course."}
        </p>
      </div>

      {/* Course Details */}
      <div className={darkMode ? "bg-gray-800/80 rounded-xl shadow-sm p-6 border border-gray-700" : "bg-white rounded-xl shadow-sm p-6 border border-gray-100"}>
        <h2 className={darkMode ? "text-xl font-bold text-gray-100 mb-4" : "text-xl font-bold text-gray-900 mb-4"}>Course Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {classData.department && (
            <div className="flex items-center gap-2">
              <span className={darkMode ? "font-semibold text-gray-300" : "font-semibold text-gray-700"}>Department:</span>
              <span className={darkMode ? "text-gray-400" : "text-gray-600"}>{classData.department}</span>
            </div>
          )}

          {classData.units && (
            <div className="flex items-center gap-2">
              <span className={darkMode ? "font-semibold text-gray-300" : "font-semibold text-gray-700"}>Units:</span>
              <span className={darkMode ? "text-gray-400" : "text-gray-600"}>{classData.units}</span>
            </div>
          )}

          {classData.instructionalMethod && (
            <div className="flex items-center gap-2">
              <span className={darkMode ? "font-semibold text-gray-300" : "font-semibold text-gray-700"}>Format:</span>
              <span className={darkMode ? "text-gray-400" : "text-gray-600"}>{classData.instructionalMethod}</span>
            </div>
          )}

          {classData.instructor?.email && (
            <div className="flex items-center gap-2">
              <span className={darkMode ? "font-semibold text-gray-300" : "font-semibold text-gray-700"}>Email:</span>
              <a href={`mailto:${classData.instructor.email}`} className={darkMode ? "text-indigo-400 hover:underline" : "text-indigo-600 hover:underline"}>
                {classData.instructor.email}
              </a>
            </div>
          )}
        </div>
      </div>

      <CourseSections sections={classData.sections}/>
    </>
  );
}