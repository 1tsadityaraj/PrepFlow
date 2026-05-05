from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class QuestionBase(BaseModel):
    title: str
    topic: str
    difficulty: str
    description: Optional[str] = None
    status: str = "To Learn" # "To Learn", "Practicing", "Mastered", "Revision"

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    title: Optional[str] = None
    topic: Optional[str] = None
    difficulty: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    lastReviewed: Optional[datetime] = None
    nextReviewDate: Optional[datetime] = None

class QuestionInDB(QuestionBase):
    id: str = Field(alias="_id")
    userId: str
    lastReviewed: Optional[datetime] = None
    nextReviewDate: Optional[datetime] = None
    interval: int = 1

    class Config:
        from_attributes = True
        populate_by_name = True
