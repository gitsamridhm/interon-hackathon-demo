import { useState } from 'react';
import { createPatient, runTriage } from '../services/api';
import { GENDERS, ARRIVAL_MODES, ESI_LEVELS } from '../utils/constants';
import TriageAssessment from './TriageAssessment';

export default function PatientIntakeForm({ onPatientCreated, onTriageComplete, addToast }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    chief_complaint: '',
    pain_level: 5,
    heart_rate: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    temperature: '',
    respiratory_rate: '',
    spo2: '',
    arrival_mode: 'Walk-in',
    allergies: '',
    medical_history: '',
    current_medications: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [triaging, setTriaging] = useState(false);
  const [createdPatient, setCreatedPatient] = useState(null);
  const [triageResult, setTriageResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age),
        pain_level: parseInt(formData.pain_level),
        heart_rate: parseInt(formData.heart_rate),
        blood_pressure_systolic: parseInt(formData.blood_pressure_systolic),
        blood_pressure_diastolic: parseInt(formData.blood_pressure_diastolic),
        temperature: parseFloat(formData.temperature),
        respiratory_rate: parseInt(formData.respiratory_rate),
        spo2: parseFloat(formData.spo2),
      };

      const patient = await createPatient(payload);
      setCreatedPatient(patient);
      addToast(`Patient "${patient.name}" registered. Running AI triage...`, 'info');

      // Automatically run triage
      setTriaging(true);
      const result = await runTriage(patient.id);
      setTriageResult(result);
      setTriaging(false);

      // Update parent with triage result
      onTriageComplete({ ...patient, esi_level: result.esi_level });

    } catch (error) {
      console.error('Error:', error);
      addToast(error.response?.data?.detail || 'Failed to register patient', 'error');
      setTriaging(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '', age: '', gender: 'Male', chief_complaint: '', pain_level: 5,
      heart_rate: '', blood_pressure_systolic: '', blood_pressure_diastolic: '',
      temperature: '', respiratory_rate: '', spo2: '',
      arrival_mode: 'Walk-in', allergies: '', medical_history: '', current_medications: '',
    });
    setCreatedPatient(null);
    setTriageResult(null);
  };

  const handleAccept = () => {
    onPatientCreated(createdPatient);
    handleReset();
  };

  // If we have a triage result, show it
  if (triageResult && createdPatient) {
    return (
      <div>
        <div className="section-header">
          <div>
            <h1 className="section-title">AI Triage Assessment</h1>
            <p className="section-subtitle">Review the AI recommendation for {createdPatient.name}</p>
          </div>
          <button className="btn btn-secondary" onClick={handleReset}>
            ← New Patient
          </button>
        </div>
        <TriageAssessment
          patient={createdPatient}
          triageResult={triageResult}
          onAccept={handleAccept}
          addToast={addToast}
        />
      </div>
    );
  }

  // Show AI processing state
  if (triaging) {
    return (
      <div className="loading-container" style={{ minHeight: '400px' }}>
        <div className="loading-spinner" style={{ width: '60px', height: '60px', borderWidth: '4px' }}></div>
        <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
          🧠 AI Analyzing Patient...
        </div>
        <div className="loading-text" style={{ maxWidth: '400px', textAlign: 'center' }}>
          Gemini AI is evaluating vital signs, symptoms, medical history,
          and clinical indicators to determine ESI triage level...
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          {['Vitals', 'Symptoms', 'History', 'Risk Factors', 'ESI Level'].map((step, i) => (
            <span key={step} className={`esi-badge esi-badge-${i + 1}`} style={{
              animation: `fadeIn 0.3s ease ${i * 0.4}s both`,
            }}>
              {step}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Get pain level color
  const getPainColor = (level) => {
    if (level <= 3) return 'var(--esi-4)';
    if (level <= 6) return 'var(--esi-3)';
    if (level <= 8) return 'var(--esi-2)';
    return 'var(--esi-1)';
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="section-title">Patient Intake</h1>
          <p className="section-subtitle">Register a new patient for AI-powered triage assessment</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Patient Information */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="form-section">
            <div className="form-section-title">👤 Patient Information</div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  className="form-input"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter patient's full name"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Age *</label>
                <input
                  className="form-input"
                  name="age"
                  type="number"
                  min="0"
                  max="150"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Age"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Gender *</label>
                <select className="form-select" name="gender" value={formData.gender} onChange={handleChange}>
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Arrival Mode</label>
                <select className="form-select" name="arrival_mode" value={formData.arrival_mode} onChange={handleChange}>
                  {ARRIVAL_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group full-width">
                <label className="form-label">Chief Complaint *</label>
                <textarea
                  className="form-textarea"
                  name="chief_complaint"
                  value={formData.chief_complaint}
                  onChange={handleChange}
                  placeholder="Describe the primary reason for the ER visit..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Pain Level */}
          <div className="form-section">
            <div className="form-section-title">💊 Pain Assessment</div>
            <div className="pain-slider-container">
              <div className="pain-value" style={{ color: getPainColor(formData.pain_level) }}>
                {formData.pain_level}/10
              </div>
              <input
                type="range"
                className="pain-slider"
                name="pain_level"
                min="0"
                max="10"
                value={formData.pain_level}
                onChange={handleChange}
                style={{
                  background: `linear-gradient(to right, var(--esi-4) 0%, var(--esi-3) 30%, var(--esi-2) 60%, var(--esi-1) 100%)`,
                }}
              />
              <div className="pain-slider-labels">
                <span>No Pain</span>
                <span>Mild</span>
                <span>Moderate</span>
                <span>Severe</span>
                <span>Worst</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vital Signs */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="form-section">
            <div className="form-section-title">❤️ Vital Signs</div>
            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
              <div className="form-group">
                <label className="form-label">Heart Rate (bpm) *</label>
                <input
                  className="form-input"
                  name="heart_rate"
                  type="number"
                  min="0"
                  max="300"
                  value={formData.heart_rate}
                  onChange={handleChange}
                  placeholder="60-100 normal"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">BP Systolic (mmHg) *</label>
                <input
                  className="form-input"
                  name="blood_pressure_systolic"
                  type="number"
                  min="0"
                  max="300"
                  value={formData.blood_pressure_systolic}
                  onChange={handleChange}
                  placeholder="90-120 normal"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">BP Diastolic (mmHg) *</label>
                <input
                  className="form-input"
                  name="blood_pressure_diastolic"
                  type="number"
                  min="0"
                  max="200"
                  value={formData.blood_pressure_diastolic}
                  onChange={handleChange}
                  placeholder="60-80 normal"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Temperature (°F) *</label>
                <input
                  className="form-input"
                  name="temperature"
                  type="number"
                  step="0.1"
                  min="85"
                  max="115"
                  value={formData.temperature}
                  onChange={handleChange}
                  placeholder="97.8-99.1 normal"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Respiratory Rate (/min) *</label>
                <input
                  className="form-input"
                  name="respiratory_rate"
                  type="number"
                  min="0"
                  max="80"
                  value={formData.respiratory_rate}
                  onChange={handleChange}
                  placeholder="12-20 normal"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">SpO2 (%) *</label>
                <input
                  className="form-input"
                  name="spo2"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.spo2}
                  onChange={handleChange}
                  placeholder="95-100 normal"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Medical History */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="form-section">
            <div className="form-section-title">📋 Medical History</div>
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label">Allergies</label>
                <input
                  className="form-input"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  placeholder="List any known allergies..."
                />
              </div>
              <div className="form-group full-width">
                <label className="form-label">Medical History</label>
                <textarea
                  className="form-textarea"
                  name="medical_history"
                  value={formData.medical_history}
                  onChange={handleChange}
                  placeholder="Previous conditions, surgeries, relevant history..."
                />
              </div>
              <div className="form-group full-width">
                <label className="form-label">Current Medications</label>
                <textarea
                  className="form-textarea"
                  name="current_medications"
                  value={formData.current_medications}
                  onChange={handleChange}
                  placeholder="List current medications and dosages..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary btn-lg" onClick={handleReset}>
            Clear Form
          </button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
            {submitting ? '⏳ Processing...' : '🧠 Submit for AI Triage'}
          </button>
        </div>
      </form>
    </div>
  );
}
