from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import asyncio
import random

from api.deps import get_current_user

router = APIRouter()

class EvaluateRequest(BaseModel):
    question_title: str
    question_topic: str
    user_answer: str

class EvaluateResponse(BaseModel):
    score: int
    strengths: list[str]
    weaknesses: list[str]
    improvement_suggestions: list[str]

@router.post("/evaluate", response_model=EvaluateResponse)
async def evaluate_answer(
    request: EvaluateRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Evaluates a user's answer to an interview question using an AI model.
    In a production environment, this would call OpenAI/Gemini APIs.
    For this demo, we use a sophisticated rule-based mock evaluator.
    """
    
    # Simulate API latency
    await asyncio.sleep(1.5)
    
    answer_lower = request.user_answer.lower()
    length = len(answer_lower.split())
    
    # Simple heuristics to generate a realistic-looking AI response
    score = 50
    strengths = []
    weaknesses = []
    improvements = []
    
    if length > 50:
        score += 20
        strengths.append("Good detailed explanation of your approach.")
    else:
        weaknesses.append("Answer is too brief and lacks depth.")
        improvements.append("Try to explain your thought process step-by-step.")
        
    if "O(n)" in answer_lower or "o(1)" in answer_lower or "time complexity" in answer_lower:
        score += 15
        strengths.append("Excellent mention of time/space complexity.")
    else:
        weaknesses.append("Missing Big-O complexity analysis.")
        improvements.append("Always explicitly state the time and space complexity of your solution.")
        
    if "edge case" in answer_lower or "null" in answer_lower or "empty" in answer_lower:
        score += 15
        strengths.append("Considered edge cases well.")
    else:
        improvements.append("Discuss potential edge cases (e.g., empty arrays, null pointers).")
        
    # Cap score
    score = min(score, 100)
    
    # Fallback generic feedback if too sparse
    if not strengths:
        strengths.append("Attempted to solve the problem directly.")
    if not improvements:
        improvements.append("Consider comparing your approach with alternative data structures.")
        
    return EvaluateResponse(
        score=score,
        strengths=strengths,
        weaknesses=weaknesses,
        improvement_suggestions=improvements
    )
