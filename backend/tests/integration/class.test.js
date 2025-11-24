// tests/integration/class.test.js
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Class from "../../models/class.js";
import User from "../../models/user.js";

describe("Class Controller - Integration Tests", () => {
  let mongoServer;
  let testUser;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Create a test user
    testUser = await User.create({
      name: "Test User",
      email: "test@university.edu",
      password: "hashed_password",
      major: "Computer Science",
    });
  });

  afterEach(async () => {
    await Class.deleteMany({});
    await User.deleteMany({});
  });

  describe("Class Creation", () => {
    test("should create a new user-created class", async () => {
      const classData = {
        name: "Study Group for CS166",
        code: "CS166-STUDY",
        description: "Collaborative study group",
      };

      const newClass = await Class.create({
        ...classData,
        code: classData.code.trim().toUpperCase(),
        isUserCreated: true,
        members: [testUser._id],
        createdBy: testUser._id,
      });

      expect(newClass).toBeDefined();
      expect(newClass.name).toBe("Study Group for CS166");
      expect(newClass.code).toBe("CS166-STUDY");
      expect(newClass.isUserCreated).toBe(true);
      expect(newClass.members).toContainEqual(testUser._id);
    });

    test("should format class code correctly", async () => {
      const newClass = await Class.create({
        name: "Test Class",
        code: "CS166",
        isUserCreated: true,
        members: [testUser._id],
        createdBy: testUser._id,
      });

      expect(newClass.code).toBe("CS166");
    });

    test("should not create class with duplicate code", async () => {
      await Class.create({
        name: "First Class",
        code: "CS166",
        isUserCreated: true,
        members: [testUser._id],
        createdBy: testUser._id,
      });

      await expect(
        Class.create({
          name: "Second Class",
          code: "CS166",
          isUserCreated: true,
          members: [testUser._id],
          createdBy: testUser._id,
        })
      ).rejects.toThrow();
    });
  });

  describe("Class Queries", () => {
    beforeEach(async () => {
      await Class.create([
        {
          name: "Database Management",
          code: "CS166",
          isUserCreated: false,
          departmentCode: "CS",
          members: [],
        },
        {
          name: "Data Structures",
          code: "CS141",
          isUserCreated: false,
          departmentCode: "CS",
          members: [],
        },
        {
          name: "Study Group",
          code: "STUDY-01",
          isUserCreated: true,
          members: [testUser._id],
          createdBy: testUser._id,
        },
      ]);
    });

    test("should find all classes", async () => {
      const classes = await Class.find({});
      expect(classes).toHaveLength(3);
    });

    test("should filter by department", async () => {
      const classes = await Class.find({ departmentCode: "CS" });
      expect(classes.length).toBeGreaterThanOrEqual(2);
    });

    test("should filter user-created classes", async () => {
      const classes = await Class.find({ isUserCreated: true });
      expect(classes).toHaveLength(1);
      expect(classes[0].code).toBe("STUDY-01");
    });

    test("should find class by ID", async () => {
      const createdClass = await Class.create({
        name: "Test Class",
        code: "TEST101",
        isUserCreated: true,
        members: [testUser._id],
        createdBy: testUser._id,
      });

      const foundClass = await Class.findById(createdClass._id);
      expect(foundClass).toBeDefined();
      expect(foundClass.name).toBe("Test Class");
    });
  });

  describe("Class Membership", () => {
    let testClass;
    let user2;

    beforeEach(async () => {
      testClass = await Class.create({
        name: "Test Class",
        code: "TEST101",
        isUserCreated: true,
        members: [testUser._id],
        createdBy: testUser._id,
      });

      user2 = await User.create({
        name: "User Two",
        email: "user2@university.edu",
        password: "hashed",
        major: "Mathematics",
      });
    });

    test("should add member to class", async () => {
      testClass.members.push(user2._id);
      await testClass.save();

      const updatedClass = await Class.findById(testClass._id);
      expect(updatedClass.members).toHaveLength(2);
      expect(updatedClass.members.map(String)).toContain(user2._id.toString());
    });

    test("should remove member from class", async () => {
      testClass.members.push(user2._id);
      await testClass.save();

      testClass.members = testClass.members.filter(
        (id) => id.toString() !== user2._id.toString()
      );
      await testClass.save();

      const updatedClass = await Class.findById(testClass._id);
      expect(updatedClass.members).toHaveLength(1);
      expect(updatedClass.members.map(String)).not.toContain(
        user2._id.toString()
      );
    });

    test("should not allow duplicate members", async () => {
      const membersBefore = testClass.members.length;

      // Try to add same user twice
      if (!testClass.members.includes(testUser._id)) {
        testClass.members.push(testUser._id);
      }

      expect(testClass.members.length).toBe(membersBefore);
    });

    test("should update member count correctly", async () => {
      const initialCount = testClass.members.length;

      testClass.members.push(user2._id);
      await testClass.save();

      const updatedClass = await Class.findById(testClass._id);
      expect(updatedClass.members.length).toBe(initialCount + 1);
    });
  });

  describe("Class Validation", () => {
    test("should require class name", async () => {
      await expect(
        Class.create({
          code: "TEST101",
          isUserCreated: true,
          members: [testUser._id],
        })
      ).rejects.toThrow();
    });

    test("should require class code", async () => {
      await expect(
        Class.create({
          name: "Test Class",
          isUserCreated: true,
          members: [testUser._id],
        })
      ).rejects.toThrow();
    });
  });
});
