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
    interval: Optional[int] = Field(None, ge=1)
    repetitions: Optional[int] = Field(None, ge=0)
    easeFactor: Optional[float] = Field(None, ge=1.3)

class ReviewRequest(BaseModel):
    quality: int = Field(..., ge=0, le=5, description="Quality of recall (0-5)")

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
