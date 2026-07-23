"""
TriageAI - Triage Routes
Handles AI-powered triage assessment requests.
"""

import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db, Patient
from app.models import TriageResult
from app.services.ai_engine import assess_patient

router = APIRouter(prefix="/api/triage", tags=["Triage"])


@router.post("/{patient_id}", response_model=TriageResult)
async def run_triage(patient_id: int, db: AsyncSession = Depends(get_db)):
    """
    Run AI-powered triage assessment on a patient.
    Calls the Gemini AI engine and stores the result.
    """
    # Fetch the patient
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalar_one_or_none()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    if patient.triage_status == "Assessed":
        raise HTTPException(
            status_code=400,
            detail="Patient has already been triaged. Use the override endpoint to change the assessment."
        )

    # Build patient data dict for the AI engine
    patient_data = {
        "name": patient.name,
        "age": patient.age,
        "gender": patient.gender,
        "chief_complaint": patient.chief_complaint,
        "pain_level": patient.pain_level,
        "heart_rate": patient.heart_rate,
        "blood_pressure_systolic": patient.blood_pressure_systolic,
        "blood_pressure_diastolic": patient.blood_pressure_diastolic,
        "temperature": patient.temperature,
        "respiratory_rate": patient.respiratory_rate,
        "spo2": patient.spo2,
        "arrival_mode": patient.arrival_mode,
        "allergies": patient.allergies,
        "medical_history": patient.medical_history,
        "current_medications": patient.current_medications,
    }

    # Run AI assessment
    triage_result = await assess_patient(patient_data)

    # Store results in the database
    patient.esi_level = triage_result.esi_level
    patient.ai_confidence = triage_result.confidence
    patient.ai_reasoning = json.dumps(triage_result.reasoning)
    patient.recommended_actions = json.dumps(triage_result.recommended_actions)
    patient.critical_flags = json.dumps(triage_result.critical_flags)
    patient.estimated_wait_minutes = triage_result.estimated_wait_minutes
    patient.brief_summary = triage_result.brief_summary
    patient.triage_status = "Assessed"
    patient.triage_completed_at = datetime.now(timezone.utc).isoformat()

    await db.commit()
    await db.refresh(patient)

    return triage_result
