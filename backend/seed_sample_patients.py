import os
import sys
from datetime import datetime, timedelta
import bcrypt

# Setup import path for backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app.db.database import SessionLocal, engine
from backend.app.models.models import Base, User, Patient, Doctor, Assessment, SoundMatching, DailyLog, AIReport

# Verify tables exist
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Default password hash for all patients
hashed_pwd = bcrypt.hashpw("password".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Seed Doctor doc-xavier if not exists (should already exist)
doctor = db.query(Doctor).filter(Doctor.id == "doc-xavier").first()
if not doctor:
    doc_user = User(
        id="doc-xavier",
        email="doctor@tinnicare.com",
        hashed_password=hashed_pwd,
        full_name="Dr. Charles Xavier",
        role="doctor"
    )
    db.add(doc_user)
    doctor = Doctor(
        id="doc-xavier",
        license_number="AUD-007-NY",
        specialty="Neurotology & Acoustic Therapy",
        clinic_name="X-Wellness Institute",
        phone="+1 (555) 123-4567"
    )
    db.add(doctor)
    db.commit()

# Sample CSV dataset representation
sample_data = [
    {
        "id": "pat-p001",
        "name": "Logan Howlett",
        "dob": "1950-05-10",
        "gender": "male",
        "email": "logan.howlett@gmail.com",
        "ear": "both",
        "frequency": 3000.0,
        "volume": 53.0,
        "mask": "white_noise",
        "hotspot": "Mastoid Region",
        "noise": "Occupational",
        "medical": "Hypertension",
        "sleep": [4.0, 4.0, 5.0, 6.0, 6.0, 6.0, 7.0],
        "stress": [8.0, 8.0, 8.0, 7.0, 6.0, 6.0, 5.0],
        "tinnitus": [7.0, 6.0, 6.0, 5.0, 4.0, 4.0, 4.0],
        "status": "Improving",
        "notes": "Patient shows good compliance. Adhering to white noise masking."
    },
    {
        "id": "pat-p002",
        "name": "Ravi Kumar",
        "dob": "1983-05-12",
        "gender": "male",
        "email": "ravi.kumar@gmail.com",
        "ear": "right",
        "frequency": 3500.0,
        "volume": 63.0,
        "mask": "brown_noise",
        "hotspot": "Mastoid Region",
        "noise": "Occupational",
        "medical": "Hypertension",
        "sleep": [5.0, 5.0, 6.0, 6.0, 7.0, 7.0, 6.0],
        "stress": [7.0, 8.0, 6.0, 5.0, 5.0, 4.0, 5.0],
        "tinnitus": [6.0, 5.0, 5.0, 4.0, 5.0, 4.0, 4.0],
        "status": "Stable",
        "notes": "Spike reported mid-week due to work stress. Stable now."
    },
    {
        "id": "pat-p003",
        "name": "Priya Sharma",
        "dob": "1982-08-22",
        "gender": "female",
        "email": "priya.sharma@gmail.com",
        "ear": "both",
        "frequency": 4000.0,
        "volume": 90.0,
        "mask": "pink_noise",
        "hotspot": "Mastoid Region",
        "noise": "Occupational",
        "medical": "Hypertension",
        "sleep": [3.0, 4.0, 5.0, 5.0, 6.0, 6.0, 7.0],
        "stress": [8.0, 8.0, 7.0, 6.0, 6.0, 5.0, 4.0],
        "tinnitus": [8.0, 8.0, 7.0, 6.0, 6.0, 5.0, 4.0],
        "status": "Needs Follow-up",
        "notes": "High distress rating initially. Needs custom audiologist review."
    },
    {
        "id": "pat-p004",
        "name": "Arun Mohan",
        "dob": "1993-06-10",
        "gender": "male",
        "email": "arun.mohan@gmail.com",
        "ear": "left",
        "frequency": 4500.0,
        "volume": 57.0,
        "mask": "rain_sounds",
        "hotspot": "Mastoid Region",
        "noise": "Occupational",
        "medical": "None",
        "sleep": [5.0, 5.0, 5.0, 6.0, 7.0, 7.0, 6.0],
        "stress": [8.0, 8.0, 6.0, 5.0, 5.0, 4.0, 5.0],
        "tinnitus": [6.0, 5.0, 5.0, 4.0, 5.0, 4.0, 4.0],
        "status": "Improving",
        "notes": "Tinnitus intensity dropping gradually with rain masking sound."
    },
    {
        "id": "pat-p005",
        "name": "Meera Raj",
        "dob": "1984-03-24",
        "gender": "female",
        "email": "meera.raj@gmail.com",
        "ear": "right",
        "frequency": 5000.0,
        "volume": 62.0,
        "mask": "ocean_waves",
        "hotspot": "Mastoid Region",
        "noise": "Occupational",
        "medical": "Hypertension",
        "sleep": [4.0, 4.0, 5.0, 6.0, 6.0, 6.0, 7.0],
        "stress": [8.0, 8.0, 8.0, 7.0, 6.0, 6.0, 5.0],
        "tinnitus": [7.0, 6.0, 6.0, 5.0, 4.0, 4.0, 4.0],
        "status": "Stable",
        "notes": "Ocean wave sound therapy is effective. Sleep improving."
    },
    {
        "id": "pat-p006",
        "name": "Karthik Raj",
        "dob": "1988-09-28",
        "gender": "male",
        "email": "karthik.raj@gmail.com",
        "ear": "both",
        "frequency": 5750.0,
        "volume": 69.0,
        "mask": "nature_sounds",
        "hotspot": "Mastoid Region",
        "noise": "Occupational",
        "medical": "None",
        "sleep": [5.0, 5.0, 6.0, 6.0, 7.0, 7.0, 6.0],
        "stress": [7.0, 8.0, 6.0, 5.0, 5.0, 4.0, 5.0],
        "tinnitus": [6.0, 5.0, 5.0, 4.0, 5.0, 4.0, 4.0],
        "status": "Needs Follow-up",
        "notes": "Requires follow-up for potential high frequency hearing loss checks."
    },
    {
        "id": "pat-p007",
        "name": "Anitha Paul",
        "dob": "1995-06-05",
        "gender": "female",
        "email": "anitha.paul@gmail.com",
        "ear": "left",
        "frequency": 6200.0,
        "volume": 68.0,
        "mask": "forest_ambient",
        "hotspot": "Mastoid Region",
        "noise": "Occupational",
        "medical": "Hypertension",
        "sleep": [3.0, 4.0, 5.0, 5.0, 6.0, 6.0, 7.0],
        "stress": [8.0, 8.0, 7.0, 6.0, 6.0, 5.0, 4.0],
        "tinnitus": [8.0, 8.0, 7.0, 6.0, 6.0, 5.0, 4.0],
        "status": "Improving",
        "notes": "Good progress. Compliance is 100% on forest ambient player."
    },
    {
        "id": "pat-p008",
        "name": "Rahul Dutt",
        "dob": "1987-05-17",
        "gender": "male",
        "email": "rahul.dutt@gmail.com",
        "ear": "right",
        "frequency": 6650.0,
        "volume": 71.0,
        "mask": "soft_music",
        "hotspot": "Mastoid Region",
        "noise": "Occupational",
        "medical": "None",
        "sleep": [5.0, 5.0, 5.0, 6.0, 7.0, 7.0, 6.0],
        "stress": [8.0, 8.0, 6.0, 5.0, 5.0, 4.0, 5.0],
        "tinnitus": [6.0, 5.0, 5.0, 4.0, 5.0, 4.0, 4.0],
        "status": "Stable",
        "notes": "Stable. Compliance looks high. Tinnitus levels flattening."
    },
    {
        "id": "pat-p009",
        "name": "Lakshmi Devi",
        "dob": "1989-03-12",
        "gender": "female",
        "email": "lakshmi.devi@gmail.com",
        "ear": "both",
        "frequency": 7100.0,
        "volume": 79.0,
        "mask": "notched_sound",
        "hotspot": "Mastoid Region",
        "noise": "Occupational",
        "medical": "Hypertension",
        "sleep": [4.0, 4.0, 5.0, 6.0, 6.0, 6.0, 7.0],
        "stress": [8.0, 8.0, 8.0, 7.0, 6.0, 6.0, 5.0],
        "tinnitus": [7.0, 6.0, 6.0, 5.0, 4.0, 4.0, 4.0],
        "status": "Needs Follow-up",
        "notes": "Notched noise masking evaluated. Needs adjustments at follow-up."
    },
    {
        "id": "pat-p010",
        "name": "Sneha George",
        "dob": "1990-08-30",
        "gender": "female",
        "email": "sneha.george@gmail.com",
        "ear": "left",
        "frequency": 7550.0,
        "volume": 77.0,
        "mask": "mixed_sound",
        "hotspot": "Mastoid Region",
        "noise": "Occupational",
        "medical": "None",
        "sleep": [5.0, 5.0, 6.0, 6.0, 7.0, 7.0, 6.0],
        "stress": [7.0, 8.0, 6.0, 5.0, 5.0, 4.0, 5.0],
        "tinnitus": [6.0, 5.0, 5.0, 4.0, 5.0, 4.0, 4.0],
        "status": "Improving",
        "notes": "Excellent habituation progress using mixed ambient noise clips."
    }
]

print("Starting to seed sample patients from spreadsheet...")

for item in sample_data:
    # 1. Check if user already exists
    existing_user = db.query(User).filter(User.email == item["email"]).first()
    if existing_user:
        print(f"User {item['name']} already exists. Skipping user creation.")
        db_user = existing_user
    else:
        # Create user
        db_user = User(
            id=item["id"],
            email=item["email"],
            hashed_password=hashed_pwd,
            full_name=item["name"],
            role="patient"
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

    # 2. Check if patient profile exists
    patient = db.query(Patient).filter(Patient.id == db_user.id).first()
    if not patient:
        patient = Patient(
            id=db_user.id,
            date_of_birth=item["dob"],
            gender=item["gender"],
            noise_exposure_history=f"Tinnitus triggered by {item['noise']} noise.",
            medical_conditions=item["notes"],
            assigned_doctor_id="doc-xavier"
        )
        db.add(patient)
        db.commit()
        db.refresh(patient)
    else:
        # Update notes
        patient.medical_conditions = item["notes"]
        patient.assigned_doctor_id = "doc-xavier"
        db.commit()

    # 3. Create sample Assessment if none exists
    existing_assess = db.query(Assessment).filter(Assessment.patient_id == patient.id).first()
    if not existing_assess:
        assess = Assessment(
            patient_id=patient.id,
            ear_selection=item["ear"],
            ear_hotspots=[item["hotspot"]],
            completed_at=datetime.utcnow() - timedelta(days=7)
        )
        db.add(assess)
        db.commit()
        db.refresh(assess)

        # 4. Create SoundMatching row
        sound_match = SoundMatching(
            assessment_id=assess.id,
            matched_frequency_hz=item["frequency"],
            matched_volume_db=item["volume"],
            sound_type=item["mask"]
        )
        db.add(sound_match)

        # 5. Create AIReport row
        ai_rep = AIReport(
            assessment_id=assess.id,
            severity_level="Severe" if item["status"] == "Needs Follow-up" else "Moderate",
            risk_factors=[item["noise"], item["medical"]],
            lifestyle_observations="Reported stress and sleep issues contributing to tinnitus spikes.",
            recommendations=[f"Customized {item['mask'].replace('_', ' ')} strategy."],
            clinical_summary=f"AI Summary: Detected {item['ear']} tinnitus. Pitch matching is {item['frequency']}Hz. Recommended sound therapy.",
            patient_explanation=f"Your symptoms look typical of {item['status']} tinnitus. Try following the sound masker habituation routine."
        )
        db.add(ai_rep)
        db.commit()

    # 6. Delete old DailyLogs and create 7 days of historical logs
    db.query(DailyLog).filter(DailyLog.patient_id == patient.id).delete()
    
    base_date = datetime.utcnow() - timedelta(days=6)
    for idx in range(7):
        log_date = (base_date + timedelta(days=idx)).date()
        daily_log = DailyLog(
            patient_id=patient.id,
            log_date=log_date.isoformat(),
            tinnitus_intensity=item["tinnitus"][idx],
            stress_level=item["stress"][idx],
            sleep_hours=item["sleep"][idx],
            mood_rating=4 if item["stress"][idx] < 6 else 2,
            therapy_minutes_used=30
        )
        db.add(daily_log)
    
    db.commit()

print("Successfully seeded all 10 sample patient accounts from the spreadsheet!")
db.close()
