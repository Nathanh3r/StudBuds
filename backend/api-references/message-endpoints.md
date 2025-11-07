# Message Endpoints

Base URL: `http://localhost:4000/api`

## Send a Message
**POST** `/messages`

**Access:** Private

**Request Body:**
```json
{
  "receiver": "507f191e810c19729de860ea",
  "content": "Hey, want to study together for the midterm?"
}
```

**Success Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "sender": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Alice Johnson",
    "email": "alice@university.edu",
    "major": "Psychology"
  },
  "receiver": "507f191e810c19729de860ea",
  "content": "Hey, want to study together for the midterm?",
  "read": false,
  "createdAt": "2025-11-06T10:30:00.000Z",
  "updatedAt": "2025-11-06T10:30:00.000Z"
}
```

**Error Responses:**
- `400` - Receiver and content are required
- `404` - Receiver not found
- `401` - Unauthorized
- `500` - Server error

---

## Get Messages with a User
**GET** `/messages/:id`

**Access:** Private

**URL Parameters:**
- `id` - User ID to get conversation with

**Query Parameters (optional):**
- `limit` - Number of messages to return (default: 50)
- `skip` - Number of messages to skip for pagination (default: 0)

**Example:** `/messages/507f191e810c19729de860ea?limit=20&skip=0`

**Success Response (200):**
```json
{
  "messages": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "sender": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Alice Johnson",
        "email": "alice@university.edu",
        "major": "Psychology"
      },
      "receiver": {
        "_id": "507f191e810c19729de860ea",
        "name": "Bob Smith",
        "email": "bob@university.edu",
        "major": "Computer Science"
      },
      "content": "Hey, want to study together?",
      "read": true,
      "readAt": "2025-11-06T10:35:00.000Z",
      "createdAt": "2025-11-06T10:30:00.000Z",
      "updatedAt": "2025-11-06T10:35:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "sender": {
        "_id": "507f191e810c19729de860ea",
        "name": "Bob Smith",
        "email": "bob@university.edu",
        "major": "Computer Science"
      },
      "receiver": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Alice Johnson",
        "email": "alice@university.edu",
        "major": "Psychology"
      },
      "content": "Sure! When works for you?",
      "read": false,
      "createdAt": "2025-11-06T10:32:00.000Z",
      "updatedAt": "2025-11-06T10:32:00.000Z"
    }
  ],
  "count": 2
}
```

**Notes:**
- Messages are sorted by creation time (oldest first)
- Both sender and receiver info are populated
- Includes read status and timestamps

**Error Responses:**
- `401` - Unauthorized
- `500` - Server error

---

## Get All Conversations
**GET** `/messages/conversations`

**Access:** Private

**Success Response (200):**
```json
{
  "conversations": [
    {
      "user": {
        "_id": "507f191e810c19729de860ea",
        "name": "Bob Smith",
        "email": "bob@university.edu",
        "major": "Computer Science",
        "bio": "Love coding!"
      },
      "lastMessage": {
        "_id": "507f1f77bcf86cd799439013",
        "sender": "507f191e810c19729de860ea",
        "receiver": "507f1f77bcf86cd799439012",
        "content": "Sure! When works for you?",
        "read": false,
        "createdAt": "2025-11-06T10:32:00.000Z",
        "updatedAt": "2025-11-06T10:32:00.000Z"
      },
      "unreadCount": 3
    },
    {
      "user": {
        "_id": "507f191e810c19729de860eb",
        "name": "Charlie Davis",
        "email": "charlie@university.edu",
        "major": "Mathematics",
        "bio": "Math enthusiast"
      },
      "lastMessage": {
        "_id": "507f1f77bcf86cd799439014",
        "sender": "507f1f77bcf86cd799439012",
        "receiver": "507f191e810c19729de860eb",
        "content": "Thanks for the notes!",
        "read": true,
        "readAt": "2025-11-05T15:20:00.000Z",
        "createdAt": "2025-11-05T15:15:00.000Z",
        "updatedAt": "2025-11-05T15:20:00.000Z"
      },
      "unreadCount": 0
    }
  ],
  "count": 2
}
```

**Notes:**
- Returns list of all users you've messaged with
- Sorted by most recent message first
- Includes unread message count for each conversation
- Shows last message preview

**Error Responses:**
- `401` - Unauthorized
- `500` - Server error

---

## Mark Messages as Read
**PUT** `/messages/:id/read`

**Access:** Private

**URL Parameters:**
- `id` - User ID whose messages to mark as read

**Success Response (200):**
```json
{
  "message": "Messages marked as read",
  "modifiedCount": 3
}
```

**Notes:**
- Marks all unread messages from the specified user as read
- Sets `read: true` and `readAt` timestamp
- Returns count of messages that were updated

**Error Responses:**
- `401` - Unauthorized
- `500` - Server error

---

## Get Unread Message Count
**GET** `/messages/unread-count`

**Access:** Private

**Success Response (200):**
```json
{
  "unreadCount": 5
}
```

**Notes:**
- Returns total number of unread messages for current user
- Useful for showing notification badges

**Error Responses:**
- `401` - Unauthorized
- `500` - Server error

---

## Delete a Message
**DELETE** `/messages/:messageId`

**Access:** Private

**URL Parameters:**
- `messageId` - ID of the message to delete

**Success Response (200):**
```json
{
  "message": "Message deleted successfully"
}
```

**Notes:**
- Only the sender can delete their own messages
- Message is permanently deleted from database

**Error Responses:**
- `401` - Unauthorized
- `403` - Not authorized (not the message sender)
- `404` - Message not found
- `500` - Server error

---

## Integration Notes

### In server.js, add:
```javascript
import messageRoutes from "./routes/messageRoutes.js";
app.use("/api/messages", messageRoutes);
```

### Database Indexes:
The Message model includes indexes for better performance:
- Compound index on sender, receiver, and createdAt
- Index on receiver and read status for unread queries

### Future Enhancements:
- Real-time messaging with Socket.io
- Message typing indicators
- Message editing
- File/image attachments
- Group messaging
- Message reactions