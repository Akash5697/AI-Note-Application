# 📝 Note App - AI-Powered Intelligent Workspace

A premium, full-stack note-taking application designed for modern productivity. Powered by **Google Gemini AI**, this platform offers intelligent content generation, seamless collaboration, and a state-of-the-art user experience with dynamic themes.

## ✨ Key Features

### 🤖 AI-Powered Intelligence
- **Intelligent Content Generation**: Create high-quality notes from simple prompts using `gemini-flash-latest`.
- **Content Enhancement**: Improve, summarize, expand, or restructure your thoughts with one click.
- **Smart Templates**: Generate professional templates for meetings, projects, research, and daily planning.
- **Automated Tagging**: AI-driven categorization for effortless organization.
- **Writing Suggestions**: Actionable feedback to improve your writing clarity and flow.

### 🔐 Security & RBAC
- **Multi-Role System**: Built-in support for `Admin` and `User` roles.
- **Secure Authentication**: JWT-based auth with HttpOnly cookies and session persistence.
- **Protected Workspace**: Advanced Role-Based Access Control ensuring data privacy.

### 🎨 Premium User Experience
- **Dynamic Themes**: Choose from `Dark`, `Light`, `Midnight Blue`, and `Forest` themes.
- **Fluid Animations**: Smooth transitions powered by `Framer Motion`.
- **Responsive Design**: Fully optimized for desktop and mobile workflows.
- **Glassmorphism UI**: Modern aesthetic with frosted glass effects and premium typography.

### 👥 Collaboration & Organization
- **Smart Sharing**: Share notes with specific users and manage permissions (Read/Write).
- **Thought Vault**: Archive notes to clear your workspace while keeping data safe.
- **Full-Text Search**: Instant search across titles, content, and tags.

---

## �️ Tech Stack

### Frontend
- **Core**: React 19 + Vite
- **State Management**: Zustand
- **Styling**: Tailwind CSS v4 (Modern Utility First)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Data Fetching**: Axios + TanStack Query

### Backend
- **Core**: Node.js + Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **AI Integration**: Google Generative AI (Gemini)
- **Security**: JWT, bcryptjs, Helmet, CORS, Rate Limiting

---

## 📁 Project Structure

```text
Note-App/
├── Backend/                # Node.js & Express API
│   ├── config/            # Database & Environment configs
│   ├── controllers/       # Request handlers
│   ├── middlewares/       # Auth, RBAC & Error handling
│   ├── models/            # Sequelize models (PostgreSQL)
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic & AI Integration
│   └── server.js          # Entry point
├── Frontend/               # React 19 SPA
│   ├── src/
│   │   ├── api/          # Axios configuration
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Theme & Auth contexts
│   │   ├── pages/         # View components
│   │   ├── store/        # Zustand state management
│   │   └── utils/         # Helper functions
│   └── vite.config.js     # Vite configuration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **PostgreSQL** (Running instance)
- **Google Gemini API Key** ([Get it here](https://aistudio.google.com/))

### 1. Database Setup
Create a PostgreSQL database named `notes_db` (or as configured in `.env`).

### 2. Backend Installation
```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend/` directory:
```env
PORT=5000
NODE_ENV=development
DB_NAME=notes_db
DB_USER=your_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-flash-latest
```

### 3. Frontend Installation
```bash
cd Frontend
npm install
```

### 4. Running the Application
**Backend:**
```bash
cd Backend
npm run dev
```

**Frontend:**
```bash
cd Frontend
npm run dev
```

---

## 👨‍💻 Author

**Surya Kanta Nag**
- GitHub: [@Surya07102000](https://github.com/Surya07102000)
- Email: suryakantanag05@gmail.com

---

⭐ **If you find this project useful, please consider giving it a star!**
