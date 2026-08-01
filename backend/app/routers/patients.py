from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db.database import get_db
from backend.app.models.models import Patient, Doctor, User
from backend.app.schemas.schemas import PatientResponse, DoctorResponse
from backend.app.core.dependencies import get_current_patient
from typing import List

router = APIRouter(prefix="/api/patients", tags=["Patients"])

@router.get("/me", response_model=PatientResponse)
def get_patient_profile(patient: Patient = Depends(get_current_patient)):
    return PatientResponse(
        id=patient.id,
        email=patient.user.email,
        full_name=patient.user.full_name,
        date_of_birth=patient.date_of_birth,
        gender=patient.gender,
        noise_exposure_history=patient.noise_exposure_history,
        medical_conditions=patient.medical_conditions,
        assigned_doctor_id=patient.assigned_doctor_id
    )

class PatientProfileUpdate(PatientResponse):
    pass

@router.put("/me", response_model=PatientResponse)
def update_patient_profile(
    profile_data: PatientResponse, 
    patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    patient.date_of_birth = profile_data.date_of_birth
    patient.gender = profile_data.gender
    patient.noise_exposure_history = profile_data.noise_exposure_history
    patient.medical_conditions = profile_data.medical_conditions
    
    db.commit()
    db.refresh(patient)
    
    return PatientResponse(
        id=patient.id,
        email=patient.user.email,
        full_name=patient.user.full_name,
        date_of_birth=patient.date_of_birth,
        gender=patient.gender,
        noise_exposure_history=patient.noise_exposure_history,
        medical_conditions=patient.medical_conditions,
        assigned_doctor_id=patient.assigned_doctor_id
    )

@router.get("/doctors", response_model=List[DoctorResponse])
def get_all_doctors(db: Session = Depends(get_db)):
    doctors = db.query(Doctor).all()
    results = []
    for doc in doctors:
        results.append(DoctorResponse(
            id=doc.id,
            email=doc.user.email,
            full_name=doc.user.full_name,
            license_number=doc.license_number,
            specialty=doc.specialty,
            clinic_name=doc.clinic_name,
            phone=doc.phone
        ))
    return results

@router.post("/assign-doctor/{doctor_id}", response_model=PatientResponse)
def assign_doctor(
    doctor_id: str, 
    patient: Patient = Depends(get_current_patient), 
    db: Session = Depends(get_db)
):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    
    patient.assigned_doctor_id = doctor_id
    db.commit()
    db.refresh(patient)
    
    return PatientResponse(
        id=patient.id,
        email=patient.user.email,
        full_name=patient.user.full_name,
        date_of_birth=patient.date_of_birth,
        gender=patient.gender,
        noise_exposure_history=patient.noise_exposure_history,
        medical_conditions=patient.medical_conditions,
        assigned_doctor_id=patient.assigned_doctor_id
    )
