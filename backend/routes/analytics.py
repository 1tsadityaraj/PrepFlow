from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from typing import Dict, Any

from core.database import get_database
from api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=Dict[str, Any])
async def get_analytics(current_user: dict = Depends(get_current_user)):
    db = get_database()
    user_id = current_user["_id"]
    
    # Topic-wise breakdown
    pipeline = [
        {"$match": {"userId": user_id}},
        {"$group": {"_id": "$topic", "count": {"$sum": 1}}}
    ]
    cursor = db.questions.aggregate(pipeline)
    topic_distribution = await cursor.to_list(length=100)
    topic_wise = {item["_id"]: item["count"] for item in topic_distribution}
    
    # Status breakdown
    status_pipeline = [
        {"$match": {"userId": user_id}},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    status_cursor = db.questions.aggregate(status_pipeline)
    status_distribution = await status_cursor.to_list(length=100)
    status_wise = {item["_id"]: item["count"] for item in status_distribution}
    
    # Questions due for review
    now = datetime.utcnow()
    due_count = await db.questions.count_documents({
        "userId": user_id,
        "nextReviewDate": {"$lte": now}
    })
    
    return {
        "topicWise": topic_wise,
        "statusWise": status_wise,
        "dueReviews": due_count,
        "streak": current_user.get("streak", 0)
    }
