from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from typing import List
from bson import ObjectId

from core.database import get_database
from schemas.question import QuestionInDB, ReviewRequest
from api.deps import get_current_user
from services.spaced_repetition import compute_review

router = APIRouter()

@router.get("/due", response_model=List[QuestionInDB])
async def get_due_reviews(current_user: dict = Depends(get_current_user)):
    """Fetch all questions that are due for review today."""
    db = get_database()
    now = datetime.utcnow()

    query = {
        "userId": current_user["_id"],
        "$or": [
            {"nextReviewDate": {"$lte": now}},
            {"nextReviewDate": None, "status": {"$in": ["Mastered", "Revision"]}}
        ]
    }

    cursor = db.questions.find(query)
    questions = await cursor.to_list(length=100)

    for q in questions:
        q["_id"] = str(q["_id"])
    return questions

@router.post("/{question_id}/review", response_model=QuestionInDB)
async def review_question(
    question_id: str,
    review_in: ReviewRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Submit a review for a question.
    Uses SM-2 inspired algorithm to compute next review date.
    Also logs the review event in review_history for analytics.
    """
    db = get_database()

    if not ObjectId.is_valid(question_id):
        raise HTTPException(status_code=400, detail="Invalid ID")

    question = await db.questions.find_one(
        {"_id": ObjectId(question_id), "userId": current_user["_id"]}
    )
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    # Compute new review schedule using SM-2 engine
    update_data = compute_review(
        quality=review_in.quality,
        interval=question.get("interval", 1),
        repetitions=question.get("repetitions", 0),
        ease_factor=question.get("easeFactor", 2.5),
    )

    # Update the question
    result = await db.questions.find_one_and_update(
        {"_id": ObjectId(question_id)},
        {"$set": update_data},
        return_document=True
    )

    # Log review event for analytics
    await db.review_history.insert_one({
        "userId": current_user["_id"],
        "questionId": question_id,
        "quality": review_in.quality,
        "timestamp": datetime.utcnow(),
        "topic": question.get("topic"),
        "difficulty": question.get("difficulty"),
    })

    result["_id"] = str(result["_id"])
    return result
