from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.quiz import QuizQuestionPublicSchema, QuizSubmitRequest, QuizSubmitResponse
from app.services.quiz_service import QuizService

router = APIRouter()

@router.get("/{equipment_id}", response_model=List[QuizQuestionPublicSchema])
def get_quiz_questions(equipment_id: str, db: Session = Depends(get_db)):
    """Retrieve multiple-choice educational quiz questions without answer keys."""
    questions = QuizService.get_questions_for_equipment(db, equipment_id)
    if not questions:
        raise HTTPException(status_code=404, detail=f"No quiz questions found for equipment '{equipment_id}'.")
    return questions

@router.post("/submit", response_model=QuizSubmitResponse)
def submit_quiz(submission: QuizSubmitRequest, db: Session = Depends(get_db)):
    """Grade quiz answers, calculate score and percentage, and award badges with feedback."""
    return QuizService.grade_quiz(db, submission)
