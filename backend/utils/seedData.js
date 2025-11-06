// backend/scripts/seedData.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import Class from "../models/Class.js";
import Post from "../models/Post.js";
import connectDB from "../config/db.js";

dotenv.config();

const testUsers = [
  {
    name: "Alice Johnson",
    email: "alice@university.edu",
    password: "password123",
    major: "Psychology",
    bio: "Loves research.",
  },
  {
    name: "Bob Smith",
    email: "bob@college.edu",
    password: "password123",
    major: "Engineering",
    bio: "Future innovator.",
  },
];

const seedData = async () => {
  try {
    // Connect to database
    connectDB();
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Class.deleteMany({});
    await Post.deleteMany({});
    console.log("Cleared existing users, classes, and posts");

    // Hash passwords and create users
    const salt = await bcrypt.genSalt(10);
    for (let user of testUsers) {
      user.password = await bcrypt.hash(user.password, salt);
    }

    const users = await User.insertMany(testUsers);
    console.log(`Created ${users.length} test users`);
    users.forEach((u) => console.log(`   - ${u.name} (${u.email})`));

    // Use first user for creating classes
    const primaryUser = users[0];

    // Sample classes
    const sampleClasses = [
      {
        name: "Introduction to Computer Science",
        code: "CS010",
        description: "Fundamental concepts of computer science",
        members: users.map((u) => u._id), // Add all users as members
        createdBy: primaryUser._id,
      },
      {
        name: "Data Structures & Algorithms",
        code: "CS014",
        description: "Learn about arrays, linked lists, trees, and more",
        members: users.map((u) => u._id),
        createdBy: primaryUser._id,
      },
      {
        name: "Calculus II",
        code: "MATH009B",
        description: "Integration techniques and applications",
        members: [primaryUser._id], // Only first user in this class
        createdBy: primaryUser._id,
      },
    ];

    // Create classes
    const classes = await Class.insertMany(sampleClasses);
    console.log(`Created ${classes.length} classes`);

    // Update users with their classes
    for (const user of users) {
      await User.findByIdAndUpdate(user._id, {
        classes: classes.map((c) => c._id),
      });
    }

    // Sample posts for first class
    const samplePosts = [
      {
        content: "Does anyone have notes from Wednesday's lecture?",
        author: users[0]._id,
      },
      {
        content:
          "Study group meeting at Rivera Library tomorrow at 3pm! DM me if interested",
        author: users[1]._id,
      },
      {
        content: "Can someone explain recursion? I'm so confused 😅",
        author: users[0]._id,
      },
      {
        content: "Professor just posted the exam review guide!",
        author: users[1]._id,
      },
      {
        content:
          "Looking for a partner for the final project. I'm interested in doing something with AI.",
        author: users[0]._id,
      },
    ];

    const posts = [];
    for (const postData of samplePosts) {
      posts.push({
        classId: classes[0]._id,
        author: postData.author,
        content: postData.content,
        createdAt: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ), // Random time in last week
      });
    }

    await Post.insertMany(posts);
    console.log(`Created ${posts.length} sample posts`);

    console.log("\nSample data created successfully!");
    console.log(`\nClasses created:`);
    classes.forEach((c) => console.log(`   - ${c.code}: ${c.name}`));
    console.log(`\nTest login credentials:`);
    console.log(`   Email: alice@university.edu`);
    console.log(`   Password: password123`);

    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    mongoose.disconnect();
    process.exit(1);
  }
};

seedData();
