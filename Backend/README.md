# 📝 NoteApp Backend

A robust and feature-rich backend API for a collaborative note-taking application built with **Node.js**, **Express.js**, and **PostgreSQL**. Features include user authentication, role-based access control, note sharing, advanced analytics, and AI-powered content generation.

## 🚀 Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with secure token management
- **Role-based access control (RBAC)** (Admin, User roles)
- **Password hashing** using bcryptjs
- **User registration and login** with Zod DTO validation

### 📋 Note Management
- **CRUD operations** for notes (Create, Read, Update, Delete)
- **Rich content support** with metadata tracking
- **Smart Tag system** with optimized PostgreSQL GIN indexing
- **Advanced search** by tags using database-level array overlap
- **Pagination and Filtering** for high-performance data retrieval

### 🤝 Collaboration Features
- **Note sharing** with granular permissions (Read/Write)
- **Shared user management** (Add/Update/Remove sharing)
- **Permission inheritance** for secure collaboration

### 🤖 AI Integration (Google Gemini)
- **Verified Model**: Optimized using `gemini-flash-latest` for stability
- **Content Generation**: Create detailed notes from short prompts
- **Smart Enhancement**: Summarize, expand, or simplify existing content
- **Tag Generation**: Automatic topic detection and tagging
- **Writing Coach**: Get actionable suggestions to improve your writing

### 📊 Analytics & Monitoring
- **Admin Dashboard**: Comprehensive systems overview
- **Tag Trends**: Identify most used and popular tags
- **User Engagement**: Track active users and contribution trends
- **Daily Metrics**: Monitor note creation speed and system growth
- **Health Tracking**: Real-time server status and DB connectivity check

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Security**: Helmet, Express-Rate-Limit, CORS
- **Performance**: Compression, Database Indexing
- **Validation**: Zod (DTO Pattern)
- **AI Service**: Google Generative AI (Gemini)
- **Logging**: Morgan (Dev format)

## 📁 Project Structure

```
Backend/
├── config/              # Configuration files (DB, Environment)
├── controllers/         # Request handlers (Note, Auth, AI, Analytics)
├── dtos/                # Data Transfer Objects & Validation (Zod)
├── middlewares/         # Custom middleware (Auth, Admin, ErrorHandler)
├── models/              # Sequelize models (User, Note, Role, SharedNote)
├── routes/              # Express API routes
├── services/            # Business logic (Gemini, Note, Analytics, Auth)
├── tests/               # Comprehensive test suites
├── server.js            # Main application entry point
├── package.json         # Dependencies and scripts
└── .env                 # Environment variables
```

## 🚦 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **npm**
- **Google Gemini API Key** (from [AI Studio](https://aistudio.google.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   NODE_ENV=development
   
   # Database (PostgreSQL)
   DB_NAME=notes_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   
   # JWT
   JWT_SECRET=your_secure_secret
   JWT_EXPIRATION=24h
   
   # AI
   GEMINI_API_KEY=your_key_here
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

## 📚 API Endpoints (v1)

### 🔐 Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | User Signup |
| POST | `/api/v1/auth/login` | User Sign-in |

### 📝 Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/notes` | List notes (with pagination) |
| POST | `/api/v1/notes` | Create a new note |
| GET | `/api/v1/notes/search` | Search by tags |
| POST | `/api/v1/notes/:id/share` | Share note with user |

### 🤖 AI (Gemini)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/ai/generate` | Generate content |
| POST | `/api/v1/ai/enhance` | Summarize/Improve |
| POST | `/api/v1/ai/tags` | Auto-tagging |

### 📊 Analytics (Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/analytics/summary` | Global stats summary |
| GET | `/api/v1/analytics/popular-tags` | Top used tags |
| GET | `/api/v1/analytics/active-users` | Usage leaderboard |

## 🔒 Security & Performance

- **Rate Limiting**: Protects against brute-force (100 req / 15 min).
- **Helmet**: Sets secure HTTP headers automatically.
- **Compression**: Gzip compression for faster API responses.
- **GIN Indexing**: Specialized PostgreSQL indexes for fast tag array searches.
- **DB Connection Pooling**: Efficient management of database connections.

## 🧪 Testing

```bash
# Run all tests
npm run test

# Individual suites
npm run test:auth
npm run test:notes
npm run test:analytics
```

---
**Happy Coding! 🚀**
