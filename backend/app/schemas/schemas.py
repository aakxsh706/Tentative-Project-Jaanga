from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: str
    full_name: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str
    role: str # 'patient', 'doctor', 'admin'
    # Optional details for doctor
    license_number: Optional[str] = None
    specialty: Optional[str] = None
    clinic_name: Optional[str] = None
    phone: Optional[str] = None
    # Optional details for patient
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    noise_exposure_history: Optional[str] = None
    medical_conditions: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Profile Schemas ---
class PatientResponse(BaseModel):
    id: str
    email: str
    full_name: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    noise_exposure_history: Optional[str] = None
    medical_conditions: Optional[str] = None
    assigned_doctor_id: Optional[str] = None

    class Config:
        from_attributes = True

class DoctorResponse(BaseModel):
    id: str
    email: str
    full_name: str
    license_number: str
    specialty: Optional[str] = None
    clinic_name: Optional[str] = None
    phone: Optional[str] = None

    class Config:
        from_attributes = True

# --- Assessment & Wizard Schemas ---
class SoundMatchingCreate(BaseModel):
    matched_frequency_hz: float
    matched_volume_db: float
    sound_type: str
    similarity_rating: int = Field(ge=1, le=10)

class SoundMatchingResponse(SoundMatchingCreate):
    id: str
    assessment_id: str

    class Config:
        from_attributes = True

class QuestionnaireAnswersCreate(BaseModel):
    answers: Dict[str, Any]

class QuestionnaireAnswersResponse(BaseModel):
    id: str
    assessment_id: str
    answers: Dict[str, Any]

    class Config:
        from_attributes = True

class AssessmentCreate(BaseModel):
    ear_selection: str
    ear_hotspots: List[str]
    sound_matching: SoundMatchingCreate
    questionnaire: QuestionnaireAnswersCreate

class AIReportResponse(BaseModel):
    id: str
    assessment_id: str
    severity_level: Optional[str] = None
    risk_factors: Optional[List[str]] = None
    lifestyle_observations: Optional[str] = None
    recommendations: Optional[List[str]] = None
    clinical_summary: Optional[str] = None
    patient_explanation: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AssessmentResponse(BaseModel):
    id: str
    patient_id: str
    ear_selection: str
    ear_hotspots: List[str]
    completed_at: datetime
    sound_matching: Optional[SoundMatchingResponse] = None
    questionnaire: Optional[QuestionnaireAnswersResponse] = None
    ai_report: Optional[AIReportResponse] = None

    class Config:
        from_attributes = True

# --- Daily Log Schemas ---
class DailyLogCreate(BaseModel):
    log_date: str # YYYY-MM-DD
    tinnitus_intensity: int = Field(ge=0, le=10)
    stress_level: int = Field(ge=0, le=10)
    sleep_hours: float = Field(ge=0, le=24)
    mood_rating: int = Field(ge=1, le=5)
    medication_taken: bool
    therapy_minutes_used: int = 0
    notes: Optional[str] = None

class DailyLogResponse(DailyLogCreate):
    id: str
    patient_id: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Sound Therapy Schemas ---
class TherapyItemCreate(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
    audio_url: str
    image_url: Optional[str] = None

class TherapyItemResponse(TherapyItemCreate):
    id: str

    class Config:
        from_attributes = True

# --- Chatbot Schemas ---
class ChatMessage(BaseModel):
    role: str # 'user' or 'model'
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    response: str
    history: List[ChatMessage]
