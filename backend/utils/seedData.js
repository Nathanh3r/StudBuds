// backend/scripts/seedData.js
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Class = require("../models/Class");
const Post = require("../models/Post");
const User = require("../models/User");

const seedData = async () => {
  try {
    await connectDB();

    // Get first user from database (or create one if needed)
    let user = await User.findOne();
    if (!user) {
      console.log(
        "⚠️  No users found. Create a user first via /api/auth/register"
      );
      process.exit(1);
    }

    console.log(`📝 Using user: ${user.name} (${user.email})`);

    // Sample classes
    const sampleClasses = [
      {
        name: "Introduction to Computer Science",
        code: "CS010",
        description: "Fundamental concepts of computer science",
        members: [user._id],
        createdBy: user._id,
      },
      {
        name: "Data Structures & Algorithms",
        code: "CS014",
        description: "Learn about arrays, linked lists, trees, and more",
        members: [user._id],
        createdBy: user._id,
      },
      {
        name: "Calculus II",
        code: "MATH009B",
        description: "Integration techniques and applications",
        members: [user._id],
        createdBy: user._id,
      },
    ];

    // Clear existing data
    await Class.deleteMany({});
    await Post.deleteMany({});
    console.log("🗑️  Cleared existing classes and posts");

    // Create classes
    const classes = await Class.insertMany(sampleClasses);
    console.log(`✅ Created ${classes.length} classes`);

    // Add user classes to user document
    await User.findByIdAndUpdate(user._id, {
      classes: classes.map((c) => c._id),
    });

    // Sample posts for first class
    const samplePosts = [
      "Does anyone have notes from Wednesday's lecture?",
      "Study group meeting at Rivera Library tomorrow at 3pm! DM me if interested",
      "Can someone explain recursion? I'm so confused 😅",
      "Professor just posted the exam review guide!",
      "Looking for a partner for the final project. I'm interested in doing something with AI.",
    ];

    const posts = [];
    for (const content of samplePosts) {
      posts.push({
        classId: classes[0]._id,
        author: user._id,
        content,
        createdAt: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ), // Random time in last week
      });
    }

    await Post.insertMany(posts);
    console.log(`✅ Created ${posts.length} sample posts`);

    console.log("\n🎉 Sample data created successfully!");
    console.log(`\n📚 Classes created:`);
    classes.forEach((c) => console.log(`   - ${c.code}: ${c.name}`));

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
