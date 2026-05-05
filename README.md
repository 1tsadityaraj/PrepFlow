# PrepFlow 🚀

PrepFlow is an Interview Preparation Board with a Kanban-style workflow and advanced learning features.

## ⚙️ Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Redux Toolkit, Framer Motion
- **Backend**: Python FastAPI, Motor (Async MongoDB), JWT Auth
- **Database**: MongoDB

## 📂 Project Structure
- `/backend`: FastAPI server, routes, and models.
- `/frontend`: Vite React app with Redux and Tailwind CSS.

## 🚀 Running Locally

### Prerequisites
- Python 3.9+
- Node.js 18+
- MongoDB installed and running locally on default port (27017)

### 1️⃣ Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Seed dummy data (optional):
   ```bash
   python seed.py
   # Creates user: test@example.com / password123
   ```
5. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
   *The backend will run on `http://localhost:8000`*

### 2️⃣ Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`*

## ✨ Features
- **JWT Authentication**: Secure login and registration.
- **Kanban Board**: Drag and drop questions across learning stages.
- **Analytics Ready**: Backend APIs prepared for topic and status breakdowns.
- **Spaced Repetition Engine**: Track `nextReviewDate` for intelligent learning.
- **Modern UI**: Clean, dynamic interface built with Tailwind and Framer Motion.
