// app/components/course-detail/CourseSections.jsx
import { useDarkMode } from '../../context/DarkModeContext';
export default function CourseSections({ sections }) {
  const { darkMode } = useDarkMode();

  if (!sections || sections.length === 0) {
    return (
      <div className={darkMode ? "bg-gray-800/80 rounded-xl shadow-sm p-12 text-center border border-gray-700" : "bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100"}>
        <div className="text-6xl mb-4">📋</div>
        <h3 className={darkMode ? "text-xl font-semibold text-gray-100 mb-2" : "text-xl font-semibold text-gray-900 mb-2"}>No Sections Available</h3>
        <p className={darkMode ? "text-gray-400" : "text-gray-600"}>Section information will be added soon.</p>
      </div>
    );
  }

  return (
    <div className={darkMode ? "bg-gray-800/80 rounded-xl shadow-sm p-6 border border-gray-700" : "bg-white rounded-xl shadow-sm p-6 border border-gray-100"}>
      <h2 className={darkMode ? "text-xl font-bold text-gray-100 mb-6" : "text-xl font-bold text-gray-900 mb-6"}>Course Sections</h2>
      <div className="space-y-4">
        {sections.map((section, idx) => (
          <div key={idx} className={darkMode ? "border border-gray-600 rounded-lg p-4 hover:border-indigo-400 hover:shadow-sm transition" : "border border-gray-200 rounded-lg p-4 hover:border-indigo-200 hover:shadow-sm transition"}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className={darkMode ? "font-semibold text-gray-100" : "font-semibold text-gray-900"}>Section {section.sectionNumber}</h3>
                <p className={darkMode ? "text-sm text-gray-400" : "text-sm text-gray-600"}>{section.scheduleType}</p>
              </div>
              <div className="text-right">
                <div className={darkMode ? "text-sm font-medium text-gray-100" : "text-sm font-medium text-gray-900"}>
                  {section.enrollment}/{section.maxEnrollment}
                </div>
                <div className={darkMode ? "text-xs text-gray-500" : "text-xs text-gray-500"}>enrolled</div>
              </div>
            </div>

            {section.instructor && (
              <p className={darkMode ? "text-sm text-gray-300 mb-2" : "text-sm text-gray-700 mb-2"}>
                <span className="font-medium">Instructor:</span> {section.instructor}
              </p>
            )}

            {section.meetingTimes?.map((mt, i) => {
              const isOnline = mt.location?.toLowerCase().includes("online");
              return (
                <div key={i} className={darkMode ? "text-sm text-gray-400 flex items-center gap-2" : "text-sm text-gray-600 flex items-center gap-2"}>
                  {mt.days && mt.days.length > 0 && (
                    <span className="font-medium">{mt.days.join(', ')}</span>
                  )}
                  {mt.startTime && mt.endTime && (
                    <span>• {mt.startTime} - {mt.endTime}</span>
                  )}
                  {isOnline ? (
                    <span className="text-indigo-400">• Online</span>
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