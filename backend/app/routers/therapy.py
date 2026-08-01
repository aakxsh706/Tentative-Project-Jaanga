from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from backend.app.db.database import get_db
from backend.app.models.models import Patient, TherapyItem, DailyLog
from backend.app.schemas.schemas import TherapyItemResponse
from backend.app.core.dependencies import get_current_patient

router = APIRouter(prefix="/api/therapy", tags=["Sound Therapy"])

@router.get("/library", response_model=List[TherapyItemResponse])
def get_therapy_library(db: Session = Depends(get_db)):
    items = db.query(TherapyItem).all()
    return items

@router.get("/favorites", response_model=List[TherapyItemResponse])
def get_favorite_therapies(
    patient: Patient = Depends(get_current_patient)
):
    return patient.favorite_therapies

@router.post("/favorite/{therapy_id}")
def toggle_favorite_therapy(
    therapy_id: str,
    patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    item = db.query(TherapyItem).filter(TherapyItem.id == therapy_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Therapy sound not found"
        )
    
    if item in patient.favorite_therapies:
        patient.favorite_therapies.remove(item)
        message = "Removed from favorites"
    else:
        patient.favorite_therapies.append(item)
        message = "Added to favorites"
        
    db.commit()
    return {"message": message, "therapy_id": therapy_id}

class SessionLogRequest(BaseModel):
    duration_minutes: int


@router.post("/session")
def log_therapy_session(
    session_data: SessionLogRequest,
    patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    today = date.today().isoformat()
    
    # Try to find today's daily log to update the therapy_minutes_used
    log = db.query(DailyLog).filter(
        DailyLog.patient_id == patient.id,
        DailyLog.log_date == today
    ).first()
    
    if log:
        log.therapy_minutes_used += session_data.duration_minutes
    else:
        # Create a basic daily log for today
        log = DailyLog(
            patient_id=patient.id,
            log_date=today,
            tinnitus_intensity=5, # average default if logging just sound
            stress_level=5,
            sleep_hours=7.0,
            mood_rating=3,
            medication_taken=False,
            therapy_minutes_used=session_data.duration_minutes,
            notes="Logged sound therapy session"
        )
        db.add(log)
        
    db.commit()
    db.refresh(log)
    return {"message": "Therapy session recorded successfully", "total_today_minutes": log.therapy_minutes_used}
