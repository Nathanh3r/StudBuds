// app/components/course-detail/CourseSections.jsx
export default function CourseSections({ sections }) {
  if (!sections || sections.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Sections Available</h3>
        <p className="text-gray-600">Section information will be added soon.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Course Sections</h2>
      <div className="space-y-4">
        {sections.map((section, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-200 hover:shadow-sm transition">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Section {section.sectionNumber}
                </h3>
                <p className="text-sm text-gray-600">{section.scheduleType}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {section.enrollment}/{section.maxEnrollment}
                </div>
                <div className="text-xs text-gray-500">enrolled</div>
              </div>
            </div>
            {section.instructor && (
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium">Instructor:</span> {section.instructor}
              </p>
            )}
            {section.meetingTimes?.map((mt, i) => {
              const isOnline = mt.location?.toLowerCase().includes("online");
              return (
                <div key={i} className="text-sm text-gray-600 flex items-center gap-2">
                  {mt.days && mt.days.length > 0 && (
                    <span className="font-medium">{mt.days.join(', ')}</span>
                  )}
                  {mt.startTime && mt.endTime && (
                    <span>• {mt.startTime} - {mt.endTime}</span>
                  )}
                  {isOnline ? (
                    <span className="text-indigo-600">• Online</span>
                  ) : mt.location ? (
                    <span>• {mt.location}</span>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}