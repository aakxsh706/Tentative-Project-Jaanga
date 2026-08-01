from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.db.database import get_db
from backend.app.models.models import Patient, Assessment, SoundMatching, QuestionnaireAnswers, AIReport
from backend.app.schemas.schemas import AssessmentCreate, AssessmentResponse
from backend.app.core.dependencies import get_current_patient
from backend.app.services.gemini_service import generate_assessment_analysis

router = APIRouter(prefix="/api/assessments", tags=["Assessments"])

@router.post("", response_model=AssessmentResponse)
def create_assessment(
    assessment_in: AssessmentCreate,
    patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    # 1. Create Assessment
    db_assessment = Assessment(
        patient_id=patient.id,
        ear_selection=assessment_in.ear_selection,
        ear_hotspots=assessment_in.ear_hotspots
    )
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)

    # 2. Save Sound Matching
    db_sound = SoundMatching(
        assessment_id=db_assessment.id,
        matched_frequency_hz=assessment_in.sound_matching.matched_frequency_hz,
        matched_volume_db=assessment_in.sound_matching.matched_volume_db,
        sound_type=assessment_in.sound_matching.sound_type,
        similarity_rating=assessment_in.sound_matching.similarity_rating
    )
    db.add(db_sound)

    # 3. Save Questionnaire Answers
    db_answers = QuestionnaireAnswers(
        assessment_id=db_assessment.id,
        answers=assessment_in.questionnaire.answers
    )
    db.add(db_answers)
    db.commit()

    # 4. Trigger Gemini AI analysis (or local fallback)
    try:
        ai_analysis = generate_assessment_analysis(
            ear_selection=db_assessment.ear_selection,
            ear_hotspots=db_assessment.ear_hotspots,
            matched_frequency_hz=db_sound.matched_frequency_hz,
            matched_volume_db=db_sound.matched_volume_db,
            sound_type=db_sound.sound_type,
            answers=db_answers.answers
        )
    except Exception as e:
        ai_analysis = {
            "severity_level": "Moderate",
            "risk_factors": ["Underlying acoustic strain"],
            "lifestyle_observations": "Unable to run full AI analysis. Showing baseline projections.",
            "recommendations": ["Initiate sound masking with rain or ocean sounds"],
            "clinical_summary": "System failed to process AI response: " + str(e),
            "patient_explanation": "A baseline evaluation has been prepared. Please review default sound therapies."
        }

    db_ai_report = AIReport(
        assessment_id=db_assessment.id,
        severity_level=ai_analysis.get("severity_level", "Unknown"),
        risk_factors=ai_analysis.get("risk_factors", []),
        lifestyle_observations=ai_analysis.get("lifestyle_observations", ""),
        recommendations=ai_analysis.get("recommendations", []),
        clinical_summary=ai_analysis.get("clinical_summary", ""),
        patient_explanation=ai_analysis.get("patient_explanation", "")
    )
    db.add(db_ai_report)
    db.commit()
    
    db.refresh(db_assessment)
    return db_assessment

@router.get("/latest", response_model=AssessmentResponse)
def get_latest_assessment(
    patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    assessment = db.query(Assessment).filter(
        Assessment.patient_id == patient.id
    ).order_by(Assessment.completed_at.desc()).first()
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No assessments found for this patient"
        )
    return assessment

@router.get("/history", response_model=List[AssessmentResponse])
def get_assessment_history(
    patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    assessments = db.query(Assessment).filter(
        Assessment.patient_id == patient.id
    ).order_by(Assessment.completed_at.desc()).all()
    return assessments

@router.get("/{assessment_id}", response_model=AssessmentResponse)
def get_assessment(
    assessment_id: str,
    patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    assessment = db.query(Assessment).filter(
        Assessment.id == assessment_id,
        Assessment.patient_id == patient.id
    ).first()
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found or unauthorized"
        )
    return assessment
