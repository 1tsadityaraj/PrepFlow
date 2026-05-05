from fastapi import APIRouter, Depends
from datetime import datetime
from typing import List

from core.database import get_database
from schemas.question import QuestionInDB
from api.deps import get_current_user

router = APIRouter()

@router.get("/due", response_model=List[QuestionInDB])
async def get_due_reviews(current_user: dict = Depends(get_current_user)):
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
