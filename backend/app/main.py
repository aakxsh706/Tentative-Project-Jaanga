from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.db.database import engine, Base, SessionLocal
from backend.app.models.models import TherapyItem, User, Patient, Doctor
from backend.app.core.security import get_password_hash
from backend.app.routers import auth, patients, assessments, daily_logs, therapy, ai, doctor

# Create Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TinniCare AI API",
    description="Backend clinical support and patient management API for Tinnitus assessment and therapy.",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(assessments.router)
app.include_router(daily_logs.router)
app.include_router(therapy.router)
app.include_router(ai.router)
app.include_router(doctor.router)

# Seed database on startup
@app.on_event("startup")
def seed_db():
    db = SessionLocal()
    try:
        # Check if users are seeded
        if db.query(User).count() == 0:
            print("Seeding demo user accounts...")
            hashed_pwd = get_password_hash("password")
            
            # 1. Create Doctor
            doc_user = User(
                id="doc-xavier",
                email="doctor@tinnicare.com",
                hashed_password=hashed_pwd,
                full_name="Dr. Charles Xavier",
                role="doctor"
            )
            db.add(doc_user)
            doc_profile = Doctor(
                id="doc-xavier",
                license_number="AUD-007-NY",
                specialty="Neurotology & Acoustic Therapy",
                clinic_name="X-Wellness Institute",
                phone="+1 (555) 123-4567"
            )
            db.add(doc_profile)

            # 2. Create Patient
            pat_user = User(
                id="pat-logan",
                email="patient@tinnicare.com",
                hashed_password=hashed_pwd,
                full_name="Logan Howlett",
                role="patient"
            )
            db.add(pat_user)
            pat_profile = Patient(
                id="pat-logan",
                date_of_birth="1985-10-23",
                gender="male",
                noise_exposure_history="Severe industrial noise and heavy metal vibrations.",
                medical_conditions="Sensory tinnitus spikes, hyperacusis.",
                assigned_doctor_id="doc-xavier"
            )
            db.add(pat_profile)
            db.commit()
            print("Successfully seeded demo user accounts.")

        # Check if therapy library is empty
        if db.query(TherapyItem).count() == 0:
            seeds = [
                TherapyItem(
                    id="t1",
                    name="Deep Brownian Masker",
                    category="brown_noise",
                    description="Deep rumble waterfall sound. Excellent for masking high-pitched ringing.",
                    audio_url="synth:brown",
                    image_url="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=150"
                ),
                TherapyItem(
                    id="t2",
                    name="Pure White Noise",
                    category="white_noise",
                    description="Static white signal providing equal power across the audible spectrum.",
                    audio_url="synth:white",
                    image_url="https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=150"
                ),
                TherapyItem(
                    id="t3",
                    name="Gentle Pink Canopy",
                    category="pink_noise",
                    description="Balanced noise similar to rustling leaves, gentle on sensitive hearing.",
                    audio_url="synth:pink",
                    image_url="https://images.unsplash.com/photo-1448375240586-882707db888b?w=150"
                ),
                TherapyItem(
                    id="t4",
                    name="Rainfall Masker",
                    category="rain",
                    description="Soothing rhythmic rain shower, perfect for sleep and concentration.",
                    audio_url="synth:rain",
                    image_url="https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=150"
                ),
                TherapyItem(
                    id="t5",
                    name="Ocean Surf Calmer",
                    category="ocean",
                    description="Simulated ocean swells that periodically submerge and mask spikes.",
                    audio_url="synth:ocean",
                    image_url="https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=150"
                ),
                TherapyItem(
                    id="t6",
                    name="Zen Temple Meditation",
                    category="meditation",
                    description="Low frequency gong drone with ambient wind chimes for stress relief.",
                    audio_url="synth:meditation",
                    image_url="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=150"
                )
            ]
            db.bulk_save_objects(seeds)
            db.commit()
            print("Successfully seeded Sound Therapy Library in database.")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to TinniCare AI Hackathon API Portal. Go to /docs for API schema definitions."}
