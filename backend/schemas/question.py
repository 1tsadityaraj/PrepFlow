from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional, List, Literal

VALID_STATUSES = ["To Learn", "Practicing", "Mastered", "Revision"]
VALID_DIFFICULTIES = ["Easy", "Medium", "Hard"]

class QuestionBase(BaseModel):
    title: str
    topic: str
    difficulty: Literal["Easy", "Medium", "Hard"]
    description: Optional[str] = None
    status: Literal["To Learn", "Practicing", "Mastered", "Revision"] = "To Learn"

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    title: Optional[str] = None
    topic: Optional[str] = None
    difficulty: Optional[Literal["Easy", "Medium", "Hard"]] = None
    description: Optional[str] = None
    status: Optional[Literal["To Learn", "Practicing", "Mastered", "Revision"]] = None
    lastReviewed: Optional[datetime] = None
    nextReviewDate: Optional[datetime] = None
    interval: Optional[int] = None
    repetitions: Optional[int] = None
    easeFactor: Optional[float] = None

class ReviewRequest(BaseModel):
    quality: Literal["again", "good", "easy"]

class QuestionInDB(QuestionBase):
    id: str = Field(alias="_id")
    userId: str
    lastReviewed: Optional[datetime] = None
    nextReviewDate: Optional[datetime] = None
    interval: int = 1
    repetitions: int = 0
    easeFactor: float = 2.5

    class Config:
        from_attributes = True
        populate_by_name = True
