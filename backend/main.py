from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import connect_to_mongo, close_mongo_connection
from core.database import get_database
from routes import auth, questions, analytics, reviews
from core.config import settings
import datetime
from core.security import get_password_hash

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def seed_mock_data():
    db = get_database()
    # Check if already seeded
    if await db.users.count_documents({}) > 0:
        return
    
    hashed_password = get_password_hash("password123")
    user = {
        "email": "test@example.com",
        "hashed_password": hashed_password,
        "createdAt": datetime.datetime.utcnow(),
        "streak": 5
    }
    result = await db.users.insert_one(user)
    user_id = str(result.inserted_id)

    questions_list = [
        {"title": "Two Sum", "topic": "Arrays", "difficulty": "Easy", "status": "Mastered"},
        {"title": "Reverse Linked List", "topic": "Linked Lists", "difficulty": "Easy", "status": "Revision", "nextReviewDate": datetime.datetime.utcnow() - datetime.timedelta(days=1)},
        {"title": "Merge Intervals", "topic": "Arrays", "difficulty": "Medium", "status": "Practicing"},
        {"title": "LRU Cache", "topic": "Design", "difficulty": "Medium", "status": "To Learn"},
        {"title": "Trapping Rain Water", "topic": "Arrays", "difficulty": "Hard", "status": "To Learn"},
        {"title": "Binary Tree Level Order Traversal", "topic": "Trees", "difficulty": "Medium", "status": "Mastered"},
    ]

    for q in questions_list:
        q["userId"] = user_id
        if "nextReviewDate" not in q:
            q["nextReviewDate"] = None
        q["lastReviewed"] = None
        q["interval"] = 1
        q["description"] = "Dummy description for " + q["title"]

    await db.questions.insert_many(questions_list)
    print("Mock data seeded successfully.")

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()
    await seed_mock_data()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(questions.router, prefix="/questions", tags=["questions"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
app.include_router(reviews.router, prefix="/reviews", tags=["reviews"])

@app.get("/")
def root():
    return {"message": "Welcome to PrepFlow API"}

