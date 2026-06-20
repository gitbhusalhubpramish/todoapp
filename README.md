# 📝 Tick It - README & Developer Guide

**Social Todo & Project Management Platform** - Share projects, manage tasks, and collaborate with friends in real-time.

---

## 📚 Table of Contents

1. [Quick Overview](#quick-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Installation & Setup](#installation--setup)
6. [Code Explanation](#code-explanation)
7. [API Endpoints](#api-endpoints)
8. [Data Flow](#data-flow)
9. [Developer Guide](#developer-guide)
10. [User Guide](#user-guide)
11. [Database Schema](#database-schema)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 Quick Overview

**Tick It** is a modern social productivity platform that allows users to create and manage projects and todos, share with friends in real-time, track progress collaboratively, follow creators, view public profiles, and receive notifications for shared updates. Built with Next.js 16, React 19, MongoDB, and Redis.

**GitHub:** [gitbhusalhubpramish/todoapp](https://github.com/gitbhusalhubpramish/todoapp)

---

## ✨ Features

| Feature | Status | Description |
|---------|--------|-------------|
| User Authentication | ✅ | Sign up, login, logout with email verification |
| Todo Management | ✅ | Create, read, update, delete todos with priority |
| Project Creation | ✅ | Organize todos into projects |
| Share Projects | ✅ | Share with specific friends with permissions |
| Real-time Updates | ✅ | Live synchronization via Redis |
| Public Profiles | ✅ | View other users' profiles and projects |
| Search Users | ✅ | Find and follow creators |
| Notifications | ✅ | Get notified on shared project updates |
| Dark Mode | ✅ | Toggle between light and dark theme |
| Profile Pictures | ✅ | Upload pictures via Cloudinary |
| Account Security | ✅ | Change password, delete account, reCAPTCHA |

---

## 🏗️ Tech Stack

### Frontend
- **React 19.2.4** - UI library
- **Next.js 16.2.1** - Full-stack framework with App Router
- **Tailwind CSS 4.2.2** - Utility CSS styling
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime
- **Next.js API Routes** - Serverless functions

### Database & Cache
- **MongoDB 7.1.1** - Primary database
- **Upstash Redis 1.38.0** - Real-time caching

### Security & Services
- **bcrypt 6.0.0** - Password hashing
- **Validator.js** - Input validation
- **mongo-sanitize** - DB injection prevention
- **sanitize-html** - XSS prevention
- **Google reCAPTCHA** - Bot detection
- **Resend 6.12.0** - Email service
- **Cloudinary** - Image hosting

---

## 📁 Project Structure

```
todoapp/todo/
├── app/                           # Next.js App Router
│   ├── (auth)/                    # Public: login, signup
│   │   ├── login/page.js
│   │   └── signup/page.js
│   ├── (protected)/               # Protected routes (require auth)
│   │   ├── newproject/page.js
│   │   ├── profile/page.js
│   │   ├── notification/page.js
│   │   ├── setting/page.js
│   │   └── changepass/page.js
│   ├── [username]/page.js         # Dynamic user profiles
│   ├── api/                       # Backend endpoints
│   │   ├── login/route.js
│   │   ├── signup/route.js
│   │   ├── logout/route.js
│   │   ├── me/auth/route.js
│   │   ├── users/route.js
│   │   ├── newproject/route.js
│   │   └── search/route.js
│   ├── layout.js                  # Root layout
│   ├── page.js                    # Home page
│   └── globals.css                # Global styles
├── components/                    # Reusable components
│   ├── navbar.js
│   ├── usrnav.js
│   ├── search.js
│   ├── footer.js
│   └── ThemeToggle.js
├── lib/                           # Utilities
│   ├── auth.js                    # Session management
│   ├── mongodb.js                 # DB connection
│   ├── redis.js                   # Cache client
│   └── mailer.js                  # Email service
├── data/
│   └── option.json                # Menu options
├── public/                        # Static assets
├── middleware.js                  # Request interceptor
└── package.json
```

---

## 🚀 Installation & Setup

### Step 1: Clone & Install

```bash
git clone https://github.com/gitbhusalhubpramish/todoapp.git
cd todoapp/todo
npm install
```

### Step 2: Environment Variables

Create `.env.local`:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/todoapp?retryWrites=true&w=majority

# Redis
UPSTASH_REDIS_REST_URL=https://region.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# Email
RESEND_API_KEY=re_your_api_key

# Images
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Auth
NEXTAUTH_SECRET=generate_random_32_chars
NEXTAUTH_URL=http://localhost:3000

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
RECAPTCHA_SECRET_KEY=your_secret_key

NODE_ENV=development
```

### Step 3: Setup Services

- **MongoDB Atlas:** [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas) - Create cluster and get URI
- **Upstash Redis:** [upstash.com](https://upstash.com/) - Create database and get REST URL & token
- **Resend:** [resend.com](https://resend.com/) - Get API key
- **Cloudinary:** [cloudinary.com](https://cloudinary.com/) - Get cloud name and API keys
- **reCAPTCHA:** [google.com/recaptcha](https://www.google.com/recaptcha/admin) - Create v3 site

### Step 4: Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 💻 Code Explanation

### Architecture Overview

```
Frontend (React 19)
        ↓
   Next.js 16 Server
        ↓
   API Routes (Node.js)
        ↓
   ┌───────────────────┐
   │  MongoDB (Data)   │
   │  Redis (Cache)    │
   │  Email (Resend)   │
   │  Images (Cloudinary)
   └───────────────────┘
```

### Key Components & Their Role

**1. Root Layout (`app/layout.js`)**
- Wraps entire application
- Imports Navbar, Footer, ThemeToggle globally
- Loads reCAPTCHA script
- Sets metadata for SEO

**2. Home Page (`app/page.js`)**
- Client component with React hooks
- Fetches current user from `/api/me/auth`
- Shows different CTA based on auth status
- Redirects to login/signup for unauthenticated users

**3. Authentication (`lib/auth.js`)**
- Server-side function (never runs on client)
- Reads sessionId from HTTP-only cookie
- Looks up session in MongoDB
- Returns user data or false if invalid
- Auto-deletes expired sessions

**4. Database Connection (`lib/mongodb.js`)**
- Singleton pattern to reuse connection
- Development: Global connection (prevent connection limit)
- Production: Per-request connection (for scaling)
- Validates MONGODB_URI exists

**5. Navbar (`components/navbar.js`)**
- Fixed top navigation
- Contains Logo, Search, UserNav
- Visible on all pages
- Responsive design

**6. User Navigation (`components/usrnav.js`)**
- Client component with state management
- Shows Login/Signup for guests
- Shows Profile dropdown for logged-in users
- Fetches unread notifications and profile picture
- Displays notification badge

**7. Email Service (`lib/mailer.js`)**
- Uses Resend API to send emails
- Sends verification codes via HTML
- Used for account verification
- Can send password reset emails

**8. Redis Cache (`lib/redis.js`)**
- Upstash Redis client initialization
- Used for session caching
- Real-time notifications
- Publish/subscribe for live updates

### Authentication Flow

```
User Signs Up
    ↓
1. Validate inputs & reCAPTCHA
    ↓
2. Hash password with bcrypt
    ↓
3. Create user in MongoDB
    ↓
4. Send verification email via Resend
    ↓
5. Create session in MongoDB + Redis
    ↓
6. Set HTTP-only cookie (sessionId)
    ↓
7. Return success & redirect to home
```

### Session Management Flow

```
Request arrives
    ↓
Browser sends sessionId cookie
    ↓
Backend reads cookie
    ↓
Check Redis cache (fast)
    ↓
If miss → Check MongoDB (slower)
    ↓
If valid → Attach user to request
    ↓
If invalid → Clear cookie & return 401
    ↓
Continue processing
```

### Real-time Update Flow

```
User modifies todo
    ↓
PUT request to /api/todos/:id
    ↓
Backend updates MongoDB
    ↓
Invalidate Redis cache
    ↓
Publish to Redis channel
    ↓
All subscribed clients get update
    ↓
UI updates instantly (no refresh)
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/signup` | Register new user |
| POST | `/api/login` | Login user |
| POST | `/api/logout` | Logout user |
| GET | `/api/me/auth` | Get current user |

### Projects & Todos

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/newproject` | Create project |
| GET | `/api/users/:username/projects` | Get user projects |
| PUT | `/api/todos/:id` | Update todo |
| DELETE | `/api/todos/:id` | Delete todo |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:username` | Get user profile |
| GET | `/api/users/:username/newnot` | Check unread notifications |
| GET | `/api/users/:username/pp` | Get profile picture |
| GET | `/api/search?q=term` | Search users |

### Example Request/Response

**Sign Up:**
```javascript
// Request
POST /api/signup
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "pass123",
  "recaptchaToken": "token"
}

// Response
{
  "success": true,
  "user": { "username": "johndoe", "email": "john@example.com" }
}
```

**Get Current User:**
```javascript
// Request
GET /api/me/auth

// Response
{
  "user": {
    "username": "johndoe",
    "email": "john@example.com",
    "profilepic": "https://..."
  }
}
```

---

## 🔄 Data Flow

### Complete User Registration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER SIGNUP FLOW                         │
└─────────────────────────────────────────────────────────────┘

1. Frontend Form
   └─> User enters email, password, username

2. Send to Backend
   └─> POST /api/signup

3. Backend Validation
   ├─> Validate reCAPTCHA token
   ├─> Check email doesn't exist
   ├─> Check username available
   └─> Return error if validation fails

4. Password Security
   ├─> Hash with bcrypt (10 salt rounds)
   └─> Store hashed password in MongoDB

5. User Creation
   └─> Create user document in MongoDB

6. Send Email
   └─> Generate 6-digit code
   ├─> Store in Redis (5 min expiry)
   └─> Send via Resend email service

7. Session Creation
   ├─> Create session in MongoDB
   ├─> Cache in Redis
   └─> Set HTTP-only cookie

8. Response
   └─> Return success + redirect to home
```

### Project Share Flow

```
┌─────────────────────────────────────────────────────────────┐
│              PROJECT CREATION & SHARING FLOW               │
└─────────────────────────────────────────────────────────────┘

1. User Creates Project
   └─> POST /api/newproject

2. Backend Creates
   ├─> Verify user authenticated
   ├─> Create project in MongoDB
   └─> Cache in Redis (1 hour TTL)

3. User Adds Todos
   ├─> POST /api/todos for each
   ├─> Add to project.todos array
   └─> Publish update to Redis

4. User Shares Project
   ├─> POST /api/projects/:id/share
   ├─> Add friend to sharedWith array
   ├─> Send notification
   └─> Publish to Redis channel

5. Friend Gets Notification
   ├─> Real-time notification arrives
   ├─> Friend can view/edit (based on permission)
   └─> Both see live updates
```

### Real-Time Todo Update Flow

```
┌─────────────────────────────────────────────────────────────┐
│            REAL-TIME UPDATE FLOW (Redis)                   │
└─────────────────────────────────────────────────────────────┘

1. User Checks Todo
   └─> PUT /api/todos/:id { completed: true }

2. Backend Updates
   ├─> Update MongoDB
   ├─> Invalidate Redis cache
   └─> Publish update message

3. Redis Publishes
   └─> Broadcast to all subscribers

4. Connected Users Receive
   ├─> User A (who made change) - already updated
   ├─> User B (collaborator) - receives update
   └─> User C (viewer) - receives update

5. UI Updates Instantly
   └─> No refresh needed
   └─> Seamless collaboration
```

---

## 👨‍💻 Developer Guide

### Running Application

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm start            # Run production build
npm run lint         # Check code quality
npm run lint:fix     # Fix linting issues
```

### Adding a Protected Page

```javascript
// app/(protected)/mypage/page.js
"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    async function checkAuth() {
      const res = await fetch("/api/me/auth");
      const data = await res.json();
      if (!data.user) router.push("/login");
      else setUser(data.user);
    }
    checkAuth();
  }, []);
  
  if (!user) return null;
  return <div>Page content</div>;
}
```

### Adding an API Endpoint

```javascript
// app/api/myendpoint/route.js
import { getCurrentUser } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    
    const client = await clientPromise;
    const db = client.db("projectdata");
    const data = await db.collection("mydata").findOne({ userId: user.userId });
    
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    
    const client = await clientPromise;
    const db = client.db("projectdata");
    const result = await db.collection("mydata").insertOne({
      userId: user.userId,
      ...body,
      createdAt: new Date()
    });
    
    return Response.json({ success: true, id: result.insertedId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

### Environment Variables

Never commit `.env.local`! Add to `.gitignore`:

```
.env.local
.env
node_modules/
.next/
```

**All Required Variables:**
- `MONGODB_URI` - Database connection
- `UPSTASH_REDIS_REST_URL` - Cache URL
- `UPSTASH_REDIS_REST_TOKEN` - Cache token
- `RESEND_API_KEY` - Email API key
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Image host
- `CLOUDINARY_API_KEY` - Image API key
- `CLOUDINARY_API_SECRET` - Image secret
- `NEXTAUTH_SECRET` - Session security
- `NEXTAUTH_URL` - Auth URL
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` - Bot prevention
- `RECAPTCHA_SECRET_KEY` - Bot prevention

---

## 🎯 User Guide

### Getting Started

1. **Sign Up** - Click "Sign Up", enter email/password/username, verify email
2. **Create Project** - Click "New Project", enter name & description
3. **Add Todos** - Open project, click "Add Todo", enter task details
4. **Share** - Click "Share", select friend, choose permission level
5. **Collaborate** - See real-time updates as friends modify todos

### Features

- **Projects** - Organize todos into projects, set privacy level, share with friends
- **Todos** - Create tasks with priority, due dates, descriptions
- **Sharing** - View-only or edit permissions for collaboration
- **Notifications** - Get notified on shares, updates, follows
- **Profiles** - View public profiles, follow creators
- **Search** - Find users by username

### Account Management

- **Change Password** - Settings → Change Password
- **Update Profile** - Profile → Edit → Save
- **Delete Account** - Settings → Delete Account (permanent)

---

## 📊 Database Schema

### Users
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password: String (bcrypt hashed),
  profilepic: String (URL),
  bio: String,
  followers: [ObjectId],
  following: [ObjectId],
  createdAt: Date
}
```

### Projects
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  owner: ObjectId,
  collaborators: [ObjectId],
  todos: [ObjectId],
  sharedWith: [{ userId: ObjectId, permission: "view"|"edit" }],
  privacy: "public"|"private",
  createdAt: Date
}
```

### Todos
```javascript
{
  _id: ObjectId,
  projectId: ObjectId,
  title: String,
  description: String,
  completed: Boolean,
  priority: "low"|"medium"|"high",
  dueDate: Date,
  assignedTo: ObjectId,
  tags: [String],
  createdAt: Date
}
```

### Sessions
```javascript
{
  _id: ObjectId,
  sessionId: String (unique),
  userId: ObjectId,
  username: String,
  email: String,
  createdAt: Date,
  expiresAt: Date
}
```

### Notifications
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  from: ObjectId,
  type: "share"|"follow"|"comment",
  projectId: ObjectId,
  message: String,
  read: Boolean,
  createdAt: Date
}
```

---

## 🐛 Troubleshooting

### Installation Issues
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Port 3000 in use
PORT=3001 npm run dev
```

### Database Connection
- Check `MONGODB_URI` format
- Verify IP whitelist in MongoDB Atlas (allow 0.0.0.0)
- Check username/password correct
- Format: `mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true`

### Redis Connection
- Verify `UPSTASH_REDIS_REST_URL` correct
- Check `UPSTASH_REDIS_REST_TOKEN` no typos
- Ensure database is active

### Email Not Sending
- Check `RESEND_API_KEY` correct
- Verify sender email is verified in Resend
- Check spam folder

### Images Not Uploading
- Check Cloudinary credentials
- Verify API key has upload permissions
- Ensure file size < 10MB

### reCAPTCHA Not Showing
- Verify site key correct
- Add `localhost` to authorized domains
- Clear browser cache
- Check browser console for errors

---

## 📞 Support

- **GitHub Issues:** Report bugs
- **GitHub Discussions:** Ask questions
- **Pull Requests:** Contribute

---

## 📄 License

MIT License

---

## 👨‍💻 Author

**Pramish Bhusal** - [@gitbhusalhubpramish](https://github.com/gitbhusalhubpramish)

---

**Happy coding!** 🚀
