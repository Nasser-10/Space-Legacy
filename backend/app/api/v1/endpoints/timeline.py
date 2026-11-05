from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.equipment import TimelineEventSchema
from app.services.equipment_service import EquipmentService

router = APIRouter()

@router.get("/{equipment_id}/timeline", response_model=List[TimelineEventSchema])
def get_equipment_timeline(equipment_id: str, db: Session = Depends(get_db)):
    """Retrieve chronological timeline milestones for specific equipment."""
    events = EquipmentService.get_timeline(db, equipment_id)
    if not events:
        # Check if equipment exists
        eq = EquipmentService.get_equipment_detail(db, equipment_id)
        if not eq:
            raise HTTPException(status_code=404, detail=f"Equipment '{equipment_id}' not found.")
    return events
