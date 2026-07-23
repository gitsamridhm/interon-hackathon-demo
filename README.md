# TriageAI 🏥🧠

## AI-Powered Emergency Room Smart Triage System

**TriageAI** is an AI-powered triage decision support tool that helps Emergency Room nurses assess incoming patients, assign acuity levels using the real-world ESI (Emergency Severity Index) 5-level system, recommend priority ordering, and track patient flow in real-time.

Built for the **Interon GenAI Hackathon 2026** — Theme: *AI for Healthcare Innovation*.

---

## 🎯 Problem Statement

Emergency departments across the US handle **130+ million visits per year**. Triage nurses must rapidly assess patients under extreme pressure, leading to:
- **20-30% mis-triage rates** in high-volume settings
- Inconsistent patient prioritization
- Increased wait times for critical patients
- Nurse burnout and cognitive overload

## 💡 Our Solution

TriageAI uses **Google Gemini AI** to provide:
- **Intelligent Triage Assessments** — AI analyzes vital signs, symptoms, medical history, and clinical indicators
- **Explainable Reasoning** — Every recommendation comes with step-by-step clinical justification
- **Human-in-the-Loop** — Nurses always maintain final decision authority with override capability
- **Real-Time Priority Queue** — Patients automatically sorted by severity
- **Analytics Dashboard** — Track ER performance, AI accuracy, and patient flow

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 (via Vite) |
| **Backend** | Python FastAPI |
| **AI Engine** | Google Gemini 2.0 Flash API |
| **Database** | SQLite (async via SQLAlchemy + aiosqlite) |
| **Deployment** | AWS EC2 |
| **Version Control** | GitHub |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Google Gemini API Key ([Get one free](https://aistudio.google.com/apikey))

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Seed demo data
python seed_data.py

# Start the server
uvicorn app.main:app --reload --port 8000
```

Backend will be running at `http://localhost:8000`  
API docs available at `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be running at `http://localhost:3000`

---

## 📁 Project Structure

```
TriageAI/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── models.py            # Pydantic schemas
│   │   ├── database.py          # SQLAlchemy + SQLite
│   │   ├── routers/
│   │   │   ├── patients.py      # Patient CRUD API
│   │   │   ├── triage.py        # AI triage API
│   │   │   └── analytics.py     # Dashboard analytics API
│   │   └── services/
│   │       └── ai_engine.py     # Gemini AI integration
│   ├── seed_data.py             # Demo data seeder
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── PatientIntakeForm.jsx
│   │   │   ├── TriageAssessment.jsx
│   │   │   ├── PriorityQueue.jsx
│   │   │   ├── AnalyticsPanel.jsx
│   │   │   ├── PatientDetail.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Toast.jsx
│   │   ├── services/
│   │   │   └── api.js           # Axios API service
│   │   ├── utils/
│   │   │   └── constants.js     # ESI levels & config
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 🧠 AI Architecture

### Triage Flow
1. Nurse enters patient data (demographics, vitals, symptoms, history)
2. Gemini AI analyzes the data using clinical triage protocols
3. AI returns structured assessment:
   - **ESI Level** (1-5) with confidence score
   - **Clinical reasoning** (step-by-step explanation)
   - **Recommended actions** (specific medical interventions)
   - **Critical flags** (abnormal vital signs, red-flag symptoms)
   - **Estimated wait time**
4. Nurse reviews, accepts, or overrides the recommendation
5. Patient is placed in the priority queue

### ESI (Emergency Severity Index) System
| Level | Name | Description | Wait Time |
|-------|------|-------------|-----------|
| ESI 1 | Resuscitation | Immediate life-threatening | 0 min |
| ESI 2 | Emergent | High risk of deterioration | ≤10 min |
| ESI 3 | Urgent | Stable, needs multiple resources | ≤30 min |
| ESI 4 | Less Urgent | Needs one resource | ≤60 min |
| ESI 5 | Non-Urgent | No resources needed | ≤120 min |

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/patients` | List all patients (sorted by severity) |
| `POST` | `/api/patients` | Register new patient |
| `GET` | `/api/patients/{id}` | Get patient details |
| `PATCH` | `/api/patients/{id}/status` | Update patient status |
| `PATCH` | `/api/patients/{id}/override` | Nurse override triage |
| `POST` | `/api/triage/{id}` | Run AI triage assessment |
| `GET` | `/api/analytics` | Get dashboard analytics |

---

## 👥 Team

Built by Team Sammy's Squad for the Interon GenAI Hackathon 2026.

---

## 📄 License

This project was built for the Interon GenAI Hackathon 2026.
