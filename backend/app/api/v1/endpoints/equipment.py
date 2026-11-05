from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.schemas.equipment import EquipmentSummarySchema, EquipmentDetailSchema, SourceSchema
from app.services.equipment_service import EquipmentService

router = APIRouter()

@router.get("", response_model=List[EquipmentSummarySchema])
def list_equipment(
    planet: Optional[str] = Query(None, description="Filter by celestial body: 'moon' or 'mars'"),
    status: Optional[str] = Query(None, description="Filter by status: 'historic_monument', 'completed', 'active'"),
    db: Session = Depends(get_db)
):
    """Retrieve list of historical space equipment on Moon and Mars."""
    return EquipmentService.get_equipment_list(db, planet=planet, status=status)

@router.get("/{equipment_id}", response_model=EquipmentDetailSchema)
def get_equipment(equipment_id: str, db: Session = Depends(get_db)):
    """Retrieve full technical and historical dossier for specific equipment."""
    item = EquipmentService.get_equipment_detail(db, equipment_id)
    if not item:
        raise HTTPException(status_code=404, detail=f"Equipment with ID '{equipment_id}' not found.")
    return item

@router.get("/{equipment_id}/sources", response_model=List[SourceSchema])
def get_equipment_sources(equipment_id: str, db: Session = Depends(get_db)):
    """Retrieve verified official NASA sources for equipment."""
    return EquipmentService.get_sources(db, equipment_id)
