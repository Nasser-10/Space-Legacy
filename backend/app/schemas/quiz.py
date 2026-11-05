from pydantic import BaseModel
from typing import Dict, List, Optional

class QuizQuestionPublicSchema(BaseModel):
    question_id: int
    question_text: str
    options: Dict[str, str]

class QuizSubmitRequest(BaseModel):
    equipment_id: str
    answers: Dict[str, str]  # e.g., {"1": "b", "2": "a"}

class QuizQuestionFeedback(BaseModel):
    question_id: int
    question_text: str
    user_answer: str
    correct_option: str
    is_correct: bool
    explanation: str

class QuizSubmitResponse(BaseModel):
    equipment_id: str
    score: int
    total_questions: int
    percentage: float
    badge: str
    feedback: List[QuizQuestionFeedback]
