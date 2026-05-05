import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import datetime
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "prepflow"

async def seed_data():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]

    # Clear existing data
    await db.users.delete_many({})
    await db.questions.delete_many({})

    # Create dummy user
    hashed_password = pwd_context.hash("password123")
    user = {
        "email": "test@example.com",
        "hashed_password": hashed_password,
        "createdAt": datetime.datetime.utcnow(),
        "streak": 5
    }
    result = await db.users.insert_one(user)
    user_id = str(result.inserted_id)

    # Create dummy questions
    questions = [
        {"title": "Two Sum", "topic": "Arrays", "difficulty": "Easy", "status": "Mastered"},
        {"title": "Reverse Linked List", "topic": "Linked Lists", "difficulty": "Easy", "status": "Revision", "nextReviewDate": datetime.datetime.utcnow() - datetime.timedelta(days=1)},
        {"title": "Merge Intervals", "topic": "Arrays", "difficulty": "Medium", "status": "Practicing"},
        {"title": "LRU Cache", "topic": "Design", "difficulty": "Medium", "status": "To Learn"},
        {"title": "Trapping Rain Water", "topic": "Arrays", "difficulty": "Hard", "status": "To Learn"},
        {"title": "Binary Tree Level Order Traversal", "topic": "Trees", "difficulty": "Medium", "status": "Mastered"},
    ]

    for q in questions:
        q["userId"] = user_id
        if "nextReviewDate" not in q:
            q["nextReviewDate"] = None
        q["lastReviewed"] = None
        q["interval"] = 1
        q["description"] = "Dummy description for " + q["title"]

    await db.questions.insert_many(questions)
    print(f"Data seeded! User created with email 'test@example.com' and password 'password123'")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_data())
