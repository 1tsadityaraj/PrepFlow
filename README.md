# PrepFlow 🚀

> Built a full-stack interview preparation platform with Kanban workflow, spaced repetition system, and analytics dashboard using React, FastAPI, and MongoDB.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688?logo=fastapi&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mock-47A248?logo=mongodb&logoColor=white)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| ⚡ **Mock Interview Mode** | Timed, randomized interview simulator with success/fail tracking and final scoring |
| 🔐 **JWT Auth** | Secure signup/login with bcrypt password hashing |
| 📋 **Kanban Board** | Drag-and-drop questions across *To Learn → Practicing → Mastered → Revision* |
| 📚 **Topics** | Browse all topics with progress bars and question counts |
| 🧠 **Spaced Repetition** | SM-2 inspired algorithm (Again / Good / Easy) with automatic interval scaling |
| 📊 **Analytics** | Daily streak, 30-day activity heatmap, topic progress, weak topic detection |
| ⚙️ **Settings** | Profile editing, password change, dark mode toggle |
| 🗃️ **In-Memory DB** | Runs out-of-the-box with mock database — no MongoDB install needed |

---

## ⚙️ Tech Stack

### Frontend
- **React 19** (Vite)
- **Tailwind CSS 4**
- **Redux Toolkit** — state management
- **React Router DOM** — client-side routing
- **@hello-pangea/dnd** — drag and drop
- **Recharts** — data visualization
- **Framer Motion** — animations
- **Lucide React** — icons

### Backend
- **Python FastAPI** — async REST API
- **Motor / MongoMock** — async MongoDB driver (in-memory for demo)
- **JWT** — authentication tokens
- **bcrypt** — password hashing
- **Pydantic** — request/response validation

---

## 📂 Project Structure

```
PrepFlow/
├── backend/
│   ├── api/
│   │   └── deps.py              # Auth dependencies (JWT middleware)
│   ├── core/
│   │   ├── config.py            # Environment settings
│   │   ├── database.py          # MongoDB / MongoMock connection
│   │   └── security.py          # Password hashing & JWT utils
│   ├── routes/
│   │   ├── auth.py              # POST /auth/login, /auth/register
│   │   ├── questions.py         # CRUD /questions
│   │   ├── reviews.py           # GET /reviews/due
│   │   └── analytics.py         # GET /analytics
│   ├── schemas/
│   │   ├── user.py              # User Pydantic models
│   │   └── question.py          # Question Pydantic models
│   ├── main.py                  # FastAPI app entry point
│   ├── seed.py                  # Standalone seeder script
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── KanbanBoard.jsx  # Drag-and-drop board
│   │   │   ├── Layout.jsx       # Shared layout (Sidebar + Navbar + Outlet)
│   │   │   ├── Navbar.jsx       # Top navigation bar
│   │   │   └── Sidebar.jsx      # Left sidebar navigation
│   │   ├── pages/
│   │   │   ├── BoardPage.jsx    # Kanban board view
│   │   │   ├── Topics.jsx       # All topics grid
│   │   │   ├── TopicDetail.jsx  # Questions for a specific topic
│   │   │   ├── Reviews.jsx      # Spaced repetition review cards
│   │   │   ├── Analytics.jsx    # Charts and stats dashboard
│   │   │   ├── Settings.jsx     # Profile, password, dark mode
│   │   │   └── Login.jsx        # Auth screen
│   │   ├── store/
│   │   │   ├── index.js         # Redux store config
│   │   │   └── slices/
│   │   │       ├── authSlice.js
│   │   │       ├── boardSlice.js
│   │   │       ├── questionSlice.js
│   │   │       └── reviewSlice.js
│   │   ├── App.jsx              # Routing setup
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Tailwind CSS imports
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.9+**
- **Node.js 18+**
- **Git**

> 💡 No MongoDB installation required! The app uses an in-memory mock database for demo purposes.

### 1. Clone the Repository

```bash
git clone https://github.com/1tsadityaraj/PrepFlow.git
cd PrepFlow
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload
```

The backend will start at **http://localhost:8000**. It automatically seeds demo data on first startup.

### 3. Frontend Setup

Open a **new terminal** window:

```bash
# Navigate to frontend
cd PrepFlow/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The frontend will start at **http://localhost:5173**.

### 4. Login

Open **http://localhost:5173** in your browser and use the demo credentials:

| Field    | Value               |
|----------|---------------------|
| Email    | `test@example.com`  |
| Password | `password123`       |

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Create a new user |
| `POST` | `/auth/login` | Login and get JWT token |
| `GET` | `/auth/me` | Get current user info |
| `GET` | `/questions` | List all questions (supports `?topic=` and `?difficulty=` filters) |
| `POST` | `/questions` | Create a new question |
| `PUT` | `/questions/{id}` | Update a question |
| `DELETE` | `/questions/{id}` | Delete a question |
| `GET` | `/reviews/due` | Get questions due for review |
| `GET` | `/analytics` | Get topic/status breakdown stats |

---

## 📸 Pages

| Page | Route | Description |
|------|-------|-------------|
| Board | `/` | Kanban drag-and-drop board |
| Topics | `/topics` | All topics with progress tracking |
| Topic Detail | `/topics/:id` | Questions filtered by topic |
| Reviews | `/reviews` | Spaced repetition review session |
| Analytics | `/analytics` | Charts and performance stats |
| Mock Interview | `/mock-interview` | Timed interview simulator |
| Settings | `/settings` | Profile, password, appearance |
| Login | `/login` | Authentication screen |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/1tsadityaraj">Aditya Raj</a>
</p>
