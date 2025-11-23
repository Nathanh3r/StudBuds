// lib/courseUtils.js

/**
 * Course-specific utility functions
 * Used for formatting meeting times, locations, and other course data
 */

/**
 * Abbreviate day names for compact display
 * @param {string} day - Full day name (e.g., "Monday")
 * @returns {string} Abbreviated day (e.g., "Mon")
 */
export function abbreviateDay(day) {
  const dayMap = {
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
    Saturday: "Sat",
    Sunday: "Sun",
  };
  return dayMap[day] || day;
}

/**
 * Format meeting time display from meeting object
 * @param {object} meeting - Meeting object with days, startTime, endTime
 * @param {boolean} compact - Use compact format (MWF vs Mon & Wed & Fri)
 * @returns {string|null} Formatted meeting time or null
 */
export function formatMeetingTime(meeting, compact = false) {
  if (!meeting) return null;

  const { days, startTime, endTime } = meeting;

  // Format days
  let daysDisplay = "";
  if (days && days.length > 0) {
    if (compact) {
      // Compact: MWF
      daysDisplay = days.map((day) => abbreviateDay(day).charAt(0)).join("");
    } else {
      // Full: Mon & Wed & Fri
      daysDisplay = days.map((day) => abbreviateDay(day)).join(" & ");
    }
  }

  // Format times
  const timesDisplay = startTime && endTime ? `${startTime} - ${endTime}` : "";

  // Combine
  if (daysDisplay && timesDisplay) {
    return `${daysDisplay} ${timesDisplay}`;
  } else if (daysDisplay) {
    return daysDisplay;
  } else if (timesDisplay) {
    return timesDisplay;
  }

  return null;
}

/**
 * Format location display from meeting object
 * @param {object} meeting - Meeting object with building, room, location
 * @returns {string|null} Formatted location or null
 */
export function formatLocation(meeting) {
  if (!meeting) return null;

  const { building, room, location } = meeting;

  // Check if it's online
  const isOnline =
    building?.toLowerCase() === "online" ||
    location?.toLowerCase().includes("online");

  if (isOnline) {
    return "Online";
  }

  // Building + Room format
  if (building && room) {
    return `${building} ${room}`;
  }

  // Fallback to location field
  if (location) {
    return location;
  }

  return null;
}

/**
 * Get primary meeting info (first meeting time)
 * @param {object} course - Course object with meetingTimes array
 * @returns {object} Object with formatted meeting and location strings
 */
export function getPrimaryMeeting(course) {
  const primaryMeeting = course?.meetingTimes?.[0];

  if (!primaryMeeting) {
    return {
      meeting: null,
      location: null,
    };
  }

  return {
    meeting: formatMeetingTime(primaryMeeting),
    location: formatLocation(primaryMeeting),
  };
}

/**
 * Format instructor name
 * @param {object|string} instructor - Instructor object or string
 * @returns {string|null} Formatted instructor name
 */
export function formatInstructor(instructor) {
  if (!instructor) return null;

  if (typeof instructor === "string") {
    return instructor;
  }

  if (instructor.name) {
    return instructor.name;
  }

  // Fallback to firstName + lastName if available
  if (instructor.firstName && instructor.lastName) {
    return `${instructor.firstName} ${instructor.lastName}`;
  }

  return null;
}

/**
 * Check if a course is online
 * @param {object} course - Course object
 * @returns {boolean} True if course is online
 */
export function isOnlineCourse(course) {
  if (!course?.meetingTimes || course.meetingTimes.length === 0) {
    return false;
  }

  // Check if all meetings are online
  return course.meetingTimes.every((meeting) => {
    return (
      meeting.building?.toLowerCase() === "online" ||
      meeting.location?.toLowerCase().includes("online")
    );
  });
}

/**
 * Get all meeting times formatted
 * @param {object} course - Course object with meetingTimes array
 * @param {boolean} compact - Use compact format
 * @returns {array} Array of formatted meeting strings
 */
export function getAllMeetingTimes(course, compact = false) {
  if (!course?.meetingTimes) return [];

  return course.meetingTimes
    .map((meeting) => formatMeetingTime(meeting, compact))
    .filter(Boolean);
}
