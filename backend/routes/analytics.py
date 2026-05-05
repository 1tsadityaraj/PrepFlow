from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from typing import Dict, Any, List

from core.database import get_database
from api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=Dict[str, Any])
async def get_analytics(current_user: dict = Depends(get_current_user)):
    db = get_database()
    user_id = current_user["_id"]
    now = datetime.utcnow()

    # ── Topic-wise breakdown ──
    pipeline = [
        {"$match": {"userId": user_id}},
        {"$group": {"_id": "$topic", "count": {"$sum": 1}}}
    ]
    cursor = db.questions.aggregate(pipeline)
    topic_distribution = await cursor.to_list(length=100)
    topic_wise = {item["_id"]: item["count"] for item in topic_distribution}

    # ── Status breakdown ──
    status_pipeline = [
        {"$match": {"userId": user_id}},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    status_cursor = db.questions.aggregate(status_pipeline)
    status_distribution = await status_cursor.to_list(length=100)
    status_wise = {item["_id"]: item["count"] for item in status_distribution}

    # ── Questions due for review ──
    due_count = await db.questions.count_documents({
        "userId": user_id,
        "nextReviewDate": {"$lte": now}
    })

    # ── Topic mastery (for weak topic detection) ──
    all_questions = await db.questions.find({"userId": user_id}).to_list(length=1000)
    topic_mastery = {}
    for q in all_questions:
        t = q.get("topic", "Unknown")
        if t not in topic_mastery:
            topic_mastery[t] = {"total": 0, "mastered": 0}
        topic_mastery[t]["total"] += 1
        if q.get("status") == "Mastered":
            topic_mastery[t]["mastered"] += 1

    weak_topics = []
    for topic, data in topic_mastery.items():
        pct = round((data["mastered"] / data["total"]) * 100) if data["total"] > 0 else 0
        weak_topics.append({"topic": topic, "mastered": data["mastered"], "total": data["total"], "percent": pct})
    weak_topics.sort(key=lambda x: x["percent"])

    # ── Daily review activity (last 30 days) ──
    thirty_days_ago = now - timedelta(days=30)
    history_cursor = db.review_history.find({
        "userId": user_id,
        "timestamp": {"$gte": thirty_days_ago}
    })
    history = await history_cursor.to_list(length=5000)

    daily_activity = {}
    for h in history:
        day_str = h["timestamp"].strftime("%Y-%m-%d")
        daily_activity[day_str] = daily_activity.get(day_str, 0) + 1

    # Build last 30 days array (including zeros)
    daily_reviews = []
    for i in range(30):
        d = (now - timedelta(days=29 - i)).strftime("%Y-%m-%d")
        daily_reviews.append({"date": d, "count": daily_activity.get(d, 0)})

    # ── Streak calculation ──
    streak = 0
    for i in range(30):
        d = (now - timedelta(days=i)).strftime("%Y-%m-%d")
        if daily_activity.get(d, 0) > 0:
            streak += 1
        else:
            if i > 0:  # Allow today to be zero (not done yet)
                break

    return {
        "topicWise": topic_wise,
        "statusWise": status_wise,
        "dueReviews": due_count,
        "streak": streak,
        "weakTopics": weak_topics,
        "dailyReviews": daily_reviews,
    }
