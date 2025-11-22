import CourseSections from '../../components/course-detail/CourseSections';

// app/components/course-detail/CourseOverview.jsx
export default function CourseOverview({ classData }) {
  return (
    <>
      {/* Course Description */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Course Description</h2>
        <p className="text-gray-700 leading-relaxed">
          {classData.description || "No description available for this course."}
        </p>
      </div>

      {/* Course Details */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Course Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classData.department && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Department:</span>
              <span className="text-gray-600">{classData.department}</span>
            </div>
          )}
          {classData.units && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Units:</span>
              <span className="text-gray-600">{classData.units}</span>
            </div>
          )}
          {classData.instructionalMethod && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Format:</span>
              <span className="text-gray-600">{classData.instructionalMethod}</span>
            </div>
          )}
          {classData.instructor?.email && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Email:</span>
              <a
                href={`mailto:${classData.instructor.email}`}
                className="text-indigo-600 hover:underline"
              >
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