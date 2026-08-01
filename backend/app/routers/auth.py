from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db.database import get_db
from backend.app.models.models import User, Patient, Doctor
from backend.app.schemas.schemas import UserCreate, UserLogin, Token, UserResponse
from backend.app.core.security import verify_password, get_password_hash, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Validate role
    if user_in.role not in ['patient', 'doctor']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be 'patient' or 'doctor'"
        )

    # Hash the password
    hashed_pwd = get_password_hash(user_in.password)

    # Create Core User
    db_user = User(
        email=user_in.email,
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
        role=user_in.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Create associated profile
    if user_in.role == 'doctor':
        # Check license
        if not user_in.license_number:
            db.delete(db_user)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="License number required for doctors"
            )
        # Check unique license
        existing_license = db.query(Doctor).filter(Doctor.license_number == user_in.license_number).first()
        if existing_license:
            db.delete(db_user)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="License number already registered"
            )

        db_doctor = Doctor(
            id=db_user.id,
            license_number=user_in.license_number,
            specialty=user_in.specialty or "",
            clinic_name=user_in.clinic_name or "",
            phone=user_in.phone or ""
        )
        db.add(db_doctor)
    else:
        # Get first available doctor to assign automatically
        first_doc = db.query(Doctor).first()
        assigned_doc_id = first_doc.id if first_doc else "doc-xavier"

        # Patient profile
        db_patient = Patient(
            id=db_user.id,
            date_of_birth=user_in.date_of_birth or "",
            gender=user_in.gender or "",
            noise_exposure_history=user_in.noise_exposure_history or "",
            medical_conditions=user_in.medical_conditions or "",
            assigned_doctor_id=assigned_doc_id
        )
        db.add(db_patient)

    db.commit()
    return db_user

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == credentials.email).first()
    if not db_user or not verify_password(credentials.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generate token
    token_data = {"sub": db_user.email, "role": db_user.role, "uid": db_user.id}
    access_token = create_access_token(data=token_data)

    return Token(
        access_token=access_token,
        token_type="bearer",
        role=db_user.role,
        user_id=db_user.id,
        full_name=db_user.full_name
    )
