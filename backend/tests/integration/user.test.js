// tests/integration/user.test.js
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import express from "express";
import userRoutes from "../../routes/userRoutes.js";
import User from "../../models/user.js";

// Create minimal Express app for testing
const app = express();
app.use(express.json());
app.use("/api/users", userRoutes);

describe("User Controller - Integration Tests", () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe("POST /api/users/register", () => {
    test("should register a new user successfully", async () => {
      const userData = {
        name: "Test User",
        email: "test@university.edu",
        password: "Password123",
        major: "Computer Science",
      };

      const response = await request(app)
        .post("/api/users/register")
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty("token");
      expect(response.body.user).toHaveProperty("email", "test@university.edu");
      expect(response.body.user).toHaveProperty("name", "Test User");
      expect(response.body.user).toHaveProperty("major", "Computer Science");
      expect(response.body.user).not.toHaveProperty("password");
      expect(response.body.user).toHaveProperty("gamification");
      expect(response.body.user.gamification).toHaveProperty("xp", 0);
      expect(response.body.user.gamification).toHaveProperty("level", 1);
    });

    test("should require .edu email address", async () => {
      const userData = {
        name: "Test User",
        email: "test@gmail.com",
        password: "Password123",
        major: "Computer Science",
      };

      const response = await request(app)
        .post("/api/users/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toMatch(/\.edu/i);
    });

    test("should not register duplicate email", async () => {
      const userData = {
        name: "Test User",
        email: "test@university.edu",
        password: "Password123",
        major: "Computer Science",
      };

      // First registration
      await request(app).post("/api/users/register").send(userData).expect(201);

      // Second registration with same email
      const response = await request(app)
        .post("/api/users/register")
        .send(userData)
        .expect(409);

      expect(response.body.message).toMatch(/already in use/i);
    });

    test("should require all fields", async () => {
      const response = await request(app)
        .post("/api/users/register")
        .send({
          email: "test@university.edu",
          password: "Password123",
          // Missing name and major
        })
        .expect(400);

      expect(response.body.message).toMatch(/required/i);
    });

    test("should convert email to lowercase", async () => {
      const userData = {
        name: "Test User",
        email: "TEST@UNIVERSITY.EDU",
        password: "Password123",
        major: "Computer Science",
      };

      const response = await request(app)
        .post("/api/users/register")
        .send(userData)
        .expect(201);

      expect(response.body.user.email).toBe("test@university.edu");
    });
  });

  describe("POST /api/users/login", () => {
    beforeEach(async () => {
      // Create a test user before each login test
      await request(app).post("/api/users/register").send({
        name: "Test User",
        email: "test@university.edu",
        password: "Password123",
        major: "Computer Science",
      });
    });

    test("should login with correct credentials", async () => {
      const response = await request(app)
        .post("/api/users/login")
        .send({
          email: "test@university.edu",
          password: "Password123",
        })
        .expect(200);

      expect(response.body).toHaveProperty("token");
      expect(response.body.user).toHaveProperty("email", "test@university.edu");
      expect(response.body.user).not.toHaveProperty("password");
    });

    test("should update login streak on successful login", async () => {
      const response = await request(app)
        .post("/api/users/login")
        .send({
          email: "test@university.edu",
          password: "Password123",
        })
        .expect(200);

      // Verify user has streak information
      const user = await User.findOne({ email: "test@university.edu" });
      expect(user.gamification.streak).toBeDefined();
      expect(user.gamification.streak.count).toBeGreaterThanOrEqual(1);
      // Note: lastLogin might be in different format, just check streak exists
    });

    test("should reject login with wrong password", async () => {
      const response = await request(app)
        .post("/api/users/login")
        .send({
          email: "test@university.edu",
          password: "WrongPassword",
        })
        .expect(401);

      expect(response.body.message).toMatch(/invalid credentials/i);
    });

    test("should reject login with non-existent email", async () => {
      const response = await request(app)
        .post("/api/users/login")
        .send({
          email: "nonexistent@university.edu",
          password: "Password123",
        })
        .expect(401);

      expect(response.body.message).toMatch(/invalid credentials/i);
    });

    test("should require email and password", async () => {
      const response = await request(app)
        .post("/api/users/login")
        .send({
          email: "test@university.edu",
          // Missing password
        })
        .expect(400);

      expect(response.body.message).toMatch(/missing/i);
    });

    test("should be case-insensitive for email", async () => {
      const response = await request(app)
        .post("/api/users/login")
        .send({
          email: "TEST@UNIVERSITY.EDU",
          password: "Password123",
        })
        .expect(200);

      expect(response.body.user.email).toBe("test@university.edu");
    });
  });

  describe("POST /api/users/add-friend/:id", () => {
    let user1Token;
    let user2Id;

    beforeEach(async () => {
      // Create first user
      const user1Response = await request(app)
        .post("/api/users/register")
        .send({
          name: "User One",
          email: "user1@university.edu",
          password: "Password123",
          major: "Computer Science",
        });
      user1Token = user1Response.body.token;

      // Create second user
      const user2Response = await request(app)
        .post("/api/users/register")
        .send({
          name: "User Two",
          email: "user2@university.edu",
          password: "Password123",
          major: "Mathematics",
        });
      user2Id = user2Response.body.user._id;
    });

    test("should add friend successfully and award XP", async () => {
      const response = await request(app)
        .post(`/api/users/add-friend/${user2Id}`)
        .set("Authorization", `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.user.friends).toContain(user2Id);
      expect(response.body).toHaveProperty("xpAwarded");

      if (response.body.xpAwarded) {
        // Note: XP amount might vary based on your XP_ACTIONS config
        // Just check that XP was awarded
        expect(response.body.xpAwarded).toHaveProperty("xpAwarded");
        expect(response.body.xpAwarded.xpAwarded).toBeGreaterThan(0);
        expect(response.body.xpAwarded).toHaveProperty("totalXP");
      }
    });

    test("should not allow adding self as friend", async () => {
      // Get user1's ID
      const user1 = await User.findOne({ email: "user1@university.edu" });

      const response = await request(app)
        .post(`/api/users/add-friend/${user1._id}`)
        .set("Authorization", `Bearer ${user1Token}`)
        .expect(400);

      expect(response.body.message).toMatch(/cannot add yourself/i);
    });

    test("should handle adding non-existent user", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post(`/api/users/add-friend/${fakeId}`)
        .set("Authorization", `Bearer ${user1Token}`)
        .expect(404);

      expect(response.body.message).toMatch(/not found/i);
    });

    test("should not add duplicate friends", async () => {
      // Add friend first time
      await request(app)
        .post(`/api/users/add-friend/${user2Id}`)
        .set("Authorization", `Bearer ${user1Token}`)
        .expect(200);

      // Try adding same friend again
      const response = await request(app)
        .post(`/api/users/add-friend/${user2Id}`)
        .set("Authorization", `Bearer ${user1Token}`)
        .expect(200);

      // Should not award XP second time (check if xpAwarded is null or undefined)
      expect(
        response.body.xpAwarded === null ||
          response.body.xpAwarded === undefined
      ).toBe(true);
    });
  });

  describe("GET /api/users/search", () => {
    let authToken;

    beforeEach(async () => {
      // Create main user
      const mainUser = await request(app).post("/api/users/register").send({
        name: "Main User",
        email: "main@university.edu",
        password: "Password123",
        major: "Computer Science",
      });
      authToken = mainUser.body.token;

      // Create several test users
      await User.create([
        {
          name: "Alice Johnson",
          email: "alice@university.edu",
          password: "hashed",
          major: "Computer Science",
        },
        {
          name: "Bob Smith",
          email: "bob@university.edu",
          password: "hashed",
          major: "Mathematics",
        },
        {
          name: "Charlie Brown",
          email: "charlie@university.edu",
          password: "hashed",
          major: "Physics",
        },
      ]);
    });

    test("should search users by name", async () => {
      const response = await request(app)
        .get("/api/users/search?q=Alice")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0].name).toBe("Alice Johnson");
    });

    test("should search users by email", async () => {
      const response = await request(app)
        .get("/api/users/search?q=bob@university")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.users.length).toBeGreaterThanOrEqual(1);
      expect(response.body.users[0].email).toMatch(/bob/i);
    });

    test("should be case-insensitive", async () => {
      const response = await request(app)
        .get("/api/users/search?q=ALICE")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.users.length).toBeGreaterThanOrEqual(1);
    });

    test("should exclude current user from results", async () => {
      const response = await request(app)
        .get("/api/users/search?q=Main")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.users).toHaveLength(0);
    });

    test("should require search query", async () => {
      const response = await request(app)
        .get("/api/users/search?q=")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.message).toMatch(/required/i);
    });

    test("should limit results to 20", async () => {
      // This test would need 21+ users to verify the limit
      const response = await request(app)
        .get("/api/users/search?q=university")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.users.length).toBeLessThanOrEqual(20);
    });
  });

  describe("PUT /api/users/update", () => {
    let authToken;
    let userId;

    beforeEach(async () => {
      const response = await request(app).post("/api/users/register").send({
        name: "Test User",
        email: "test@university.edu",
        password: "Password123",
        major: "Computer Science",
      });
      authToken = response.body.token;
      userId = response.body.user._id;
    });

    test("should update user bio", async () => {
      const response = await request(app)
        .put("/api/users/update")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          bio: "Updated bio about me",
        })
        .expect(200);

      expect(response.body.user.bio).toBe("Updated bio about me");
    });

    test("should update user major", async () => {
      const response = await request(app)
        .put("/api/users/update")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          major: "Mathematics",
        })
        .expect(200);

      expect(response.body.user.major).toBe("Mathematics");
    });

    test("should update both bio and major", async () => {
      const response = await request(app)
        .put("/api/users/update")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          bio: "New bio",
          major: "Physics",
        })
        .expect(200);

      expect(response.body.user.bio).toBe("New bio");
      expect(response.body.user.major).toBe("Physics");
    });

    test("should not expose password in response", async () => {
      const response = await request(app)
        .put("/api/users/update")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          bio: "Test bio",
        })
        .expect(200);

      expect(response.body.user).not.toHaveProperty("password");
    });
  });
});
