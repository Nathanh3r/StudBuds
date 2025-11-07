# User Endpoints

Base URL: `http://localhost:4000/api`

## Register a New User
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

## Login User
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

## Get Current User Profile
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

## Update User Profile
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

## Get All Friends
**GET** `/users/friends`

**Access:** Private

**Success Response (200):**
```json
{
  "friends": [
    {
      "_id": "507f191e810c19729de860eb",
      "name": "Bob Smith",
      "email": "bob@university.edu",
      "major": "Engineering",
      "bio": "Future innovator"
    },
    {
      "_id": "507f191e810c19729de860ec",
      "name": "Charlie Davis",
      "email": "charlie@university.edu",
      "major": "Mathematics",
      "bio": "Math enthusiast"
    }
  ],
  "count": 2
}
```

**Notes:**
- Returns populated friend objects with full details
- Includes name, email, major, and bio for each friend

**Error Responses:**
- `401` - Unauthorized
- `404` - User not found
- `500` - Server error

---

## Search Users
**GET** `/users/search?q=searchterm`

**Access:** Private

**Query Parameters:**
- `q` - Search term (searches name and email)

**Success Response (200):**
```json
{
  "users": [
    {
      "_id": "507f191e810c19729de860eb",
      "name": "Bob Smith",
      "email": "bob@university.edu",
      "major": "Engineering",
      "bio": "Future innovator"
    },
    {
      "_id": "507f191e810c19729de860ed",
      "name": "Bobby Johnson",
      "email": "bobby@university.edu",
      "major": "Computer Science",
      "bio": "Coding enthusiast"
    }
  ],
  "count": 2
}
```

**Notes:**
- Case-insensitive search
- Searches both name and email fields
- Excludes current user from results
- Limited to 20 results maximum

**Error Responses:**
- `400` - Search query is required
- `401` - Unauthorized
- `500` - Server error

---

## Get User Profile
**GET** `/users/:id`

**Access:** Private

**URL Parameters:**
- `id` - User ID

**Success Response (200):**
```json
{
  "user": {
    "_id": "507f191e810c19729de860eb",
    "name": "Bob Smith",
    "email": "bob@university.edu",
    "major": "Engineering",
    "bio": "Future innovator",
    "isFriend": true,
    "friendCount": 15,
    "classCount": 5
  }
}
```

**Notes:**
- Returns public profile information
- `isFriend` indicates if current user is friends with this user
- Includes aggregate counts for friends and classes

**Error Responses:**
- `401` - Unauthorized
- `404` - User not found
- `500` - Server error

---

## Add Friend
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

**Notes:**
- Adds user to your friends list
- Idempotent - adding same friend multiple times has no additional effect

**Error Responses:**
- `400` - Cannot add yourself as a friend
- `401` - Unauthorized
- `404` - Target user not found
- `500` - Server error

---

## Remove Friend
**DELETE** `/users/remove-friend/:id`

**Access:** Private

**URL Parameters:**
- `id` - User ID to remove as friend

**Success Response (200):**
```json
{
  "message": "Friend removed successfully",
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

**Notes:**
- Removes friendship from both users (mutual unfriend)
- Removes target from your friends list
- Removes you from target's friends list

**Error Responses:**
- `400` - Cannot remove yourself as a friend
- `401` - Unauthorized
- `404` - Target user not found
- `500` - Server error

---
