from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from core.database import connect_to_mongo, close_mongo_connection
from core.database import get_database
from routes import auth, questions, analytics, reviews, ai
from core.config import settings
from api.rate_limit import RateLimiter
import datetime
import random
import time
import logging
from core.security import get_password_hash

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global Rate Limiter: 100 requests per 60 seconds
global_limiter = RateLimiter(requests=100, window=60)

app = FastAPI(
    title=settings.PROJECT_NAME,
    dependencies=[Depends(global_limiter)]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    logger.info(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.2f}ms")
    return response

async def setup_indexes():
    """Create MongoDB indexes for performance optimization"""
    db = get_database()
    # Index for user's questions
    await db.questions.create_index([("userId", 1), ("topic", 1)])
    await db.questions.create_index([("userId", 1), ("nextReviewDate", 1)])
    await db.review_history.create_index([("userId", 1), ("timestamp", -1)])
    logger.info("MongoDB indexes created successfully.")

async def seed_mock_data():
    db = get_database()
    if await db.users.count_documents({}) > 0:
        return

    hashed_password = get_password_hash("password123")
    now = datetime.datetime.utcnow()

    user = {
        "email": "test@example.com",
        "hashed_password": hashed_password,
        "createdAt": now - datetime.timedelta(days=30),
        "streak": 0,
    }
    result = await db.users.insert_one(user)
    user_id = str(result.inserted_id)

    # Rich demo data — realistic interview prep questions
    questions_list = [
        # Arrays
        {"title": "Two Sum", "topic": "Arrays", "difficulty": "Easy", "status": "Mastered", "repetitions": 4, "easeFactor": 2.6, "interval": 14, "lastReviewed": now - datetime.timedelta(days=2), "nextReviewDate": now + datetime.timedelta(days=12)},
        {"title": "Best Time to Buy and Sell Stock", "topic": "Arrays", "difficulty": "Easy", "status": "Mastered", "repetitions": 3, "easeFactor": 2.5, "interval": 7, "lastReviewed": now - datetime.timedelta(days=1), "nextReviewDate": now + datetime.timedelta(days=6)},
        {"title": "Merge Intervals", "topic": "Arrays", "difficulty": "Medium", "status": "Practicing", "repetitions": 1, "easeFactor": 2.5, "interval": 1, "lastReviewed": now - datetime.timedelta(days=1), "nextReviewDate": now},
        {"title": "Trapping Rain Water", "topic": "Arrays", "difficulty": "Hard", "status": "To Learn", "repetitions": 0, "easeFactor": 2.5, "interval": 1, "lastReviewed": None, "nextReviewDate": None},
        {"title": "Product of Array Except Self", "topic": "Arrays", "difficulty": "Medium", "status": "Revision", "repetitions": 2, "easeFactor": 2.3, "interval": 3, "lastReviewed": now - datetime.timedelta(days=4), "nextReviewDate": now - datetime.timedelta(days=1)},
        # Linked Lists
        {"title": "Reverse Linked List", "topic": "Linked Lists", "difficulty": "Easy", "status": "Revision", "repetitions": 2, "easeFactor": 2.4, "interval": 3, "lastReviewed": now - datetime.timedelta(days=5), "nextReviewDate": now - datetime.timedelta(days=2)},
        {"title": "Merge Two Sorted Lists", "topic": "Linked Lists", "difficulty": "Easy", "status": "Mastered", "repetitions": 3, "easeFactor": 2.6, "interval": 10, "lastReviewed": now - datetime.timedelta(days=3), "nextReviewDate": now + datetime.timedelta(days=7)},
        {"title": "Linked List Cycle", "topic": "Linked Lists", "difficulty": "Easy", "status": "Practicing", "repetitions": 1, "easeFactor": 2.5, "interval": 1, "lastReviewed": now - datetime.timedelta(days=1), "nextReviewDate": now},
        # Trees
        {"title": "Binary Tree Level Order Traversal", "topic": "Trees", "difficulty": "Medium", "status": "Mastered", "repetitions": 4, "easeFactor": 2.7, "interval": 21, "lastReviewed": now - datetime.timedelta(days=5), "nextReviewDate": now + datetime.timedelta(days=16)},
        {"title": "Validate Binary Search Tree", "topic": "Trees", "difficulty": "Medium", "status": "Practicing", "repetitions": 1, "easeFactor": 2.5, "interval": 1, "lastReviewed": now - datetime.timedelta(days=2), "nextReviewDate": now - datetime.timedelta(days=1)},
        {"title": "Lowest Common Ancestor", "topic": "Trees", "difficulty": "Medium", "status": "To Learn", "repetitions": 0, "easeFactor": 2.5, "interval": 1, "lastReviewed": None, "nextReviewDate": None},
        # Dynamic Programming
        {"title": "Climbing Stairs", "topic": "Dynamic Programming", "difficulty": "Easy", "status": "Mastered", "repetitions": 5, "easeFactor": 2.8, "interval": 30, "lastReviewed": now - datetime.timedelta(days=10), "nextReviewDate": now + datetime.timedelta(days=20)},
        {"title": "Longest Common Subsequence", "topic": "Dynamic Programming", "difficulty": "Medium", "status": "Practicing", "repetitions": 1, "easeFactor": 2.45, "interval": 1, "lastReviewed": now - datetime.timedelta(days=1), "nextReviewDate": now},
        {"title": "Coin Change", "topic": "Dynamic Programming", "difficulty": "Medium", "status": "To Learn", "repetitions": 0, "easeFactor": 2.5, "interval": 1, "lastReviewed": None, "nextReviewDate": None},
        {"title": "Edit Distance", "topic": "Dynamic Programming", "difficulty": "Hard", "status": "To Learn", "repetitions": 0, "easeFactor": 2.5, "interval": 1, "lastReviewed": None, "nextReviewDate": None},
        # Graphs
        {"title": "Number of Islands", "topic": "Graphs", "difficulty": "Medium", "status": "Mastered", "repetitions": 3, "easeFactor": 2.5, "interval": 7, "lastReviewed": now - datetime.timedelta(days=2), "nextReviewDate": now + datetime.timedelta(days=5)},
        {"title": "Clone Graph", "topic": "Graphs", "difficulty": "Medium", "status": "Revision", "repetitions": 1, "easeFactor": 2.3, "interval": 1, "lastReviewed": now - datetime.timedelta(days=3), "nextReviewDate": now - datetime.timedelta(days=2)},
        {"title": "Course Schedule", "topic": "Graphs", "difficulty": "Medium", "status": "To Learn", "repetitions": 0, "easeFactor": 2.5, "interval": 1, "lastReviewed": None, "nextReviewDate": None},
        # Design
        {"title": "LRU Cache", "topic": "Design", "difficulty": "Medium", "status": "To Learn", "repetitions": 0, "easeFactor": 2.5, "interval": 1, "lastReviewed": None, "nextReviewDate": None},
        {"title": "Min Stack", "topic": "Design", "difficulty": "Medium", "status": "Mastered", "repetitions": 3, "easeFactor": 2.6, "interval": 10, "lastReviewed": now - datetime.timedelta(days=4), "nextReviewDate": now + datetime.timedelta(days=6)},
        # Strings
        {"title": "Valid Parentheses", "topic": "Strings", "difficulty": "Easy", "status": "Mastered", "repetitions": 5, "easeFactor": 2.9, "interval": 30, "lastReviewed": now - datetime.timedelta(days=8), "nextReviewDate": now + datetime.timedelta(days=22)},
        {"title": "Longest Substring Without Repeating", "topic": "Strings", "difficulty": "Medium", "status": "Revision", "repetitions": 2, "easeFactor": 2.4, "interval": 3, "lastReviewed": now - datetime.timedelta(days=4), "nextReviewDate": now - datetime.timedelta(days=1)},
    ]

    for q in questions_list:
        q["userId"] = user_id
        q.setdefault("description", f"Solve the classic '{q['title']}' problem. Practice your approach and optimize.")
        q.setdefault("repetitions", 0)
        q.setdefault("easeFactor", 2.5)

    await db.questions.insert_many(questions_list)

    # Seed review history (last 30 days of activity for analytics)
    review_history = []
    topics = ["Arrays", "Linked Lists", "Trees", "Dynamic Programming", "Graphs", "Design", "Strings"]
    for days_ago in range(30):
        date = now - datetime.timedelta(days=days_ago)
        count = random.randint(0, 5) if days_ago % 7 not in (0, 6) else random.randint(0, 2)
        for _ in range(count):
            review_history.append({
                "userId": user_id,
                "questionId": "demo",
                "quality": random.choice([2, 4, 5]),
                "timestamp": date.replace(hour=random.randint(8, 22), minute=random.randint(0, 59)),
                "topic": random.choice(topics),
                "difficulty": random.choice(["Easy", "Medium", "Hard"]),
            })

    if review_history:
        await db.review_history.insert_many(review_history)

    logger.info(f"Seeded {len(questions_list)} questions and {len(review_history)} review events.")

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()
    await setup_indexes()
    await seed_mock_data()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(questions.router, prefix="/questions", tags=["questions"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
app.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
app.include_router(ai.router, prefix="/ai", tags=["ai"])

@app.get("/")
def root():
    return {"message": "Welcome to PrepFlow API - Production Ready"}
