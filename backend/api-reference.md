# StudBuds API Reference

Base URL: `http://localhost:5001/api`

## Authentication
All endpoints require: `Authorization: Bearer <token>`

## Classes Endpoints

### Get All Classes
```
GET /classes
Response: { classes: [...] }
```

### Create Class
```
POST /classes
Body: { name, code, description }
Response: { class: {...} }
```

### Get Class Details
```
GET /classes/:id
Response: { _id, name, code, description, members: [...], memberCount, isCurrentUserMember }
```

### Join Class
```
POST /classes/:id/join
Response: { message, class: {...} }
```

### Leave Class
```
POST /classes/:id/leave
Response: { message, class: {...} }
```

### Get Class Members
```
GET /classes/:id/members
Response: { members: [...], count }
```

## Posts Endpoints

### Get Class Posts
```
GET /classes/:id/posts
Response: { posts: [...], count }
Post object: { _id, content, author: { name, major }, createdAt }
```

### Create Post
```
POST /classes/:id/posts
Body: { content: "string" }
Response: { post: {...} }
```