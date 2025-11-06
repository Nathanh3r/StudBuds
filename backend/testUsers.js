import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "./models/user.js";

dotenv.config();

const users = [
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
  }
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await User.deleteMany(); // clear old users

    const salt = await bcrypt.genSalt(10);
    for (let user of users) {
      user.password = await bcrypt.hash(user.password, salt);
    }

    await User.insertMany(users);
    console.log(" Test users seeded successfully!");
    mongoose.disconnect();
  } catch (err) {
    console.error(" Seeding error:", err);
    mongoose.disconnect();
  }
};

seedUsers();
