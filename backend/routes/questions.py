from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from core.database import get_database
from schemas.question import QuestionCreate, QuestionUpdate, QuestionInDB
from api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[QuestionInDB])
async def get_questions(
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    query = {"userId": current_user["_id"]}
    if topic:
        query["topic"] = topic
    if difficulty:
        query["difficulty"] = difficulty
        
    cursor = db.questions.find(query)
    questions = await cursor.to_list(length=1000)
    
    # Map _id to string for Pydantic
    for q in questions:
        q["_id"] = str(q["_id"])
    return questions

@router.post("/", response_model=QuestionInDB)
async def create_question(
    question_in: QuestionCreate,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    question_dict = question_in.dict()
    question_dict["userId"] = current_user["_id"]
    question_dict["lastReviewed"] = None
    question_dict["nextReviewDate"] = None
    question_dict["interval"] = 1
    
    result = await db.questions.insert_one(question_dict)
    question_dict["_id"] = str(result.inserted_id)
    return question_dict

@router.put("/{question_id}", response_model=QuestionInDB)
async def update_question(
    question_id: str,
    question_in: QuestionUpdate,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    
    if not ObjectId.is_valid(question_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    update_data = {k: v for k, v in question_in.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided")
        
    # Check spaced repetition logic
    if "status" in update_data and update_data["status"] == "Mastered":
        # Simple spaced repetition logic placeholder
        # You could dynamically update interval, lastReviewed, nextReviewDate
        pass
        
    result = await db.questions.find_one_and_update(
        {"_id": ObjectId(question_id), "userId": current_user["_id"]},
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Question not found")
        
    result["_id"] = str(result["_id"])
    return result

@router.delete("/{question_id}")
async def delete_question(
    question_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    if not ObjectId.is_valid(question_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    result = await db.questions.delete_one(
        {"_id": ObjectId(question_id), "userId": current_user["_id"]}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")
        
    return {"message": "Question deleted successfully"}
