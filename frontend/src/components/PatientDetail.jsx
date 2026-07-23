import { useState } from 'react';
import { ESI_LEVELS } from '../utils/constants';
import { updatePatientStatus, overridePatientTriage } from '../services/api';

export default function PatientDetail({ patient, onClose, onPatientUpdated, addToast }) {
  const [showOverride, setShowOverride] = useState(false);
  const [overrideLevel, setOverrideLevel] = useState(patient.esi_level || 3);
  const [overrideReason, setOverrideReason] = useState('');

  const esi = patient.esi_level ? ESI_LEVELS[patient.esi_level] : null;

  // Parse JSON fields
  const parseJson = (str) => {
    if (!str) return [];
    try { return JSON.parse(str); } catch { return [str]; }
  };

  const reasoning = parseJson(patient.ai_reasoning);
  const actions = parseJson(patient.recommended_actions);
  const flags = parseJson(patient.critical_flags);

  // Get vital sign status
  const getVitalStatus = (type, value) => {
    switch (type) {
      case 'hr': return value < 50 || value > 130 ? 'vital-critical' : (value < 60 || value > 100 ? 'vital-warning' : 'vital-normal');
      case 'sys': return value < 90 || value > 180 ? 'vital-critical' : (value < 90 || value > 140 ? 'vital-warning' : 'vital-normal');
      case 'dia': return value > 120 ? 'vital-critical' : (value > 90 ? 'vital-warning' : 'vital-normal');
      case 'temp': return value < 95 || value > 104 ? 'vital-critical' : (value < 97.8 || value > 99.1 ? 'vital-warning' : 'vital-normal');
      case 'rr': return value < 10 || value > 30 ? 'vital-critical' : (value < 12 || value > 20 ? 'vital-warning' : 'vital-normal');
      case 'spo2': return value < 92 ? 'vital-critical' : (value < 95 ? 'vital-warning' : 'vital-normal');
      default: return 'vital-normal';
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updatePatientStatus(patient.id, newStatus);
      addToast(`Status updated to "${newStatus}"`, 'success');
      onPatientUpdated();
      onClose();
    } catch (error) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleOverride = async () => {
    if (!overrideReason.trim()) {
      addToast('Please provide a reason for the override', 'error');
      return;
    }
    try {
      await overridePatientTriage(patient.id, parseInt(overrideLevel), overrideReason);
      addToast(`Triage overridden to ESI ${overrideLevel}`, 'info');
      onPatientUpdated();
      onClose();
    } catch (error) {
      addToast('Failed to override', 'error');
    }
  };

  const getWaitTime = (createdAt) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} min`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {esi && (
              <div
                className="patient-card-esi"
                style={{
                  background: esi.bgColor,
                  color: esi.color,
                  border: `2px solid ${esi.borderColor}`,
                  width: '56px',
                  height: '56px',
                  fontSize: '24px',
                  boxShadow: `0 0 20px ${esi.bgColor}`,
                }}
              >
                {patient.esi_level}
              </div>
            )}
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{patient.name}</h2>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {patient.age}yo {patient.gender}
                </span>
                <span className={`status-badge status-${patient.status.toLowerCase().replace(' ', '-')}`}>
                  {patient.status}
                </span>
                {esi && (
                  <span className={`esi-badge esi-badge-${patient.esi_level}`}>
                    ESI {patient.esi_level} — {esi.label}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Chief Complaint */}
        <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', fontWeight: 600 }}>
            Chief Complaint
          </div>
          <div style={{ fontSize: '15px', lineHeight: 1.5 }}>
            {patient.chief_complaint}
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>🕐 Wait: {getWaitTime(patient.created_at)}</span>
            <span>🚑 {patient.arrival_mode}</span>
            <span>💊 Pain: {patient.pain_level}/10</span>
          </div>
        </div>

        {/* Vital Signs */}
        <div style={{ marginBottom: '20px' }}>
          <div className="form-section-title">❤️ Vital Signs</div>
          <div className="vitals-grid">
            <div className="vital-card">
              <div className="vital-card-label">Heart Rate</div>
              <div className={`vital-card-value ${getVitalStatus('hr', patient.heart_rate)}`}>{patient.heart_rate}</div>
              <div className="vital-card-unit">bpm</div>
            </div>
            <div className="vital-card">
              <div className="vital-card-label">Blood Pressure</div>
              <div className={`vital-card-value ${getVitalStatus('sys', patient.blood_pressure_systolic)}`}>
                {patient.blood_pressure_systolic}/{patient.blood_pressure_diastolic}
              </div>
              <div className="vital-card-unit">mmHg</div>
            </div>
            <div className="vital-card">
              <div className="vital-card-label">Temperature</div>
              <div className={`vital-card-value ${getVitalStatus('temp', patient.temperature)}`}>{patient.temperature}</div>
              <div className="vital-card-unit">°F</div>
            </div>
            <div className="vital-card">
              <div className="vital-card-label">Resp. Rate</div>
              <div className={`vital-card-value ${getVitalStatus('rr', patient.respiratory_rate)}`}>{patient.respiratory_rate}</div>
              <div className="vital-card-unit">/min</div>
            </div>
            <div className="vital-card">
              <div className="vital-card-label">SpO2</div>
              <div className={`vital-card-value ${getVitalStatus('spo2', patient.spo2)}`}>{patient.spo2}</div>
              <div className="vital-card-unit">%</div>
            </div>
            <div className="vital-card">
              <div className="vital-card-label">Pain Level</div>
              <div className="vital-card-value" style={{ color: patient.pain_level >= 8 ? 'var(--esi-1)' : patient.pain_level >= 5 ? 'var(--esi-3)' : 'var(--esi-4)' }}>
                {patient.pain_level}/10
              </div>
              <div className="vital-card-unit">scale</div>
            </div>
          </div>
        </div>

        {/* AI Assessment */}
        {reasoning.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div className="form-section-title">🧠 AI Clinical Reasoning</div>
            <ul className="triage-reasoning-list">
              {reasoning.map((r, i) => (
                <li key={i} className="triage-reasoning-item">
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Critical Flags */}
        {flags.length > 0 && flags[0] !== '' && (
          <div style={{ marginBottom: '20px' }}>
            <div className="form-section-title">🚨 Critical Flags</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {flags.map((f, i) => (
                <div key={i} className="critical-flag">{f}</div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div className="form-section-title">✅ Recommended Actions</div>
            <ul className="triage-actions-list">
              {actions.map((a, i) => (
                <li key={i} className="triage-action-item">{a}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Medical Info */}
        {(patient.allergies || patient.medical_history || patient.current_medications) && (
          <div style={{ marginBottom: '20px' }}>
            <div className="form-section-title">📋 Medical Information</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {patient.allergies && (
                <div style={{ padding: '10px', background: 'rgba(255,23,68,0.06)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,23,68,0.15)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--esi-1)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Allergies: </span>
                  <span style={{ fontSize: '13px' }}>{patient.allergies}</span>
                </div>
              )}
              {patient.medical_history && (
                <div style={{ padding: '10px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>History: </span>
                  <span style={{ fontSize: '13px' }}>{patient.medical_history}</span>
                </div>
              )}
              {patient.current_medications && (
                <div style={{ padding: '10px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Medications: </span>
                  <span style={{ fontSize: '13px' }}>{patient.current_medications}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => handleStatusChange('Waiting')}>
            ⏳ Set Waiting
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => handleStatusChange('In Treatment')}>
            💉 Start Treatment
          </button>
          <button className="btn btn-success btn-sm" onClick={() => handleStatusChange('Discharged')}>
            ✅ Discharge
          </button>
          <button className="btn btn-sm" style={{ background: 'rgba(171,71,188,0.15)', color: '#ab47bc', border: '1px solid rgba(171,71,188,0.3)' }}
            onClick={() => handleStatusChange('Admitted')}>
            🏥 Admit
          </button>
          <div style={{ flex: 1 }} />
          <button className="btn btn-danger btn-sm" onClick={() => setShowOverride(!showOverride)}>
            ✏️ Override Triage
          </button>
        </div>

        {/* Override Panel */}
        {showOverride && (
          <div className="override-panel" style={{ marginTop: '16px' }}>
            <h4>🩺 Nurse Override</h4>
            <div className="override-controls">
              <div className="form-group">
                <label className="form-label">ESI Level</label>
                <select className="form-select" value={overrideLevel} onChange={e => setOverrideLevel(e.target.value)}>
                  {[1, 2, 3, 4, 5].map(l => (
                    <option key={l} value={l}>ESI {l} — {ESI_LEVELS[l].label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ flex: 2 }}>
                <label className="form-label">Reason *</label>
                <input className="form-input" placeholder="Override reason..." value={overrideReason} onChange={e => setOverrideReason(e.target.value)} />
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleOverride}>Confirm</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
