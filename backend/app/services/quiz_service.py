from sqlalchemy.orm import Session
from typing import List, Dict
from app.models.equipment import QuizQuestion
from app.schemas.quiz import QuizQuestionPublicSchema, QuizSubmitRequest, QuizSubmitResponse, QuizQuestionFeedback

class QuizService:
    @staticmethod
    def get_questions_for_equipment(db: Session, equipment_id: str) -> List[QuizQuestionPublicSchema]:
        questions = db.query(QuizQuestion).filter(QuizQuestion.equipment_id == equipment_id).all()
        return [
            QuizQuestionPublicSchema(
                question_id=q.id,
                question_text=q.question_text,
                options=q.options
            ) for q in questions
        ]

    @staticmethod
    def grade_quiz(db: Session, submission: QuizSubmitRequest) -> QuizSubmitResponse:
        questions = db.query(QuizQuestion).filter(QuizQuestion.equipment_id == submission.equipment_id).all()
        
        feedback_list = []
        score = 0
        total = len(questions)

        for q in questions:
            user_ans = submission.answers.get(str(q.id), "").strip().lower()
            correct = q.correct_option.strip().lower()
            is_correct = (user_ans == correct)
            if is_correct:
                score += 1
                
            feedback_list.append(QuizQuestionFeedback(
                question_id=q.id,
                question_text=q.question_text,
                user_answer=user_ans,
                correct_option=correct,
                is_correct=is_correct,
                explanation=q.explanation
            ))

        pct = (score / total * 100) if total > 0 else 0
        
        # Badge logic
        if pct == 100:
            badge = "Master Space Archaeologist"
        elif pct >= 75:
            badge = "Planetary Pioneer"
        elif pct >= 50:
            badge = "Lunar & Martian Cadet"
        else:
            badge = "Curious Space Explorer"

        return QuizSubmitResponse(
            equipment_id=submission.equipment_id,
            score=score,
            total_questions=total,
            percentage=round(pct, 1),
            badge=badge,
            feedback=feedback_list
        )
