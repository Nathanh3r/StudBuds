# Post Endpoints

Base URL: `http://localhost:4000/api`

## Create a Post in a Class
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

**Notes:**
- User must be a member of the class to create posts
- Author information is automatically populated
- Posts are timestamped with creation date

**Error Responses:**
- `400` - Post content is required
- `401` - Unauthorized
- `403` - You must be a member of this class to post
- `404` - Class not found
- `500` - Server error

---

## Get All Posts from a Class
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
- User must be a member of the class to view posts
- Author information includes name and major

**Error Responses:**
- `401` - Unauthorized
- `403` - You must be a member of this class to view posts
- `404` - Class not found
- `500` - Server error