import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, Float, Integer, Boolean, Date, JSON, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.app.db.database import Base

def generate_uuid():
    return str(uuid.uuid4())

# Many-to-many relationship helper table for patient favorite therapies
patient_favorites = Table(
    'patient_favorites',
    Base.metadata,
    Column('patient_id', String, ForeignKey('patients.id', ondelete='CASCADE'), primary_key=True),
    Column('therapy_id', String, ForeignKey('therapy_library.id', ondelete='CASCADE'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False) # 'patient', 'doctor', 'admin'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    doctor_profile = relationship("Doctor", uselist=False, back_populates="user")
    patient_profile = relationship("Patient", uselist=False, back_populates="user")

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    license_number = Column(String, unique=True, nullable=False)
    specialty = Column(String)
    clinic_name = Column(String)
    phone = Column(String)

    user = relationship("User", back_populates="doctor_profile")
    patients = relationship("Patient", back_populates="assigned_doctor")

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    date_of_birth = Column(String) # Stored as string format YYYY-MM-DD
    gender = Column(String)
    noise_exposure_history = Column(String)
    medical_conditions = Column(String)
    assigned_doctor_id = Column(String, ForeignKey("doctors.id", ondelete="SET NULL"))

    user = relationship("User", back_populates="patient_profile")
    assigned_doctor = relationship("Doctor", back_populates="patients")
    assessments = relationship("Assessment", back_populates="patient", cascade="all, delete-orphan")
    daily_logs = relationship("DailyLog", back_populates="patient", cascade="all, delete-orphan")
    favorite_therapies = relationship("TherapyItem", secondary=patient_favorites, back_populates="favorited_by")

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String, primary_key=True, default=generate_uuid)
    patient_id = Column(String, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    ear_selection = Column(String, nullable=False) # 'left', 'right', 'both'
    ear_hotspots = Column(JSON) # JSON array of selected hotspots
    completed_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="assessments")
    sound_matching = relationship("SoundMatching", uselist=False, back_populates="assessment", cascade="all, delete-orphan")
    questionnaire = relationship("QuestionnaireAnswers", uselist=False, back_populates="assessment", cascade="all, delete-orphan")
    ai_report = relationship("AIReport", uselist=False, back_populates="assessment", cascade="all, delete-orphan")

class SoundMatching(Base):
    __tablename__ = "sound_matching"

    id = Column(String, primary_key=True, default=generate_uuid)
    assessment_id = Column(String, ForeignKey("assessments.id", ondelete="CASCADE"), unique=True, nullable=False)
    matched_frequency_hz = Column(Float, nullable=False)
    matched_volume_db = Column(Float, nullable=False)
    sound_type = Column(String, nullable=False) # 'pure_tone', 'white_noise', etc.
    similarity_rating = Column(Integer)

    assessment = relationship("Assessment", back_populates="sound_matching")

class QuestionnaireAnswers(Base):
    __tablename__ = "questionnaire_answers"

    id = Column(String, primary_key=True, default=generate_uuid)
    assessment_id = Column(String, ForeignKey("assessments.id", ondelete="CASCADE"), unique=True, nullable=False)
    answers = Column(JSON, nullable=False) # JSON dict of responses

    assessment = relationship("Assessment", back_populates="questionnaire")

class AIReport(Base):
    __tablename__ = "ai_reports"

    id = Column(String, primary_key=True, default=generate_uuid)
    assessment_id = Column(String, ForeignKey("assessments.id", ondelete="CASCADE"), unique=True, nullable=False)
    severity_level = Column(String) # 'Mild', 'Moderate', 'Severe', 'Catastrophic'
    risk_factors = Column(JSON) # List of risk factors
    lifestyle_observations = Column(String)
    recommendations = Column(JSON) # List of recommendations
    clinical_summary = Column(String)
    patient_explanation = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    assessment = relationship("Assessment", back_populates="ai_report")

class DailyLog(Base):
    __tablename__ = "daily_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    patient_id = Column(String, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    log_date = Column(String, nullable=False) # YYYY-MM-DD
    tinnitus_intensity = Column(Integer, nullable=False) # 0-10
    stress_level = Column(Integer, nullable=False) # 0-10
    sleep_hours = Column(Float, nullable=False)
    mood_rating = Column(Integer, nullable=False) # 1-5
    medication_taken = Column(Boolean, default=False)
    therapy_minutes_used = Column(Integer, default=0)
    notes = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="daily_logs")

class TherapyItem(Base):
    __tablename__ = "therapy_library"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False) # 'white_noise', 'brown_noise', etc.
    description = Column(String)
    audio_url = Column(String, nullable=False)
    image_url = Column(String)

    favorited_by = relationship("Patient", secondary=patient_favorites, back_populates="favorite_therapies")
