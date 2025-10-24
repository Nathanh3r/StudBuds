# StudBuds

**Connecting students, one study session at a time.**

StudBuds is a social platform designed to help college students find study partners, connect with classmates, and build academic communities around their courses. Students can join class-specific communities, share notes, discuss topics, and coordinate study sessions—all in one place.

## 🎯 Project Overview

**Team:** Squirtle  
**Members:** Jacob Perez, Aryav Nagar, Nathan Herrera, Shaun Mansoor

**Timeline:** 10-week class project  
**MVP Target:** End of Week 6

## ✨ Core Features (MVP)

- 🔐 **User Authentication** - Secure signup/login with .edu email verification
- 📚 **Class Communities** - Create and join class-specific communities
- 👥 **Class Rosters** - See who else is enrolled in your classes
- 📝 **Class Feed** - Share notes, ask questions, and discuss course topics
- 💬 **Direct Messaging** - Connect with classmates one-on-one
- 🤝 **Friend System** - Add friends and build your study network

## 🔧 Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **HTTP Client:** Fetch API

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (with Mongoose) / PostgreSQL (with Sequelize)
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt

## 📁 Project Structure

```
studbuds/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # Next.js app directory
│   │   ├── (auth)/         # Auth-related pages (login, signup)
│   │   ├── classes/        # Class-related pages
│   │   ├── messages/       # Messaging pages
│   │   ├── profile/        # User profile pages
│   │   ├── components/     # Reusable React components
│   │   │   ├── auth/       # Auth components
│   │   │   ├── classes/    # Class components
│   │   │   ├── layout/     # Layout components (Nav, Footer)
│   │   │   └── ui/         # Generic UI components
│   │   ├── context/        # React Context providers
│   │   ├── lib/            # Utility functions and API calls
│   │   └── styles/         # Global styles
│   ├── public/             # Static assets
│   └── package.json
│
├── backend/                 # Express.js backend application
│   ├── config/             # Configuration files (database, env)
│   ├── controllers/        # Route controllers (business logic)
│   ├── middleware/         # Custom middleware (auth, error handling)
│   ├── models/             # Database models/schemas
│   ├── routes/             # API route definitions
│   ├── utils/              # Helper functions
│   ├── server.js           # Entry point
│   └── package.json
│
└── README.md               # You are here!
```

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** - [Get started](https://www.mongodb.com/cloud/atlas/register)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nathanh3r/StudBuds.git
   cd studbuds
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Variables

#### Backend Configuration

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database - MongoDB Atlas (TEAM: Use the shared connection string)
MONGODB_URI=mongodb+srv://studbuds_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/studbuds?retryWrites=true&w=majority

# JWT Secret (TEAM: Use the shared secret key)
JWT_SECRET=your_super_secret_jwt_key_make_it_long_and_random_12345

# JWT Expiration
JWT_EXPIRE=7d

# CORS Origin (frontend URL)
CORS_ORIGIN=http://localhost:3000
```

#### Frontend Configuration

Create a `.env` file in the `frontend/` directory:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

**Note:** We use port **5001** to match the backend port.

### Running the Application

You need to run both frontend and backend simultaneously.

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
Backend will run on **http://localhost:5001**

You should see:
```
🚀 Server running on port 5001
📍 http://localhost:5001
✅ MongoDB Connected: cluster0-xxxxx.mongodb.net
📊 Database: studbuds
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
Frontend will run on **http://localhost:3000**

### Verify It's Working

1. Open your browser to **http://localhost:3000**
2. You should see the StudBuds homepage/login page
3. Backend API health check: **http://localhost:5001/api/health** (should return OK)
4. Database test: **http://localhost:5001/api/test-db** (should show "connected")

## 📝 Available Scripts

### Backend

```bash
npm run dev          # Run server with nodemon (auto-restart on changes)
npm start           # Run server in production mode
```

### Frontend

```bash
npm run dev         # Run Next.js development server
npm run build       # Build for production
npm start           # Run production build
npm run lint        # Run ESLint
```

## 🔑 API Endpoints

### Authentication
```
POST   /api/auth/register      # Register new user
POST   /api/auth/login         # Login user
GET    /api/auth/me            # Get current user (protected)
```

### Users
```
GET    /api/users/profile      # Get user profile (protected)
PUT    /api/users/profile      # Update user profile (protected)
GET    /api/users/classes      # Get user's enrolled classes (protected)
GET    /api/users/friends      # Get user's friends (protected)
POST   /api/users/:id/friend   # Add friend (protected)
DELETE /api/users/:id/friend   # Remove friend (protected)
```

### Classes
```
GET    /api/classes                 # Get all classes (protected)
POST   /api/classes                 # Create new class (protected)
GET    /api/classes/:id             # Get class details (protected)
POST   /api/classes/:id/join        # Join class (protected)
POST   /api/classes/:id/leave       # Leave class (protected)
GET    /api/classes/:id/members     # Get class members (protected)
GET    /api/classes/:id/posts       # Get class posts (protected)
POST   /api/classes/:id/posts       # Create post in class (protected)
```

### Messages
```
GET    /api/messages/conversations  # Get all conversations (protected)
GET    /api/messages/:userId        # Get messages with user (protected)
POST   /api/messages                # Send message (protected)
```

## 🧪 Testing

### Testing Backend Endpoints

Use **Postman**, **Thunder Client** (VS Code extension), or **curl**:

**Example: Register a user**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@ucr.edu",
    "password": "password123",
    "major": "Computer Science"
  }'
```

**Example: Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@ucr.edu",
    "password": "password123"
  }'
```

**Example: Access protected route**
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Viewing Database in MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Log in with team credentials (ask team lead)
3. Click **Database** → **Browse Collections**
4. Select **studbuds** database
5. View collections: users, classes, posts, messages

You can see all data being created/modified in real-time!

## 📚 Learning Resources

#### React Fundamentals
- **Official React Tutorial** (2-3 hours): https://react.dev/learn
  - Focus on: Components, Props, State (useState), Effects (useEffect)
- **React in 100 Seconds** (quick overview): https://www.youtube.com/watch?v=Tn6-PIqc4UM
- **React Hooks Reference**: https://react.dev/reference/react/hooks

#### Next.js (React Framework)
- **Next.js Official Tutorial**: https://nextjs.org/learn/dashboard-app
  - Skip database sections, focus on routing and layouts
- **Next.js in 100 Seconds**: https://www.youtube.com/watch?v=Sklc_fQBmcs
- **App Router Docs**: https://nextjs.org/docs/app

#### Tailwind CSS
- **Official Documentation**: https://tailwindcss.com/docs
  - Search for what you need (e.g., "tailwind padding")
- **Tailwind in 100 Seconds**: https://www.youtube.com/watch?v=mr15Xzb1Ook

#### Backend (Node.js/Express)
- **Express.js Crash Course** (35 min): https://www.youtube.com/watch?v=SccSCuHhOw0
- **REST API in 100 Seconds**: https://www.youtube.com/watch?v=-MTSQjw5DrM
- **MongoDB Tutorial**: https://www.mongodb.com/docs/manual/tutorial/
- **JWT Authentication Explained**: https://jwt.io/introduction

#### Git & GitHub
- **Git Basics** (15 min): https://www.youtube.com/watch?v=HVsySz-h9r4
- **GitHub Flow Guide**: https://docs.github.com/en/get-started/quickstart/github-flow
- **Common Git Commands**:
  ```bash
  git pull                    # Get latest changes
  git checkout -b feature-X   # Create new branch
  git add .                   # Stage all changes
  git commit -m "message"     # Commit changes
  git push origin feature-X   # Push to GitHub
  ```

### Quick Reference & Cheat Sheets
- **DevHints** (cheat sheets for everything): https://devhints.io/
- **JavaScript ES6 Features**: https://www.freecodecamp.org/news/write-less-do-more-with-javascript-es6-5fd4a8e50ee2/
- **HTTP Status Codes**:
  ```
  200 OK - Success
  201 Created - Resource created
  400 Bad Request - Validation error
  401 Unauthorized - Not authenticated
  403 Forbidden - Not authorized
  404 Not Found - Resource doesn't exist
  500 Internal Server Error - Server error
  ```

### Recommended VS Code Extensions
- **ES7+ React/Redux/React-Native snippets** - Type `rfce` to create component
- **Tailwind CSS IntelliSense** - Autocomplete Tailwind classes
- **ESLint** - Catch errors as you type
- **Prettier** - Auto-format code on save
- **Thunder Client** - Test API endpoints without leaving VS Code
- **GitLens** - Enhanced Git integration

## 🤝 Contributing

### Branching Strategy

- `main` - Production-ready code (protected)
- `dev` - Development branch (merge here first)
- `feature/feature-name` - Individual features
- `fix/bug-name` - Bug fixes

### Workflow

1. **Pull latest changes**
   ```bash
   git checkout dev
   git pull origin dev
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/user-authentication
   ```

3. **Make changes and commit**
   ```bash
   git add .
   git commit -m "Add user authentication endpoints"
   ```

4. **Push to GitHub**
   ```bash
   git push origin feature/user-authentication
   ```

5. **Create Pull Request**
   - Go to GitHub repository
   - Click "Pull Requests" → "New Pull Request"
   - Base: `dev` ← Compare: `feature/user-authentication`
   - Add description of changes
   - Request review from team member

6. **After approval, merge PR**

## 📄 License

This project is part of a university course assignment.

## 👥 Team Contact

- **Jacob Perez** - [GitHub Profile](#)
- **Aryav Nagar** - [GitHub Profile](#)
- **Nathan Herrera** - [GitHub Profile](#)
- **Shaun Mansoor** - [GitHub Profile](#)
