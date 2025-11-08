# Class Endpoints

Base URL: `http://localhost:4000/api`

## Create a Class
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

**Notes:**
- Class code is automatically converted to uppercase
- Spaces are removed from class codes
- Creator is automatically added as first member

**Error Responses:**
- `400` - Name and code are required
- `400` - A class with this code already exists
- `401` - Unauthorized
- `500` - Server error

---

## Get All Classes
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

**Notes:**
- Returns all available classes
- Includes member counts for each class

**Error Responses:**
- `401` - Unauthorized
- `500` - Server error

---

## Get Single Class Details
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

**Notes:**
- Returns full class details including all members
- `isCurrentUserMember` indicates if requesting user is a member
- Members array includes user profiles

**Error Responses:**
- `401` - Unauthorized
- `404` - Class not found
- `500` - Server error

---

## Join a Class
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

**Notes:**
- Adds current user to class members
- Updates member count
- Idempotent - joining multiple times returns error but doesn't break

**Error Responses:**
- `400` - You are already a member of this class
- `401` - Unauthorized
- `404` - Class not found
- `500` - Server error

---

## Leave a Class
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

**Notes:**
- Removes current user from class members
- Updates member count
- User loses access to class posts after leaving

**Error Responses:**
- `400` - You are not a member of this class
- `401` - Unauthorized
- `404` - Class not found
- `500` - Server error

---

## Get Class Members
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

**Notes:**
- Returns list of all class members with their profiles
- Includes name, major, and bio for each member

**Error Responses:**
- `401` - Unauthorized
- `404` - Class not found
- `500` - Server error