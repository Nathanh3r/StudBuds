// finalUCRFetcher.cjs - Using the correct Course Description endpoint!

const axios = require("axios");
const tough = require("tough-cookie");
const fs = require("fs");

let wrapper;
let synchronizerToken = null;
let client;
let cookieJar;

async function loadWrapper() {
  if (!wrapper) {
    const mod = await import("axios-cookiejar-support");
    wrapper = mod.wrapper;
  }
}

async function createClient() {
  await loadWrapper();
  cookieJar = new tough.CookieJar();
  return wrapper(
    axios.create({
      jar: cookieJar,
      withCredentials: true,
      timeout: 30000,
    })
  );
}

async function establishSession() {
  console.log("🔐 Establishing session...");
  client = await createClient();

  try {
    const response = await client.get(
      "https://registrationssb.ucr.edu/StudentRegistrationSsb/ssb/classSearch/classSearch",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      }
    );

    const html = response.data;
    const patterns = [
      /X-Synchronizer-Token["']?\s*[:=]\s*["']([a-f0-9-]+)["']/i,
      /<meta\s+name=["']X-Synchronizer-Token["']\s+content=["']([a-f0-9-]+)["']/i,
      /synchronizerToken["']?\s*[:=]\s*["']([a-f0-9-]+)["']/i,
      /"synchronizerToken"\s*:\s*"([a-f0-9-]+)"/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        synchronizerToken = match[1];
        console.log(
          "  ✓ Got synchronizer token:",
          synchronizerToken.slice(0, 20) + "..."
        );
        break;
      }
    }

    if (!synchronizerToken) {
      const uuidPattern =
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
      const allUUIDs = html.match(uuidPattern);
      if (allUUIDs && allUUIDs.length > 0) {
        synchronizerToken = allUUIDs[0];
        console.log(
          "  ⚠ Using first UUID as token:",
          synchronizerToken.slice(0, 20) + "..."
        );
      } else {
        return { success: false };
      }
    }

    return { success: true, token: synchronizerToken };
  } catch (error) {
    console.error("  ✗ Error establishing session:", error.message);
    return { success: false };
  }
}

async function getTerms() {
  console.log("\n📅 Getting available terms...");

  try {
    const response = await client.get(
      "https://registrationssb.ucr.edu/StudentRegistrationSsb/ssb/classSearch/getTerms",
      {
        params: { searchTerm: "", offset: 1, max: 10 },
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "application/json, text/javascript, */*; q=0.01",
          "X-Requested-With": "XMLHttpRequest",
          "X-Synchronizer-Token": synchronizerToken,
          Referer:
            "https://registrationssb.ucr.edu/StudentRegistrationSsb/ssb/classSearch/classSearch",
        },
      }
    );

    if (response.data?.length > 0) {
      console.log(`  ✓ Found ${response.data.length} terms`);
      return response.data;
    }
  } catch (error) {
    console.error("  ✗ Error getting terms:", error.message);
  }

  return [];
}

async function setTerm(termCode) {
  console.log(`\n📝 Setting term to ${termCode}...`);

  try {
    await client.post(
      "https://registrationssb.ucr.edu/StudentRegistrationSsb/ssb/term/search?mode=search",
      `term=${termCode}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Requested-With": "XMLHttpRequest",
          "X-Synchronizer-Token": synchronizerToken,
          Referer:
            "https://registrationssb.ucr.edu/StudentRegistrationSsb/ssb/classSearch/classSearch",
        },
      }
    );

    console.log("  ✓ Term set");
    return true;
  } catch (error) {
    console.error("  ✗ Error setting term:", error.message);
    return false;
  }
}

async function resetSearch() {
  try {
    await client.post(
      "https://registrationssb.ucr.edu/StudentRegistrationSsb/ssb/classSearch/resetDataForm",
      {},
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "X-Requested-With": "XMLHttpRequest",
          "X-Synchronizer-Token": synchronizerToken,
          Referer:
            "https://registrationssb.ucr.edu/StudentRegistrationSsb/ssb/classSearch/classSearch",
        },
      }
    );
    return true;
  } catch (error) {
    return false;
  }
}

// FIXED: Use the getCourseDescription endpoint instead of getClassDetails!
async function getCourseDescription(term, courseReferenceNumber) {
  try {
    const response = await client.post(
      "https://registrationssb.ucr.edu/StudentRegistrationSsb/ssb/searchResults/getCourseDescription",
      `term=${term}&courseReferenceNumber=${courseReferenceNumber}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Accept: "text/html, */*; q=0.01",
          "X-Requested-With": "XMLHttpRequest",
          "X-Synchronizer-Token": synchronizerToken,
          Referer:
            "https://registrationssb.ucr.edu/StudentRegistrationSsb/ssb/classSearch/classSearch",
        },
      }
    );

    let description = response.data;

    // The response should be the raw description text
    if (!description || description.length < 10) {
      return null;
    }

    // Clean HTML tags
    description = description
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .trim();

    // Remove prerequisite and credit sentences
    const sentences = description.split(/\.\s+/);
    let cleanSentences = [];

    for (const sentence of sentences) {
      const trimmed = sentence.trim();

      // Skip metadata sentences
      if (trimmed.match(/^Prerequisite\(s\):/i)) continue;
      if (trimmed.match(/^Credit is awarded/i)) continue;
      if (trimmed.match(/^May be taken/i)) continue;
      if (trimmed.match(/^Cross-listed/i)) continue;
      if (trimmed.match(/^Graded/i)) continue;
      if (trimmed.match(/^\d+\s+Units?,/i)) continue;

      cleanSentences.push(trimmed);
    }

    description = cleanSentences.join(". ").trim();
    description = description.replace(/\s+/g, " ").trim();

    if (description.length > 20) {
      return description;
    }

    return null;
  } catch (error) {
    return null;
  }
}

async function searchCourses(termCode, subject) {
  console.log(`\n🔍 Searching ${subject} courses...`);

  try {
    await resetSearch();
    await new Promise((r) => setTimeout(r, 500));

    const uniqueSessionId = Math.random().toString(36).substring(2, 15);

    const response = await client.get(
      "https://registrationssb.ucr.edu/StudentRegistrationSsb/ssb/searchResults/searchResults",
      {
        params: {
          txt_subject: subject,
          txt_term: termCode,
          uniqueSessionId: uniqueSessionId,
          pageOffset: 0,
          pageMaxSize: 500,
          sortColumn: "subjectDescription",
          sortDirection: "asc",
        },
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "application/json, text/javascript, */*; q=0.01",
          "X-Requested-With": "XMLHttpRequest",
          "X-Synchronizer-Token": synchronizerToken,
          Referer:
            "https://registrationssb.ucr.edu/StudentRegistrationSsb/ssb/classSearch/classSearch",
        },
      }
    );

    if (response.data.success && response.data.totalCount > 0) {
      console.log(
        `  ✓ ${response.data.totalCount} sections, extracting courses...`
      );

      const courses = new Map();
      response.data.data.forEach((section) => {
        const key = `${section.subject}${section.courseNumber}`;
        if (!courses.has(key)) {
          courses.set(key, {
            code: key,
            title: section.courseTitle,
            subject: section.subject,
            courseNumber: section.courseNumber,
            sections: [],
            firstCRN: section.courseReferenceNumber,
          });
        }
        courses.get(key).sections.push(section);
      });

      console.log(`  ✓ ${courses.size} unique courses`);
      console.log(`  📖 Fetching descriptions...`);

      let descCount = 0;
      const coursesArray = Array.from(courses.values());

      for (let i = 0; i < coursesArray.length; i++) {
        const course = coursesArray[i];

        await new Promise((r) => setTimeout(r, 400));

        const description = await getCourseDescription(
          termCode,
          course.firstCRN
        );
        if (description) {
          course.description = description;
          descCount++;
        }

        if ((i + 1) % 10 === 0 || i === coursesArray.length - 1) {
          console.log(
            `     ${i + 1}/${coursesArray.length} (${descCount} descriptions)`
          );
        }
      }

      console.log(
        `  ✓ ${descCount}/${coursesArray.length} (${(
          (descCount / coursesArray.length) *
          100
        ).toFixed(1)}%)`
      );

      // Show samples
      const withDesc = coursesArray.filter((c) => c.description).slice(0, 2);
      if (withDesc.length > 0) {
        console.log(`\n  📚 Samples:`);
        withDesc.forEach((c) => {
          console.log(`    ${c.code}: "${c.description.substring(0, 70)}..."`);
        });
      }

      return {
        coursesWithDescriptions: coursesArray,
      };
    } else {
      console.log(`  ⚠ No courses found`);
      return null;
    }
  } catch (error) {
    console.error(`  ✗ Error:`, error.message);
    return null;
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log("UCR Course Fetcher - Final Version!");
  console.log("=".repeat(60));
  console.log("");

  const session = await establishSession();
  if (!session.success) return console.log("\n❌ Session failed");

  await new Promise((r) => setTimeout(r, 1000));

  const terms = await getTerms();
  if (terms.length === 0) return console.log("\n❌ No terms");

  const currentTerm = terms[0];
  console.log(`\n📌 Term: ${currentTerm.description}`);

  await new Promise((r) => setTimeout(r, 1000));
  if (!(await setTerm(currentTerm.code)))
    return console.log("\n❌ Failed to set term");

  const subjects = ["CS", "MATH", "ECON", "BIOL", "CHEM", "PHYS", "PSYC"];
  const allCourses = {};
  let totalCourses = 0;
  let totalWithDescriptions = 0;

  for (const subject of subjects) {
    await new Promise((r) => setTimeout(r, 2000));

    const data = await searchCourses(currentTerm.code, subject);

    if (data && data.coursesWithDescriptions) {
      allCourses[subject] = data.coursesWithDescriptions;
      totalCourses += data.coursesWithDescriptions.length;

      const withDesc = data.coursesWithDescriptions.filter(
        (c) => c.description
      ).length;
      totalWithDescriptions += withDesc;

      const filename = `ucr_${subject}_${currentTerm.code}_final.json`;
      fs.writeFileSync(
        filename,
        JSON.stringify(
          {
            term: currentTerm,
            subject: subject,
            courses: data.coursesWithDescriptions,
          },
          null,
          2
        )
      );
      console.log(`\n  💾 ${filename}`);
    }
  }

  fs.writeFileSync(
    `ucr_all_${currentTerm.code}.json`,
    JSON.stringify(
      {
        term: currentTerm,
        generatedAt: new Date().toISOString(),
        subjects: allCourses,
      },
      null,
      2
    )
  );

  console.log("\n" + "=".repeat(60));
  console.log("📊 SUMMARY");
  console.log("=".repeat(60));
  console.log(`Courses: ${totalCourses}`);
  console.log(
    `With descriptions: ${totalWithDescriptions} (${(
      (totalWithDescriptions / totalCourses) *
      100
    ).toFixed(1)}%)`
  );
  console.log("=".repeat(60));
  console.log("✅ COMPLETE!");
  console.log("=".repeat(60));
}

main().catch(console.error);
