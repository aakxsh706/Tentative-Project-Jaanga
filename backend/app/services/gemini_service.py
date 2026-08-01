import json
import logging
import requests
from typing import Dict, Any, List
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

def generate_assessment_analysis(
    ear_selection: str,
    ear_hotspots: List[str],
    matched_frequency_hz: float,
    matched_volume_db: float,
    sound_type: str,
    answers: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Sends assessment details to Gemini to generate clinical summary, 
    patient-friendly explanations, severity level, risk factors and recommendations.
    Falls back to a logic-based mock engine if the API key is missing or fails.
    """
    prompt = f"""
    You are an expert audiologist AI. Analyze the following patient tinnitus assessment data:
    - Ear selection: {ear_selection}
    - Ear hotspots: {', '.join(ear_hotspots) if ear_hotspots else 'None'}
    - Sound matching parameters:
      * Frequency: {matched_frequency_hz} Hz
      * Volume/Intensity: {matched_volume_db} %
      * Sound Type Match: {sound_type}
    - Questionnaire answers: {json.dumps(answers)}

    Generate a structured evaluation. You must respond in valid JSON format with the following keys:
    1. "severity_level": One of 'Mild', 'Moderate', 'Severe', 'Catastrophic'
    2. "risk_factors": A list of strings identifying probable triggers/exacerbating factors.
    3. "lifestyle_observations": A paragraph summarizing stress, sleep, and lifestyle observations.
    4. "recommendations": A list of strings suggesting specific acoustic masking strategies, lifestyle shifts, and behavioral habits.
    5. "clinical_summary": A professional clinical note format for the patient's audiologist.
    6. "patient_explanation": A patient-friendly, empathetic explanation of what these results mean.

    Add a prominent warning in the explanation stating: "DISCLAIMER: This is an AI-assisted support analysis, not a medical diagnosis. Please consult a qualified audiologist for formal medical assessment."
    Do not output any markdown or formatting outside of the JSON.
    """

    if settings.GEMINI_API_KEY:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=10)
            if response.status_code == 200:
                result_json = response.json()
                text_content = result_json["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(text_content)
            else:
                logger.error(f"Gemini API returned status {response.status_code}: {response.text}")
        except Exception as e:
            logger.error(f"Failed to communicate with Gemini API: {e}")

    # Fallback response generator (Realistic mock data based on input parameters)
    logger.info("Using local assessment analysis generator fallback.")
    
    # Simple rule-based calculation
    score = 0
    # Add score based on answers
    for val in answers.values():
        if isinstance(val, (int, float)):
            score += val
        elif isinstance(val, str) and val.isdigit():
            score += int(val)
        elif str(val).lower() == 'yes':
            score += 3
        elif str(val).lower() == 'always' or str(val).lower() == 'severe':
            score += 4
        elif str(val).lower() == 'moderate':
            score += 2

    # Severity scale based on score
    if score < 15:
        severity = "Mild"
    elif score < 30:
        severity = "Moderate"
    elif score < 45:
        severity = "Severe"
    else:
        severity = "Catastrophic"

    # Audio details
    freq_desc = "high-frequency" if matched_frequency_hz > 4000 else "mid-to-low-frequency"
    
    risk_factors = ["Auditory cortex hypersensitivity"]
    if matched_volume_db > 60:
        risk_factors.append("Acoustic trauma vulnerability")
    if answers.get("sleep", "") in ["Poor", "Very Poor", 1, 2]:
        risk_factors.append("Chronic sleep deprivation exacerbation")
    if answers.get("stress", "") in ["High", "Very High", 4, 5, "always"]:
        risk_factors.append("Stress-induced hypercortisolemia")
    if answers.get("noise_exposure", "") in ["yes", "frequent", "always"]:
        risk_factors.append("Occupational/recreational noise exposure history")

    lifestyle_obs = (
        f"The patient demonstrates a {severity.lower()} level of tinnitus burden. "
        f"Sleep patterns are reported as {answers.get('sleep', 'adequate')}, and subjective stress is noted as {answers.get('stress', 'moderate')}. "
        f"Noise exposure history is positive. The sound matching suggests a {freq_desc} sound profile."
    )

    recommendations = [
        f"Initiate sound masking with {sound_type.replace('_', ' ')} or nature sounds (rain/ocean) at a level just below the tinnitus pitch.",
        "Implement cognitive relaxation exercises or mindfulness meditation to address stress factors.",
        "Use custom hearing protection in high-noise environments.",
        "Maintain clean sleep hygiene and limit screens or stimulants 1.5 hours before bedtime."
    ]

    clinical_summary = (
        f"Patient reports {ear_selection} ear tinnitus. Match frequency identified at {matched_frequency_hz} Hz "
        f"({freq_desc}) with a relative intensity of {matched_volume_db} dB. "
        f"Symptomatic questionnaire indicates significant stress/sleep association. Recommended sound therapy target matches {sound_type} masking."
    )

    patient_explanation = (
        f"Your tinnitus is currently classified as {severity.lower()} severity, "
        f"matching a sound around {matched_frequency_hz} Hz ({freq_desc}). "
        f"We noticed that stress levels and sleep play an active role in how loud the sound feels. "
        f"A customized sound mask (such as white/brown noise matching {matched_frequency_hz} Hz) can help train your brain to filter this sound out."
        f"\n\nDISCLAIMER: This is an AI-assisted support analysis, not a medical diagnosis. Please consult a qualified audiologist for formal medical assessment."
    )

    return {
        "severity_level": severity,
        "risk_factors": risk_factors,
        "lifestyle_observations": lifestyle_obs,
        "recommendations": recommendations,
        "clinical_summary": clinical_summary,
        "patient_explanation": patient_explanation
    }

def generate_chat_response(message: str, history: List[Dict[str, str]]) -> str:
    """
    Generate conversational chatbot counseling for tinnitus management.
    Ensures safe disclaimers and escalation warnings are included.
    """
    sys_instruction = """
    You are TinniCare AI, an empathetic, professional chatbot assistant specializing in tinnitus education, counseling, and lifestyle suggestions.
    - Provide helpful explanations on Tinnitus Retraining Therapy (TRT), acoustic masking, lifestyle modifications, and sleep/stress strategies.
    - NEVER diagnose medical conditions or recommend specific medical drugs.
    - If the user expresses extreme distress, depression, thoughts of self-harm, or severe medical symptoms (e.g. sudden hearing loss, vertigo, pulsatile tinnitus, severe pain), display a prominent crisis notice.
    - Always maintain a warm, supportive, and clinical tone.
    - Keep answers concise and readable.
    """
    
    if settings.GEMINI_API_KEY:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        headers = {"Content-Type": "application/json"}
        
        # Build contents from history
        contents = []
        for h in history:
            role = "user" if h["role"] == "user" else "model"
            contents.append({
                "role": role,
                "parts": [{"text": h["content"]}]
            })
        
        # Append current message
        contents.append({
            "role": "user",
            "parts": [{"text": message}]
        })
        
        payload = {
            "contents": contents,
            "systemInstruction": {
                "parts": [{"text": sys_instruction}]
            }
        }
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=10)
            if response.status_code == 200:
                result_json = response.json()
                return result_json["candidates"][0]["content"]["parts"][0]["text"]
            else:
                logger.error(f"Gemini Chat API returned status {response.status_code}: {response.text}")
        except Exception as e:
            logger.error(f"Failed to communicate with Gemini Chat API: {e}")

    # Fallback chatbot responses (local heuristics)
    msg_lower = message.lower()
    
    # Check distress triggers
    distress_keywords = ["kill myself", "suicide", "can't take it anymore", "end it", "depressed", "hate this life"]
    if any(k in msg_lower for k in distress_keywords):
        return (
            "I hear how incredibly difficult this is, and I want to support you, but as an AI, I cannot provide crisis counseling. "
            "Please reach out for professional help immediately. You can dial 988 in the US/Canada or go to your nearest emergency room. "
            "Your life is valuable, and support is available 24/7."
        )

    if "cure" in msg_lower or "how to cure" in msg_lower:
        return (
            "Currently, there is no single scientific cure for chronic subjective tinnitus, but there are highly effective management therapies. "
            "These include Tinnitus Retraining Therapy (TRT), sound masking (using white, pink, or brown noise), cognitive behavioral techniques to manage stress, "
            "and hearing aids if hearing loss is present. The goal is habituation, which helps the brain ignore the noise."
        )
    elif "mask" in msg_lower or "sound therapy" in msg_lower or "noise" in msg_lower:
        return (
            "Sound therapy works by providing external sound that decreases the brain's focus on your tinnitus. "
            "White noise (equal energy across all frequencies) or brown noise (deeper, like a waterfall) are common. "
            "The key is to set the therapy sound at a level slightly below your tinnitus level (known as the 'mixing point') so your brain can practice habituating to both sounds."
        )
    elif "stress" in msg_lower or "sleep" in msg_lower:
        return (
            "Stress and lack of sleep are the two most common factors that increase the perceived loudness of tinnitus. "
            "When we are stressed, our limbic system is hyperactive, making us pay more attention to phantom sounds. "
            "Try incorporating progressive muscle relaxation, limiting caffeine in the afternoon, and using sound machines at bedtime to create a soothing auditory background."
        )
    elif "hello" in msg_lower or "hi" in msg_lower:
        return (
            "Hello! I am TinniCare AI, your assistant for tinnitus education and management. "
            "How can I help you today? You can ask me about sound therapy, stress management, or how to complete your assessments."
        )
    
    return (
        "I understand you're asking about tinnitus management. Tinnitus habituation is a process of retraining the brain to perceive the sound as neutral. "
        "Engaging in sound therapy, tracking daily stress/sleep patterns, and consulting an audiologist are recommended steps. "
        "Let me know if you would like info on sound matching, coping strategies, or sleep hygiene."
    )
