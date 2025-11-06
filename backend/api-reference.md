# StudBuds API Reference

Base URL: `http://localhost:4000/api`

## Authentication

Most endpoints require a JWT token. Include it in the Authorization header:
```
Authorization: Bearer <your_token_here>
```

---

## User Endpoints

### Register a New User
**POST** `/users/register`

**Access:** Public

**Request Body:**
```json
{
  "name": "Alice Johnson",
  "email": "alice@university.edu",
  "password": "password123",
  "major": "Psychology",
  "bio": "Loves research" // optional
}
```

**Success Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Alice Johnson",
    "email": "alice@university.edu",
    "major": "Psychology",
    "bio": "Loves research",
    "classes": [],
    "friends": []
  }
}
```

**Error Responses:**
- `400` - Missing required fields
- `400` - Email must end with .edu
- `409` - Email already in use
- `500` - Server error

---

### Login User
**POST** `/users/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "alice@university.edu",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Alice Johnson",
    "email": "alice@university.edu",
    "major": "Psychology",
    "bio": "Loves research",
    "classes": [],
    "friends": []
  }
}
```

**Error Responses:**
- `400` - Missing email or password
- `401` - Invalid credentials
- `500` - Server error

---

### Get Current User Profile
**GET** `/users/me`

**Access:** Private

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Alice Johnson",
    "email": "alice@university.edu",
    "major": "Psychology",
    "bio": "Loves research",
    "classes": ["507f191e810c19729de860ea"],
    "friends": ["507f191e810c19729de860eb"]
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Server error

---

### Update User Profile
**PUT** `/users/update`

**Access:** Private

**Request Body:**
```json
{
  "bio": "Updated bio text",
  "major": "Computer Engineering"
}
```

**Success Response (200):**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Alice Johnson",
    "email": "alice@university.edu",
    "major": "Computer Engineering",
    "bio": "Updated bio text",
    "classes": [],
    "friends": []
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - User not found
- `500` - Server error

---

### Add Friend
**POST** `/users/add-friend/:id`

**Access:** Private

**URL Parameters:**
- `id` - User ID to add as friend

**Success Response (200):**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Alice Johnson",
    "email": "alice@university.edu",
    "major": "Psychology",
    "bio": "Loves research",
    "classes": [],
    "friends": ["507f191e810c19729de860eb"]
  }
}
```

**Error Responses:**
- `400` - Cannot add yourself as a friend
- `401` - Unauthorized
- `404` - Target user not found
- `500` - Server error

---

### Enroll in Class
**POST** `/users/enroll-class/:id`

**Access:** Private

**URL Parameters:**
- `id` - Class ID to enroll in

**Success Response (200):**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Alice Johnson",
    "email": "alice@university.edu",
    "major": "Psychology",
    "bio": "Loves research",
    "classes": ["507f191e810c19729de860ea"],
    "friends": []
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - User not found
- `500` - Server error

---

## Class Endpoints

### Create a Class
**POST** `/classes`

**Access:** Private

**Request Body:**
```json
{
  "name": "Introduction to Computer Science",
  "code": "CS010",
  "description": "Fundamental concepts of computer science" // optional
}
```

**Success Response (201):**
```json
{
  "message": "Class created successfully",
  "class": {
    "_id": "507f191e810c19729de860ea",
    "name": "Introduction to Computer Science",
    "code": "CS010",
    "description": "Fundamental concepts of computer science",
    "memberCount": 1,
    "createdBy": "507f1f77bcf86cd799439011",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Name and code are required
- `400` - A class with this code already exists
- `401` - Unauthorized
- `500` - Server error

---

### Get All Classes
**GET** `/classes`

**Access:** Private

**Success Response (200):**
```json
{
  "classes": [
    {
      "_id": "507f191e810c19729de860ea",
      "name": "Introduction to Computer Science",
      "code": "CS010",
      "description": "Fundamental concepts of computer science",
      "memberCount": 15,
      "createdAt": "2025-01-15T10:30:00.000Z"
    },
    {
      "_id": "507f191e810c19729de860eb",
      "name": "Data Structures & Algorithms",
      "code": "CS014",
      "description": "Learn about arrays, linked lists, trees, and more",
      "memberCount": 23,
      "createdAt": "2025-01-14T09:20:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Server error

---

### Get Single Class Details
**GET** `/classes/:id`

**Access:** Private

**URL Parameters:**
- `id` - Class ID

**Success Response (200):**
```json
{
  "_id": "507f191e810c19729de860ea",
  "name": "Introduction to Computer Science",
  "code": "CS010",
  "description": "Fundamental concepts of computer science",
  "memberCount": 15,
  "members": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Alice Johnson",
      "major": "Psychology",
      "bio": "Loves research"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Bob Smith",
      "major": "Engineering",
      "bio": "Future innovator"
    }
  ],
  "isCurrentUserMember": true,
  "createdBy": "507f1f77bcf86cd799439011",
  "createdAt": "2025-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Class not found
- `500` - Server error

---

### Join a Class
**POST** `/classes/:id/join`

**Access:** Private

**URL Parameters:**
- `id` - Class ID

**Success Response (200):**
```json
{
  "message": "Successfully joined class",
  "class": {
    "_id": "507f191e810c19729de860ea",
    "name": "Introduction to Computer Science",
    "code": "CS010",
    "memberCount": 16
  }
}
```

**Error Responses:**
- `400` - You are already a member of this class
- `401` - Unauthorized
- `404` - Class not found
- `500` - Server error

---

### Leave a Class
**POST** `/classes/:id/leave`

**Access:** Private

**URL Parameters:**
- `id` - Class ID

**Success Response (200):**
```json
{
  "message": "Successfully left class",
  "class": {
    "_id": "507f191e810c19729de860ea",
    "name": "Introduction to Computer Science",
    "code": "CS010",
    "memberCount": 14
  }
}
```

**Error Responses:**
- `400` - You are not a member of this class
- `401` - Unauthorized
- `404` - Class not found
- `500` - Server error

---

### Get Class Members
**GET** `/classes/:id/members`

**Access:** Private

**URL Parameters:**
- `id` - Class ID

**Success Response (200):**
```json
{
  "members": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Alice Johnson",
      "major": "Psychology",
      "bio": "Loves research"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Bob Smith",
      "major": "Engineering",
      "bio": "Future innovator"
    }
  ],
  "count": 2
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Class not found
- `500` - Server error

---

## Post Endpoints

### Create a Post in a Class
**POST** `/classes/:id/posts`

**Access:** Private (Must be a member of the class)

**URL Parameters:**
- `id` - Class ID

**Request Body:**
```json
{
  "content": "Does anyone have notes from Wednesday's lecture?"
}
```

**Success Response (201):**
```json
{
  "message": "Post created successfully",
  "post": {
    "_id": "507f191e810c19729de860ec",
    "content": "Does anyone have notes from Wednesday's lecture?",
    "author": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Alice Johnson",
      "major": "Psychology"
    },
    "createdAt": "2025-01-15T14:25:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Post content is required
- `401` - Unauthorized
- `403` - You must be a member of this class to post
- `404` - Class not found
- `500` - Server error

---

### Get All Posts from a Class
**GET** `/classes/:id/posts`

**Access:** Private (Must be a member of the class)

**URL Parameters:**
- `id` - Class ID

**Success Response (200):**
```json
{
  "posts": [
    {
      "_id": "507f191e810c19729de860ec",
      "content": "Does anyone have notes from Wednesday's lecture?",
      "author": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Alice Johnson",
        "major": "Psychology"
      },
      "createdAt": "2025-01-15T14:25:00.000Z"
    },
    {
      "_id": "507f191e810c19729de860ed",
      "content": "Study group meeting at Rivera Library tomorrow at 3pm!",
      "author": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Bob Smith",
        "major": "Engineering"
      },
      "createdAt": "2025-01-15T12:15:00.000Z"
    }
  ],
  "count": 2
}
```

**Notes:**
- Returns maximum of 50 most recent posts
- Posts are sorted by creation date (newest first)

**Error Responses:**
- `401` - Unauthorized
- `403` - You must be a member of this class to view posts
- `404` - Class not found
- `500` - Server error

---

## Utility Endpoints

### Health Check
**GET** `/health`

**Access:** Public

**Success Response (200):**
```json
{
  "success": true,
  "message": "Server is running"
}
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "message": "Error description here"
}
```

Common HTTP Status Codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Notes

1. **Email Validation:** All user emails must end with `.edu`
2. **Class Codes:** Automatically converted to uppercase and spaces removed
3. **Authentication:** Include JWT token in Authorization header for protected routes
4. **Rate Limiting:** Posts limited to 50 per class query
5. **Member Access:** Users must be class members to view/create posts in that class