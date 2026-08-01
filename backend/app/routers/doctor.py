from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import date, timedelta
from pydantic import BaseModel
from backend.app.db.database import get_db
from backend.app.models.models import Doctor, Patient, Assessment, DailyLog, AIReport
from backend.app.core.dependencies import get_current_doctor

router = APIRouter(prefix="/api/doctor", tags=["Clinician Portal"])

class PatientListItem(BaseModel):
    id: str
    full_name: str
    email: str
    latest_severity: Optional[str] = "N/A"
    latest_frequency: Optional[float] = None
    latest_volume: Optional[float] = None
    latest_assessment_date: Optional[str] = None
    compliance_score_percent: int

class PatientDetails(BaseModel):
    id: str
    full_name: str
    email: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    noise_exposure_history: Optional[str] = None
    medical_conditions: Optional[str] = None
    assessments: List[Dict[str, Any]]
    daily_logs: List[Dict[str, Any]]
    clinical_notes: Optional[str] = None

class DoctorNotesUpdate(BaseModel):
    notes: str

@router.get("/patients", response_model=List[PatientListItem])
def get_assigned_patients(
    doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db)
):
    # Query all patients assigned to this doctor
    patients = db.query(Patient).filter(Patient.assigned_doctor_id == doctor.id).all()
    results = []
    
    today = date.today()
    seven_days_ago = (today - timedelta(days=7)).isoformat()

    for pat in patients:
        # Get latest assessment
        latest_assessment = db.query(Assessment).filter(
            Assessment.patient_id == pat.id
        ).order_by(Assessment.completed_at.desc()).first()
        
        severity = "N/A"
        frequency = None
        volume = None
        assess_date = None
        
        if latest_assessment:
            assess_date = latest_assessment.completed_at.isoformat()
            if latest_assessment.ai_report:
                severity = latest_assessment.ai_report.severity_level
            if latest_assessment.sound_matching:
                frequency = latest_assessment.sound_matching.matched_frequency_hz
                volume = latest_assessment.sound_matching.matched_volume_db

        # Calculate compliance score (percentage of logs in the past 7 days)
        logs_count = db.query(DailyLog).filter(
            DailyLog.patient_id == pat.id,
            DailyLog.log_date >= seven_days_ago
        ).count()
        
        compliance = int((logs_count / 7) * 100)
        if compliance > 100:
            compliance = 100

        results.append(PatientListItem(
            id=pat.id,
            full_name=pat.user.full_name,
            email=pat.user.email,
            latest_severity=severity,
            latest_frequency=frequency,
            latest_volume=volume,
            latest_assessment_date=assess_date,
            compliance_score_percent=compliance
        ))
        
    return results

@router.get("/patients/{patient_id}", response_model=PatientDetails)
def get_patient_details(
    patient_id: str,
    doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db)
):
    # Verify patient exists and is assigned
    patient = db.query(Patient).filter(
        Patient.id == patient_id,
        Patient.assigned_doctor_id == doctor.id
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found or not assigned to this doctor"
        )
        
    # Get assessments
    assessments_db = db.query(Assessment).filter(
        Assessment.patient_id == patient_id
    ).order_by(Assessment.completed_at.desc()).all()
    
    assessments_list = []
    for ass in assessments_db:
        assessments_list.append({
            "id": ass.id,
            "ear_selection": ass.ear_selection,
            "ear_hotspots": ass.ear_hotspots,
            "completed_at": ass.completed_at.isoformat(),
            "sound_matching": {
                "matched_frequency_hz": ass.sound_matching.matched_frequency_hz,
                "matched_volume_db": ass.sound_matching.matched_volume_db,
                "sound_type": ass.sound_matching.sound_type,
                "similarity_rating": ass.sound_matching.similarity_rating
            } if ass.sound_matching else None,
            "ai_report": {
                "severity_level": ass.ai_report.severity_level,
                "risk_factors": ass.ai_report.risk_factors,
                "lifestyle_observations": ass.ai_report.lifestyle_observations,
                "recommendations": ass.ai_report.recommendations,
                "clinical_summary": ass.ai_report.clinical_summary,
                "patient_explanation": ass.ai_report.patient_explanation
            } if ass.ai_report else None
        })
        
    # Get daily logs
    logs_db = db.query(DailyLog).filter(
        DailyLog.patient_id == patient_id
    ).order_by(DailyLog.log_date.desc()).all()
    
    logs_list = []
    for log in logs_db:
        logs_list.append({
            "id": log.id,
            "log_date": log.log_date,
            "tinnitus_intensity": log.tinnitus_intensity,
            "stress_level": log.stress_level,
            "sleep_hours": log.sleep_hours,
            "mood_rating": log.mood_rating,
            "medication_taken": log.medication_taken,
            "therapy_minutes_used": log.therapy_minutes_used,
            "notes": log.notes
        })
        
    return PatientDetails(
        id=patient.id,
        full_name=patient.user.full_name,
        email=patient.user.email,
        date_of_birth=patient.date_of_birth,
        gender=patient.gender,
        noise_exposure_history=patient.noise_exposure_history,
        medical_conditions=patient.medical_conditions,
        assessments=assessments_list,
        daily_logs=logs_list,
        clinical_notes=patient.medical_conditions # Reuse field for simplicity
    )

@router.put("/patients/{patient_id}/notes")
def update_clinical_notes(
    patient_id: str,
    notes_in: DoctorNotesUpdate,
    doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(
        Patient.id == patient_id,
        Patient.assigned_doctor_id == doctor.id
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found or not assigned to this doctor"
        )
        
    patient.medical_conditions = notes_in.notes
    db.commit()
    return {"message": "Clinical notes updated successfully"}
