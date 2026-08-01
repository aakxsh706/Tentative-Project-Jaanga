from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.db.database import get_db
from backend.app.models.models import Patient, DailyLog
from backend.app.schemas.schemas import DailyLogCreate, DailyLogResponse
from backend.app.core.dependencies import get_current_patient

router = APIRouter(prefix="/api/daily-logs", tags=["Daily Logs"])

@router.get("", response_model=List[DailyLogResponse])
def get_daily_logs(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    query = db.query(DailyLog).filter(DailyLog.patient_id == patient.id)
    if start_date:
        query = query.filter(DailyLog.log_date >= start_date)
    if end_date:
        query = query.filter(DailyLog.log_date <= end_date)
        
    logs = query.order_by(DailyLog.log_date.asc()).all()
    return logs

@router.post("", response_model=DailyLogResponse)
def create_or_update_daily_log(
    log_in: DailyLogCreate,
    patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    # Check if a log for this date already exists to perform upsert
    existing_log = db.query(DailyLog).filter(
        DailyLog.patient_id == patient.id,
        DailyLog.log_date == log_in.log_date
    ).first()

    if existing_log:
        existing_log.tinnitus_intensity = log_in.tinnitus_intensity
        existing_log.stress_level = log_in.stress_level
        existing_log.sleep_hours = log_in.sleep_hours
        existing_log.mood_rating = log_in.mood_rating
        existing_log.medication_taken = log_in.medication_taken
        existing_log.therapy_minutes_used = log_in.therapy_minutes_used
        existing_log.notes = log_in.notes
        db.commit()
        db.refresh(existing_log)
        return existing_log
    else:
        db_log = DailyLog(
            patient_id=patient.id,
            log_date=log_in.log_date,
            tinnitus_intensity=log_in.tinnitus_intensity,
            stress_level=log_in.stress_level,
            sleep_hours=log_in.sleep_hours,
            mood_rating=log_in.mood_rating,
            medication_taken=log_in.medication_taken,
            therapy_minutes_used=log_in.therapy_minutes_used,
            notes=log_in.notes
        )
        db.add(db_log)
        db.commit()
        db.refresh(db_log)
        return db_log
