// transformAndImport.js - Transform UCR API data to StudBuds schema

const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

// Your existing Class schema
const classSchema = new mongoose.Schema(
  {
    name: String,
    code: { type: String, required: true, unique: true },
    description: String,

    // Department info
    department: String,
    departmentCode: String,
    courseNumber: String,

    // Current term info
    term: String,
    termCode: String,
    year: Number,

    // Instructor info
    instructor: {
      name: String,
      email: String,
    },

    // Schedule
    meetingTimes: [
      {
        days: [String],
        startTime: String,
        endTime: String,
        location: String,
        building: String,
        room: String,
      },
    ],

    // Course info
    units: Number,
    instructionalMethod: String, // "In-Person", "Online", "Hybrid"

    // Enrollment
    maxStudents: Number,
    enrolledCount: Number,
    seatsAvailable: Number,

    // All sections (lectures, discussions, labs)
    sections: [
      {
        crn: String,
        sectionNumber: String,
        scheduleType: String, // "Lecture", "Discussion", "Laboratory"
        instructor: String,
        instructorEmail: String,
        meetingTimes: [
          {
            days: [String],
            startTime: String,
            endTime: String,
            location: String,
          },
        ],
        enrollment: Number,
        maxEnrollment: Number,
        seatsAvailable: Number,
      },
    ],

    // StudBuds features
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const Class = mongoose.model("Class", classSchema);

// Helper: Format time from "1230" to "12:30 PM"
function formatTime(timeStr) {
  if (!timeStr) return null;
  const hours = parseInt(timeStr.substring(0, 2));
  const mins = timeStr.substring(2, 4);
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${mins} ${ampm}`;
}

// Helper: Get days array from meeting time
function getDaysArray(meetingTime) {
  const days = [];
  if (meetingTime.monday) days.push("Monday");
  if (meetingTime.tuesday) days.push("Tuesday");
  if (meetingTime.wednesday) days.push("Wednesday");
  if (meetingTime.thursday) days.push("Thursday");
  if (meetingTime.friday) days.push("Friday");
  if (meetingTime.saturday) days.push("Saturday");
  if (meetingTime.sunday) days.push("Sunday");
  return days;
}

// Transform UCR API data to StudBuds format
function transformCourseData(coursesArray) {
  if (!coursesArray || coursesArray.length === 0) {
    return [];
  }

  const courses = [];

  for (const course of coursesArray) {
    // Get main section (first section, usually lecture)
    const mainSection = course.sections[0];
    const meeting = mainSection?.meetingsFaculty?.[0]?.meetingTime;
    const faculty = mainSection?.faculty?.[0];

    const transformedCourse = {
      // Basic info
      code: course.code,
      name: course.title,
      description: course.description || "", // Now we have descriptions!

      // Department
      department: course.subject,
      departmentCode: course.subject,
      courseNumber: course.courseNumber,

      // Term
      term: mainSection?.termDesc || "",
      termCode: mainSection?.term || "",
      year: mainSection?.term
        ? parseInt(mainSection.term.substring(0, 4))
        : null,

      // Instructor (from main section)
      instructor: {
        name: faculty?.displayName || "Staff",
        email: faculty?.emailAddress || "",
      },

      // Meeting times (from main section)
      meetingTimes: meeting
        ? [
            {
              days: getDaysArray(meeting),
              startTime: formatTime(meeting.beginTime),
              endTime: formatTime(meeting.endTime),
              location: `${meeting.buildingDescription || ""} ${
                meeting.room || ""
              }`.trim(),
              building: meeting.buildingDescription || "",
              room: meeting.room || "",
            },
          ]
        : [],

      // Course info
      units: mainSection?.creditHours || 4,
      instructionalMethod: mainSection?.instructionalMethodDescription || "",

      // Enrollment (from main section)
      maxStudents: mainSection?.maximumEnrollment || 0,
      enrolledCount: mainSection?.enrollment || 0,
      seatsAvailable: mainSection?.seatsAvailable || 0,

      // All sections
      sections: (course.sections || []).map((sec) => {
        const secMeeting = sec.meetingsFaculty?.[0]?.meetingTime;
        const secFaculty = sec.faculty?.[0];

        return {
          crn: sec.courseReferenceNumber,
          sectionNumber: sec.sequenceNumber,
          scheduleType: sec.scheduleTypeDescription,
          instructor: secFaculty?.displayName || "",
          instructorEmail: secFaculty?.emailAddress || "",
          meetingTimes: secMeeting
            ? [
                {
                  days: getDaysArray(secMeeting),
                  startTime: formatTime(secMeeting.beginTime),
                  endTime: formatTime(secMeeting.endTime),
                  location: `${secMeeting.buildingDescription || ""} ${
                    secMeeting.room || ""
                  }`.trim(),
                },
              ]
            : [],
          enrollment: sec.enrollment || 0,
          maxEnrollment: sec.maximumEnrollment || 0,
          seatsAvailable: sec.seatsAvailable || 0,
        };
      }),

      // Empty StudBuds arrays
      members: [],
      createdBy: null,
    };

    courses.push(transformedCourse);
  }

  return courses;
}

// Load and process the combined JSON file
async function processFiles() {
  const mainFile = "ucr_all_202610.json";

  if (!fs.existsSync(mainFile)) {
    console.error(`❌ ${mainFile} not found!`);
    console.log("\nLooking for UCR course files...");
    const files = fs
      .readdirSync(".")
      .filter((f) => f.startsWith("ucr_") && f.endsWith(".json"));
    if (files.length > 0) {
      console.log("Found these files:");
      files.forEach((f) => console.log(`  - ${f}`));
      console.log(
        `\nPlease rename one to ${mainFile} or update the filename in the script.`
      );
    }
    process.exit(1);
  }

  console.log(`\n📂 Processing ${mainFile}...`);
  const data = JSON.parse(fs.readFileSync(mainFile, "utf8"));

  let allCourses = [];

  // Process each subject in the combined file
  if (data.subjects) {
    for (const [subject, coursesArray] of Object.entries(data.subjects)) {
      console.log(`\n📚 Processing ${subject}...`);
      const courses = transformCourseData(coursesArray);

      console.log(`  ✓ Found ${courses.length} courses`);

      // Show samples with descriptions
      const samplesWithDesc = courses.filter((c) => c.description).slice(0, 2);
      if (samplesWithDesc.length > 0) {
        console.log(`  Sample courses with descriptions:`);
        samplesWithDesc.forEach((c) => {
          console.log(`    - ${c.code}: ${c.name}`);
          console.log(`      "${c.description.substring(0, 60)}..."`);
        });
      }

      allCourses.push(...courses);
    }
  } else {
    console.error("❌ Invalid file format - expected 'subjects' object");
    process.exit(1);
  }

  // Remove duplicates by course code
  const uniqueCourses = Array.from(
    new Map(allCourses.map((c) => [c.code, c])).values()
  );

  console.log(
    `\n📊 Total: ${allCourses.length} courses (${uniqueCourses.length} unique)`
  );

  // Count courses with descriptions
  const withDescriptions = uniqueCourses.filter(
    (c) => c.description && c.description.length > 20
  ).length;
  console.log(
    `   ${withDescriptions} courses have descriptions (${(
      (withDescriptions / uniqueCourses.length) *
      100
    ).toFixed(1)}%)`
  );

  // Save transformed data
  fs.writeFileSync(
    "final_studbuds_courses.json",
    JSON.stringify(uniqueCourses, null, 2)
  );
  console.log("✓ Saved to final_studbuds_courses.json");

  return uniqueCourses;
}

// Import to MongoDB
async function importToDatabase(courses) {
  try {
    console.log("\n🗄️  Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("  ✓ Connected");

    console.log("\n📥 Importing courses...");
    let imported = 0;
    let updated = 0;

    for (const course of courses) {
      const result = await Class.findOneAndUpdate(
        { code: course.code },
        course,
        { upsert: true, new: true }
      );

      if (result) {
        imported++;
        if (imported % 50 === 0) {
          console.log(`  Progress: ${imported}/${courses.length}`);
        }
      }
    }

    console.log(`\n✅ Import complete!`);
    console.log(`  - Imported/Updated: ${imported} courses`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("\n❌ Database error:", error);
  }
}

// Main
async function main() {
  console.log("=".repeat(60));
  console.log("UCR Data Transformer - With Descriptions!");
  console.log("=".repeat(60));

  // Step 1: Transform data
  const courses = await processFiles();

  // Step 2: Import to database (uncomment when ready)
  // await importToDatabase(courses);

  console.log("\n" + "=".repeat(60));
  console.log("✅ Done!");
  console.log("=".repeat(60));
  console.log("\nNext steps:");
  console.log("  1. Review final_studbuds_courses.json");
  console.log('  2. Uncomment "await importToDatabase(courses)" to import');
  console.log("  3. Run: MONGODB_URI=your_uri node transformAndImport.js");
}

main().catch(console.error);
