from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db.database import get_db
from backend.app.models.models import AIReport, Assessment
from backend.app.schemas.schemas import ChatRequest, ChatResponse, ChatMessage, AIReportResponse
from backend.app.core.dependencies import get_current_user
from backend.app.services.gemini_service import generate_chat_response

router = APIRouter(prefix="/api/ai", tags=["AI & Chatbot"])

@router.post("/chat", response_model=ChatResponse)
def chatbot_interaction(
    request: ChatRequest,
    current_user = Depends(get_current_user)
):
    # Map chat history format to lists of dicts for the service
    history_list = []
    for msg in request.history:
        history_list.append({
            "role": msg.role,
            "content": msg.content
        })

    try:
        ai_reply = generate_chat_response(request.message, history_list)
    except Exception as e:
        ai_reply = f"I apologize, I'm having difficulty connecting to my processor right now. Tinnitus is commonly managed with acoustic therapy, stress management, and CBT. Please consult an audiologist. Error details: {str(e)}"

    # Append question and response to history
    new_history = request.history.copy()
    new_history.append(ChatMessage(role="user", content=request.message))
    new_history.append(ChatMessage(role="model", content=ai_reply))

    return ChatResponse(
        response=ai_reply,
        history=new_history
    )

@router.get("/analysis/{assessment_id}", response_model=AIReportResponse)
def get_ai_analysis(
    assessment_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Retrieve AI Report
    report = db.query(AIReport).filter(AIReport.assessment_id == assessment_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI analysis report not found for this assessment"
        )
        
    return report
