"""
TriageAI - Analytics Routes
Provides aggregated dashboard statistics.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db, Patient
from app.models import AnalyticsResponse, PatientResponse
from app.routers.patients import patient_to_response

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("", response_model=AnalyticsResponse)
async def get_analytics(db: AsyncSession = Depends(get_db)):
    """Get aggregated analytics for the dashboard."""

    # Total patients
    total_result = await db.execute(select(func.count(Patient.id)))
    total_patients = total_result.scalar() or 0

    # Patients by ESI level
    esi_result = await db.execute(
        select(Patient.esi_level, func.count(Patient.id))
        .where(Patient.esi_level.isnot(None))
        .group_by(Patient.esi_level)
    )
    patients_by_esi = {}
    for level, count in esi_result.all():
        patients_by_esi[str(level)] = count

    # Patients by status
    status_result = await db.execute(
        select(Patient.status, func.count(Patient.id))
        .group_by(Patient.status)
    )
    patients_by_status = {}
    for status, count in status_result.all():
        patients_by_status[status] = count

    # AI acceptance rate (assessed but not overridden / total assessed)
    total_assessed_result = await db.execute(
        select(func.count(Patient.id)).where(Patient.triage_status.in_(["Assessed", "Overridden"]))
    )
    total_assessed = total_assessed_result.scalar() or 0

    overridden_result = await db.execute(
        select(func.count(Patient.id)).where(Patient.triage_status == "Overridden")
    )
    total_overridden = overridden_result.scalar() or 0

    ai_acceptance_rate = 0.0
    if total_assessed > 0:
        ai_acceptance_rate = round((total_assessed - total_overridden) / total_assessed, 2)

    # Estimated wait times by ESI level (average)
    wait_result = await db.execute(
        select(Patient.esi_level, func.avg(Patient.estimated_wait_minutes))
        .where(Patient.esi_level.isnot(None))
        .where(Patient.status == "Waiting")
        .group_by(Patient.esi_level)
    )
    current_wait_times = {}
    for level, avg_wait in wait_result.all():
        current_wait_times[str(level)] = int(avg_wait) if avg_wait else 0

    # Recent patients (last 10)
    recent_result = await db.execute(
        select(Patient).order_by(Patient.created_at.desc()).limit(10)
    )
    recent_patients = [patient_to_response(p) for p in recent_result.scalars().all()]

    return AnalyticsResponse(
        total_patients=total_patients,
        patients_by_esi=patients_by_esi,
        patients_by_status=patients_by_status,
        ai_acceptance_rate=ai_acceptance_rate,
        avg_triage_time_seconds=None,  # Would need timestamps to calculate
        current_wait_times=current_wait_times,
        recent_patients=recent_patients,
    )
