"""
TriageAI - Demo Data Seeder
Populates the database with realistic patient data for demonstration purposes.
Run this script before the demo to have a populated dashboard.

Usage: python seed_data.py
"""

import asyncio
import json
import sys
import os
from datetime import datetime, timezone, timedelta

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import create_tables, async_session, Patient


DEMO_PATIENTS = [
    # ── ESI Level 1 - Resuscitation ──────────────────────
    {
        "name": "Robert Chen",
        "age": 68,
        "gender": "Male",
        "chief_complaint": "Found unresponsive by family, not breathing normally, gurgling sounds",
        "pain_level": 0,
        "heart_rate": 42,
        "blood_pressure_systolic": 78,
        "blood_pressure_diastolic": 45,
        "temperature": 96.2,
        "respiratory_rate": 6,
        "spo2": 82.0,
        "arrival_mode": "Ambulance",
        "allergies": "Codeine",
        "medical_history": "COPD, CHF, previous MI, atrial fibrillation",
        "current_medications": "Warfarin, Metoprolol, Furosemide, Lisinopril",
        "esi_level": 1,
        "triage_status": "Assessed",
        "ai_confidence": 0.99,
        "ai_reasoning": json.dumps([
            "Patient is unresponsive with severely depressed respiratory rate (6 breaths/min)",
            "Severe bradycardia (HR 42) with hypotension (BP 78/45) indicating hemodynamic collapse",
            "Critical oxygen saturation (SpO2 82%) well below emergency threshold",
            "Significant cardiac history (previous MI, CHF, A-fib) increases mortality risk"
        ]),
        "recommended_actions": json.dumps([
            "Immediate airway management - prepare for intubation",
            "IV access x2, fluid resuscitation",
            "Continuous cardiac monitoring, 12-lead ECG stat",
            "Activate code blue / rapid response team",
            "Check glucose, ABG, troponin, BMP stat"
        ]),
        "critical_flags": json.dumps(["SpO2 82% - CRITICAL", "HR 42 - Severe Bradycardia", "BP 78/45 - Hypotension", "RR 6 - Respiratory Failure"]),
        "estimated_wait_minutes": 0,
        "brief_summary": "Unresponsive elderly male with respiratory failure, hemodynamic instability, and critical cardiac history requiring immediate resuscitation.",
        "status": "In Treatment",
        "minutes_ago": 45,
    },
    # ── ESI Level 2 - Emergent ──────────────────────────
    {
        "name": "Maria Garcia",
        "age": 52,
        "gender": "Female",
        "chief_complaint": "Crushing chest pain radiating to left arm and jaw, started 30 minutes ago, diaphoretic",
        "pain_level": 9,
        "heart_rate": 118,
        "blood_pressure_systolic": 168,
        "blood_pressure_diastolic": 98,
        "temperature": 98.8,
        "respiratory_rate": 24,
        "spo2": 94.0,
        "arrival_mode": "Ambulance",
        "allergies": "None",
        "medical_history": "Type 2 Diabetes, Hypertension, Hyperlipidemia, Family history of MI",
        "current_medications": "Metformin, Lisinopril, Atorvastatin",
        "esi_level": 2,
        "triage_status": "Assessed",
        "ai_confidence": 0.96,
        "ai_reasoning": json.dumps([
            "Classic acute coronary syndrome presentation: crushing chest pain with left arm and jaw radiation",
            "Tachycardia (HR 118) and hypertension (168/98) suggest significant cardiovascular stress",
            "SpO2 94% borderline low, consistent with cardiac compromise",
            "Multiple cardiac risk factors: diabetes, hypertension, hyperlipidemia, family history"
        ]),
        "recommended_actions": json.dumps([
            "Immediate 12-lead ECG within 10 minutes",
            "Aspirin 325mg PO, Nitroglycerin sublingual",
            "IV access, cardiac enzymes (Troponin I/T)",
            "Cardiology consult for possible cath lab activation",
            "Continuous telemetry monitoring"
        ]),
        "critical_flags": json.dumps(["Possible STEMI", "Tachycardia HR 118"]),
        "estimated_wait_minutes": 5,
        "brief_summary": "52-year-old female with classic ACS presentation, multiple cardiac risk factors, requiring emergent cardiac workup.",
        "status": "In Treatment",
        "minutes_ago": 35,
    },
    {
        "name": "James Wilson",
        "age": 71,
        "gender": "Male",
        "chief_complaint": "Sudden onset right-sided weakness, facial droop, slurred speech for past 45 minutes",
        "pain_level": 2,
        "heart_rate": 88,
        "blood_pressure_systolic": 185,
        "blood_pressure_diastolic": 105,
        "temperature": 98.6,
        "respiratory_rate": 18,
        "spo2": 97.0,
        "arrival_mode": "Ambulance",
        "allergies": "Penicillin",
        "medical_history": "Atrial fibrillation, Hypertension, Previous TIA 2 years ago",
        "current_medications": "Eliquis, Amlodipine, Metoprolol",
        "esi_level": 2,
        "triage_status": "Assessed",
        "ai_confidence": 0.97,
        "ai_reasoning": json.dumps([
            "FAST-positive: Facial droop, Arm weakness (right-sided), Speech difficulty — classic stroke presentation",
            "Symptom onset 45 minutes ago — within thrombolytic treatment window (4.5 hours)",
            "Hypertension (185/105) common in acute stroke, needs careful management",
            "History of A-fib and previous TIA significantly increases stroke risk"
        ]),
        "recommended_actions": json.dumps([
            "ACTIVATE STROKE ALERT — time is brain",
            "Stat CT Head without contrast (rule out hemorrhagic stroke)",
            "NIH Stroke Scale assessment",
            "Neurology consult for tPA evaluation",
            "Blood glucose check, PT/INR (on Eliquis)",
            "NPO status, IV access"
        ]),
        "critical_flags": json.dumps(["Acute Stroke Alert", "BP 185/105 - Hypertensive", "On Anticoagulation (Eliquis)"]),
        "estimated_wait_minutes": 0,
        "brief_summary": "71-year-old male with acute stroke symptoms within treatment window, FAST-positive, requiring emergent stroke protocol activation.",
        "status": "In Treatment",
        "minutes_ago": 30,
    },
    {
        "name": "Aisha Patel",
        "age": 28,
        "gender": "Female",
        "chief_complaint": "Severe allergic reaction after eating shrimp — lips swelling, throat feels tight, hives all over body",
        "pain_level": 5,
        "heart_rate": 125,
        "blood_pressure_systolic": 95,
        "blood_pressure_diastolic": 58,
        "temperature": 98.4,
        "respiratory_rate": 26,
        "spo2": 93.0,
        "arrival_mode": "Walk-in",
        "allergies": "Shellfish (known), Latex",
        "medical_history": "Asthma, previous anaphylaxis episode 3 years ago",
        "current_medications": "Albuterol inhaler PRN, carries EpiPen (did not use)",
        "esi_level": 2,
        "triage_status": "Assessed",
        "ai_confidence": 0.95,
        "ai_reasoning": json.dumps([
            "Anaphylaxis presentation: throat tightness, lip swelling, diffuse hives after known allergen exposure",
            "Hypotension (95/58) and tachycardia (125) indicate distributive shock",
            "SpO2 93% with elevated respiratory rate (26) suggests airway compromise",
            "History of previous anaphylaxis increases severity risk; EpiPen not used"
        ]),
        "recommended_actions": json.dumps([
            "IM Epinephrine 0.3mg (anterolateral thigh) IMMEDIATELY",
            "IV access, NS fluid bolus 1L",
            "Diphenhydramine 50mg IV, Methylprednisolone 125mg IV",
            "Continuous monitoring — watch for biphasic reaction",
            "Albuterol nebulizer if wheezing develops",
            "Prepare for advanced airway if throat swelling worsens"
        ]),
        "critical_flags": json.dumps(["Anaphylaxis", "Hypotension 95/58", "SpO2 93%", "Airway Compromise Risk"]),
        "estimated_wait_minutes": 0,
        "brief_summary": "28-year-old female with anaphylaxis from shellfish exposure, showing hemodynamic compromise and airway involvement.",
        "status": "In Treatment",
        "minutes_ago": 20,
    },
    # ── ESI Level 3 - Urgent ────────────────────────────
    {
        "name": "David Thompson",
        "age": 45,
        "gender": "Male",
        "chief_complaint": "Severe abdominal pain in right lower quadrant, started 8 hours ago, nausea, one episode of vomiting",
        "pain_level": 7,
        "heart_rate": 92,
        "blood_pressure_systolic": 138,
        "blood_pressure_diastolic": 85,
        "temperature": 100.8,
        "respiratory_rate": 18,
        "spo2": 98.0,
        "arrival_mode": "Walk-in",
        "allergies": "Sulfa drugs",
        "medical_history": "None significant",
        "current_medications": "None",
        "esi_level": 3,
        "triage_status": "Assessed",
        "ai_confidence": 0.88,
        "ai_reasoning": json.dumps([
            "Right lower quadrant pain with migration pattern classic for appendicitis",
            "Low-grade fever (100.8°F) supports infectious/inflammatory process",
            "Nausea and vomiting consistent with acute abdomen presentation",
            "Requires multiple resources: labs (CBC, CMP, lipase), CT abdomen/pelvis, possible surgical consult"
        ]),
        "recommended_actions": json.dumps([
            "CBC with differential, CMP, Lipase, Urinalysis",
            "CT Abdomen/Pelvis with IV contrast",
            "IV access, NS maintenance fluids",
            "Pain management (Morphine or Ketorolac)",
            "NPO status pending surgical evaluation",
            "Surgical consult if imaging confirms appendicitis"
        ]),
        "critical_flags": json.dumps([]),
        "estimated_wait_minutes": 30,
        "brief_summary": "45-year-old male with RLQ pain, fever, and vomiting concerning for acute appendicitis, needs imaging and labs.",
        "status": "Waiting",
        "minutes_ago": 55,
    },
    {
        "name": "Sarah Kim",
        "age": 34,
        "gender": "Female",
        "chief_complaint": "Asthma exacerbation, using inhaler every 2 hours with minimal relief, cannot complete full sentences",
        "pain_level": 3,
        "heart_rate": 108,
        "blood_pressure_systolic": 130,
        "blood_pressure_diastolic": 82,
        "temperature": 98.2,
        "respiratory_rate": 28,
        "spo2": 91.0,
        "arrival_mode": "Walk-in",
        "allergies": "Aspirin",
        "medical_history": "Moderate persistent asthma, 2 ER visits this year, no intubations",
        "current_medications": "Fluticasone/Salmeterol inhaler, Albuterol PRN, Montelukast",
        "esi_level": 3,
        "triage_status": "Assessed",
        "ai_confidence": 0.91,
        "ai_reasoning": json.dumps([
            "Moderate-severe asthma exacerbation: unable to speak in full sentences, using accessory muscles",
            "SpO2 91% below normal threshold despite home bronchodilator use",
            "Tachycardia (108) and tachypnea (28) indicate significant respiratory distress",
            "Frequent ER visits (2 this year) suggest poorly controlled asthma — higher risk for deterioration"
        ]),
        "recommended_actions": json.dumps([
            "Continuous pulse oximetry monitoring",
            "Back-to-back albuterol/ipratropium nebulizers",
            "Methylprednisolone 125mg IV",
            "Reassess after initial treatment — if no improvement, consider magnesium sulfate IV",
            "Peak flow measurement if patient can perform",
            "Chest X-ray to rule out pneumonia or pneumothorax"
        ]),
        "critical_flags": json.dumps(["SpO2 91% - Below Threshold"]),
        "estimated_wait_minutes": 20,
        "brief_summary": "34-year-old female with moderate-severe asthma exacerbation poorly responsive to home therapy, needs aggressive bronchodilator treatment.",
        "status": "Waiting",
        "minutes_ago": 40,
    },
    {
        "name": "Michael Brown",
        "age": 58,
        "gender": "Male",
        "chief_complaint": "High fever for 3 days, productive cough with greenish sputum, feeling very weak and short of breath",
        "pain_level": 4,
        "heart_rate": 98,
        "blood_pressure_systolic": 115,
        "blood_pressure_diastolic": 72,
        "temperature": 103.2,
        "respiratory_rate": 22,
        "spo2": 93.0,
        "arrival_mode": "Walk-in",
        "allergies": "None",
        "medical_history": "Type 2 Diabetes, COPD, former smoker (30 pack-years)",
        "current_medications": "Metformin, Glipizide, Tiotropium inhaler",
        "esi_level": 3,
        "triage_status": "Assessed",
        "ai_confidence": 0.89,
        "ai_reasoning": json.dumps([
            "High fever (103.2°F) for 3 days with productive cough suggestive of community-acquired pneumonia",
            "SpO2 93% with underlying COPD — at risk for rapid respiratory decompensation",
            "Diabetic patient with infection at higher risk for sepsis and poor glycemic control",
            "30 pack-year smoking history with COPD significantly increases pneumonia severity"
        ]),
        "recommended_actions": json.dumps([
            "Chest X-ray (PA and lateral)",
            "CBC, BMP, Procalcitonin, Blood cultures x2, Sputum culture",
            "Supplemental oxygen to maintain SpO2 > 94%",
            "IV antibiotics per CAP protocol (Ceftriaxone + Azithromycin)",
            "Blood glucose check, insulin coverage if hyperglycemic",
            "IV fluids for hydration"
        ]),
        "critical_flags": json.dumps(["Fever 103.2°F", "SpO2 93% with COPD baseline"]),
        "estimated_wait_minutes": 25,
        "brief_summary": "58-year-old diabetic male with COPD presenting with likely pneumonia, at risk for respiratory failure and sepsis.",
        "status": "Waiting",
        "minutes_ago": 50,
    },
    {
        "name": "Lisa Nguyen",
        "age": 41,
        "gender": "Female",
        "chief_complaint": "Severe migraine with visual aura, worst headache of life, started suddenly 2 hours ago",
        "pain_level": 9,
        "heart_rate": 76,
        "blood_pressure_systolic": 155,
        "blood_pressure_diastolic": 92,
        "temperature": 98.6,
        "respiratory_rate": 16,
        "spo2": 99.0,
        "arrival_mode": "Walk-in",
        "allergies": "Morphine (causes itching)",
        "medical_history": "Chronic migraines, Anxiety disorder",
        "current_medications": "Sumatriptan PRN, Sertraline",
        "esi_level": 3,
        "triage_status": "Assessed",
        "ai_confidence": 0.85,
        "ai_reasoning": json.dumps([
            "'Worst headache of life' with sudden onset is a red flag requiring SAH (subarachnoid hemorrhage) workup",
            "Despite history of migraines, thunderclap headache pattern differs from typical presentation",
            "Hypertension (155/92) may be reactive or contributory — needs evaluation",
            "Visual aura present but need to differentiate from neurological emergency signs"
        ]),
        "recommended_actions": json.dumps([
            "CT Head without contrast STAT (rule out subarachnoid hemorrhage)",
            "If CT negative, lumbar puncture for xanthochromia",
            "Complete neurological exam",
            "IV access, antiemetics (Ondansetron)",
            "Pain management (Ketorolac IV — avoid opioids per allergy)",
            "Neurology consult if SAH workup positive"
        ]),
        "critical_flags": json.dumps(["'Worst Headache of Life' — SAH Workup Required"]),
        "estimated_wait_minutes": 25,
        "brief_summary": "41-year-old with thunderclap headache requiring emergent SAH workup despite migraine history.",
        "status": "Waiting",
        "minutes_ago": 25,
    },
    {
        "name": "Carlos Rodriguez",
        "age": 62,
        "gender": "Male",
        "chief_complaint": "Blood in urine for 2 days, lower back pain on left side, difficulty urinating",
        "pain_level": 6,
        "heart_rate": 82,
        "blood_pressure_systolic": 142,
        "blood_pressure_diastolic": 88,
        "temperature": 99.4,
        "respiratory_rate": 16,
        "spo2": 98.0,
        "arrival_mode": "Walk-in",
        "allergies": "None",
        "medical_history": "BPH (benign prostatic hyperplasia), Kidney stones x2 in past",
        "current_medications": "Tamsulosin",
        "esi_level": 3,
        "triage_status": "Assessed",
        "ai_confidence": 0.84,
        "ai_reasoning": json.dumps([
            "Hematuria with flank pain in a patient with history of kidney stones — likely renal colic",
            "Low-grade fever (99.4°F) raises concern for UTI or infected stone (pyonephrosis)",
            "BPH with difficulty urinating needs evaluation for urinary retention",
            "Multiple resources needed: UA, CBC, BMP, CT KUB, urology consult"
        ]),
        "recommended_actions": json.dumps([
            "Urinalysis with culture",
            "CBC, BMP, Creatinine",
            "CT Abdomen/Pelvis without contrast (stone protocol)",
            "Pain management (Ketorolac IV or Morphine)",
            "IV fluids for hydration",
            "Bladder scan for post-void residual"
        ]),
        "critical_flags": json.dumps([]),
        "estimated_wait_minutes": 35,
        "brief_summary": "62-year-old male with hematuria and flank pain, history of kidney stones, needs imaging and urology evaluation.",
        "status": "Waiting",
        "minutes_ago": 60,
    },
    # ── ESI Level 4 - Less Urgent ──────────────────────
    {
        "name": "Emily Watson",
        "age": 22,
        "gender": "Female",
        "chief_complaint": "Twisted right ankle while playing soccer 3 hours ago, swelling and bruising, can bear some weight",
        "pain_level": 5,
        "heart_rate": 78,
        "blood_pressure_systolic": 118,
        "blood_pressure_diastolic": 72,
        "temperature": 98.4,
        "respiratory_rate": 16,
        "spo2": 99.0,
        "arrival_mode": "Walk-in",
        "allergies": "None",
        "medical_history": "None",
        "current_medications": "Birth control pills",
        "esi_level": 4,
        "triage_status": "Assessed",
        "ai_confidence": 0.92,
        "ai_reasoning": json.dumps([
            "Mechanism consistent with ankle sprain/possible fracture from sports injury",
            "Can bear some weight — Ottawa Ankle Rules may rule out fracture, but swelling warrants X-ray",
            "All vital signs within normal limits, hemodynamically stable",
            "Single resource needed: ankle X-ray"
        ]),
        "recommended_actions": json.dumps([
            "Right ankle X-ray (AP, lateral, mortise views)",
            "RICE protocol (Rest, Ice, Compression, Elevation)",
            "Ibuprofen 600mg PO for pain",
            "Ace wrap or ankle brace",
            "Orthopedic follow-up if fracture identified"
        ]),
        "critical_flags": json.dumps([]),
        "estimated_wait_minutes": 60,
        "brief_summary": "22-year-old with sports-related ankle injury, stable vitals, needs X-ray to rule out fracture.",
        "status": "Waiting",
        "minutes_ago": 70,
    },
    {
        "name": "Thomas Lee",
        "age": 35,
        "gender": "Male",
        "chief_complaint": "Laceration on left forearm from kitchen knife, about 3cm long, bleeding controlled with pressure",
        "pain_level": 4,
        "heart_rate": 80,
        "blood_pressure_systolic": 125,
        "blood_pressure_diastolic": 78,
        "temperature": 98.6,
        "respiratory_rate": 14,
        "spo2": 99.0,
        "arrival_mode": "Walk-in",
        "allergies": "None",
        "medical_history": "None",
        "current_medications": "None",
        "esi_level": 4,
        "triage_status": "Assessed",
        "ai_confidence": 0.94,
        "ai_reasoning": json.dumps([
            "Simple laceration with controlled bleeding — low acuity",
            "All vital signs within normal limits",
            "No tendon or neurovascular involvement reported",
            "Single resource needed: wound repair (sutures or staples)"
        ]),
        "recommended_actions": json.dumps([
            "Wound irrigation with saline",
            "Laceration repair with sutures (likely 4-0 nylon)",
            "Tetanus booster if not up to date",
            "Wound care instructions and follow-up in 7-10 days for suture removal"
        ]),
        "critical_flags": json.dumps([]),
        "estimated_wait_minutes": 60,
        "brief_summary": "35-year-old male with simple forearm laceration requiring wound repair, stable condition.",
        "status": "Waiting",
        "minutes_ago": 80,
    },
    {
        "name": "Jennifer Martinez",
        "age": 29,
        "gender": "Female",
        "chief_complaint": "Painful urination, frequency, urgency for past 2 days, lower abdominal discomfort",
        "pain_level": 4,
        "heart_rate": 76,
        "blood_pressure_systolic": 115,
        "blood_pressure_diastolic": 70,
        "temperature": 99.0,
        "respiratory_rate": 16,
        "spo2": 99.0,
        "arrival_mode": "Walk-in",
        "allergies": "Amoxicillin",
        "medical_history": "Recurrent UTIs (3 in past year)",
        "current_medications": "None currently",
        "esi_level": 4,
        "triage_status": "Assessed",
        "ai_confidence": 0.93,
        "ai_reasoning": json.dumps([
            "Classic UTI symptoms: dysuria, frequency, urgency — common uncomplicated presentation",
            "Low-grade temperature (99.0°F) consistent with lower urinary tract infection",
            "Vitals entirely normal, no signs of systemic infection",
            "Single resource needed: urinalysis with culture"
        ]),
        "recommended_actions": json.dumps([
            "Urinalysis with culture and sensitivity",
            "Empiric antibiotics (Nitrofurantoin — patient has amoxicillin allergy)",
            "Increase oral fluid intake",
            "Follow-up with PCP if symptoms persist beyond 48 hours"
        ]),
        "critical_flags": json.dumps([]),
        "estimated_wait_minutes": 60,
        "brief_summary": "29-year-old female with typical UTI symptoms, stable, needs urinalysis and antibiotics.",
        "status": "Waiting",
        "minutes_ago": 90,
    },
    # ── ESI Level 5 - Non-Urgent ───────────────────────
    {
        "name": "Kevin O'Brien",
        "age": 31,
        "gender": "Male",
        "chief_complaint": "Runny nose, sore throat, mild cough for 4 days, no fever, just wants to feel better",
        "pain_level": 2,
        "heart_rate": 72,
        "blood_pressure_systolic": 120,
        "blood_pressure_diastolic": 76,
        "temperature": 98.4,
        "respiratory_rate": 14,
        "spo2": 99.0,
        "arrival_mode": "Walk-in",
        "allergies": "None",
        "medical_history": "None",
        "current_medications": "OTC Dayquil",
        "esi_level": 5,
        "triage_status": "Assessed",
        "ai_confidence": 0.96,
        "ai_reasoning": json.dumps([
            "Classic viral upper respiratory infection symptoms — self-limiting condition",
            "No fever, all vitals perfectly normal",
            "No resources needed beyond examination and symptomatic treatment",
            "No red flags: no high fever, no dyspnea, no immunocompromise"
        ]),
        "recommended_actions": json.dumps([
            "Supportive care: rest, fluids, OTC symptom management",
            "Continue OTC decongestant/cough suppressant",
            "Return precautions if symptoms worsen, fever develops, or difficulty breathing"
        ]),
        "critical_flags": json.dumps([]),
        "estimated_wait_minutes": 120,
        "brief_summary": "31-year-old with common cold symptoms, no resources needed, supportive care only.",
        "status": "Waiting",
        "minutes_ago": 100,
    },
    {
        "name": "Patricia Adams",
        "age": 55,
        "gender": "Female",
        "chief_complaint": "Needs blood pressure medication refill, ran out 2 days ago, no acute symptoms",
        "pain_level": 0,
        "heart_rate": 80,
        "blood_pressure_systolic": 148,
        "blood_pressure_diastolic": 92,
        "temperature": 98.6,
        "respiratory_rate": 16,
        "spo2": 99.0,
        "arrival_mode": "Walk-in",
        "allergies": "ACE inhibitors (cough)",
        "medical_history": "Hypertension for 10 years",
        "current_medications": "Losartan 50mg daily (ran out)",
        "esi_level": 5,
        "triage_status": "Assessed",
        "ai_confidence": 0.90,
        "ai_reasoning": json.dumps([
            "Prescription refill request — no acute medical emergency",
            "BP elevated (148/92) likely due to 2 days without medication, not acutely dangerous",
            "No symptoms of hypertensive emergency (no headache, vision changes, chest pain)",
            "No resources needed beyond exam and prescription renewal"
        ]),
        "recommended_actions": json.dumps([
            "Renew Losartan prescription",
            "Counsel on importance of medication adherence",
            "Recommend establishing regular PCP follow-up",
            "Return if severe headache, vision changes, or chest pain develop"
        ]),
        "critical_flags": json.dumps([]),
        "estimated_wait_minutes": 120,
        "brief_summary": "55-year-old with hypertension needing medication refill, no acute emergency.",
        "status": "Waiting",
        "minutes_ago": 110,
    },
    {
        "name": "Ryan Mitchell",
        "age": 19,
        "gender": "Male",
        "chief_complaint": "Small cut on finger from paper, minimal bleeding, wants to make sure it doesn't need stitches",
        "pain_level": 1,
        "heart_rate": 68,
        "blood_pressure_systolic": 116,
        "blood_pressure_diastolic": 72,
        "temperature": 98.4,
        "respiratory_rate": 14,
        "spo2": 100.0,
        "arrival_mode": "Walk-in",
        "allergies": "None",
        "medical_history": "None",
        "current_medications": "None",
        "esi_level": 5,
        "triage_status": "Assessed",
        "ai_confidence": 0.98,
        "ai_reasoning": json.dumps([
            "Minor superficial paper cut — does not require sutures",
            "All vital signs perfectly normal for age",
            "Minimal bleeding already controlled",
            "No resources needed, simple dressing application"
        ]),
        "recommended_actions": json.dumps([
            "Clean wound with soap and water",
            "Apply antibiotic ointment and adhesive bandage",
            "No sutures needed for superficial paper cut",
            "Return if signs of infection (redness, swelling, warmth, drainage)"
        ]),
        "critical_flags": json.dumps([]),
        "estimated_wait_minutes": 120,
        "brief_summary": "19-year-old with minor paper cut, no medical intervention needed.",
        "status": "Waiting",
        "minutes_ago": 115,
    },
]


async def seed_database():
    """Insert demo patients into the database."""
    await create_tables()

    async with async_session() as session:
        # Check if data already exists
        from sqlalchemy import select, func
        result = await session.execute(select(func.count(Patient.id)))
        count = result.scalar()

        if count > 0:
            print(f"⚠️  Database already has {count} patients. Clearing and re-seeding...")
            from sqlalchemy import delete
            await session.execute(delete(Patient))
            await session.commit()

        print("🌱 Seeding demo patients...")

        for i, patient_data in enumerate(DEMO_PATIENTS):
            # Calculate created_at based on minutes_ago
            minutes_ago = patient_data.pop("minutes_ago", 0)
            created_at = (datetime.now(timezone.utc) - timedelta(minutes=minutes_ago)).isoformat()

            triage_completed_at = None
            if patient_data.get("triage_status") == "Assessed":
                triage_completed_at = (
                    datetime.now(timezone.utc) - timedelta(minutes=max(0, minutes_ago - 3))
                ).isoformat()

            patient = Patient(
                name=patient_data["name"],
                age=patient_data["age"],
                gender=patient_data["gender"],
                chief_complaint=patient_data["chief_complaint"],
                pain_level=patient_data["pain_level"],
                heart_rate=patient_data["heart_rate"],
                blood_pressure_systolic=patient_data["blood_pressure_systolic"],
                blood_pressure_diastolic=patient_data["blood_pressure_diastolic"],
                temperature=patient_data["temperature"],
                respiratory_rate=patient_data["respiratory_rate"],
                spo2=patient_data["spo2"],
                arrival_mode=patient_data.get("arrival_mode", "Walk-in"),
                allergies=patient_data.get("allergies", ""),
                medical_history=patient_data.get("medical_history", ""),
                current_medications=patient_data.get("current_medications", ""),
                esi_level=patient_data.get("esi_level"),
                triage_status=patient_data.get("triage_status", "Pending"),
                ai_confidence=patient_data.get("ai_confidence"),
                ai_reasoning=patient_data.get("ai_reasoning"),
                recommended_actions=patient_data.get("recommended_actions"),
                critical_flags=patient_data.get("critical_flags"),
                estimated_wait_minutes=patient_data.get("estimated_wait_minutes"),
                brief_summary=patient_data.get("brief_summary"),
                status=patient_data.get("status", "Waiting"),
                created_at=created_at,
                triage_completed_at=triage_completed_at,
            )

            session.add(patient)
            print(f"  ✅ Added: {patient_data['name']} (ESI {patient_data.get('esi_level', '?')}) — {patient_data['chief_complaint'][:50]}...")

        await session.commit()
        print(f"\n🎉 Successfully seeded {len(DEMO_PATIENTS)} demo patients!")
        print("   Distribution: ESI-1: 1, ESI-2: 3, ESI-3: 5, ESI-4: 3, ESI-5: 3")


if __name__ == "__main__":
    asyncio.run(seed_database())
