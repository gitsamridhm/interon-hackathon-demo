import { useState } from 'react';
import { ESI_LEVELS } from '../utils/constants';
import { overridePatientTriage } from '../services/api';

export default function TriageAssessment({ patient, triageResult, onAccept, addToast }) {
  const [showOverride, setShowOverride] = useState(false);
  const [overrideLevel, setOverrideLevel] = useState(triageResult.esi_level);
  const [overrideReason, setOverrideReason] = useState('');
  const [overriding, setOverriding] = useState(false);

  const esi = ESI_LEVELS[triageResult.esi_level];

  const handleOverride = async () => {
    if (!overrideReason.trim()) {
      addToast('Please provide a reason for the override', 'error');
      return;
    }

    setOverriding(true);
    try {
      await overridePatientTriage(patient.id, parseInt(overrideLevel), overrideReason);
      addToast(`Triage overridden to ESI ${overrideLevel} for ${patient.name}`, 'info');
      onAccept();
    } catch (error) {
      addToast('Failed to override triage', 'error');
    } finally {
      setOverriding(false);
    }
  };

  return (
    <div className="triage-result">
      <div className="card">
        {/* Header with ESI Level */}
        <div className="triage-result-header">
          <div
            className="triage-esi-display"
            style={{
              background: esi.bgColor,
              color: esi.color,
              border: `2px solid ${esi.borderColor}`,
              boxShadow: `0 0 30px ${esi.bgColor}`,
            }}
          >
            {triageResult.esi_level}
            <span className="triage-esi-label">ESI</span>
          </div>
          <div className="triage-summary">
            <h3 style={{ color: esi.color }}>
              {esi.icon} ESI Level {triageResult.esi_level} — {esi.label}
            </h3>
            <p>{triageResult.brief_summary}</p>
            <div className="confidence-bar">
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>AI Confidence:</span>
              <div className="confidence-bar-track">
                <div
                  className="confidence-bar-fill"
                  style={{ width: `${triageResult.confidence * 100}%` }}
                />
              </div>
              <span className="confidence-label">
                {Math.round(triageResult.confidence * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Critical Flags */}
        {triageResult.critical_flags && triageResult.critical_flags.length > 0 &&
          triageResult.critical_flags[0] !== '' && (
          <div className="triage-section">
            <div className="triage-section-title">🚨 Critical Flags</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {triageResult.critical_flags.map((flag, i) => (
                <div key={i} className="critical-flag">{flag}</div>
              ))}
            </div>
          </div>
        )}

        {/* AI Reasoning */}
        <div className="triage-section">
          <div className="triage-section-title">🧠 AI Clinical Reasoning</div>
          <ul className="triage-reasoning-list">
            {triageResult.reasoning.map((reason, i) => (
              <li key={i} className="triage-reasoning-item">
                <span style={{ color: 'var(--accent-primary)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Actions */}
        <div className="triage-section">
          <div className="triage-section-title">✅ Recommended Actions</div>
          <ul className="triage-actions-list">
            {triageResult.recommended_actions.map((action, i) => (
              <li key={i} className="triage-action-item">{action}</li>
            ))}
          </ul>
        </div>

        {/* Wait Time */}
        <div className="triage-section">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            background: esi.bgColor,
            border: `1px solid ${esi.borderColor}`,
            borderRadius: 'var(--radius-md)',
          }}>
            <span style={{ fontSize: '24px' }}>⏱️</span>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                Estimated Wait Time
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: esi.color }}>
                {triageResult.estimated_wait_minutes === 0
                  ? 'IMMEDIATE'
                  : `${triageResult.estimated_wait_minutes} minutes`}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button className="btn btn-success btn-lg" style={{ flex: 1 }} onClick={onAccept}>
            ✅ Accept AI Recommendation
          </button>
          <button
            className="btn btn-danger btn-lg"
            onClick={() => setShowOverride(!showOverride)}
          >
            ✏️ Override
          </button>
        </div>

        {/* Override Panel */}
        {showOverride && (
          <div className="override-panel">
            <h4>🩺 Nurse Override — Adjust ESI Level</h4>
            <div className="override-controls">
              <div className="form-group">
                <label className="form-label">New ESI Level</label>
                <select
                  className="form-select"
                  value={overrideLevel}
                  onChange={e => setOverrideLevel(e.target.value)}
                >
                  {[1, 2, 3, 4, 5].map(l => (
                    <option key={l} value={l}>
                      ESI {l} — {ESI_LEVELS[l].label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ flex: 2 }}>
                <label className="form-label">Reason for Override *</label>
                <input
                  className="form-input"
                  placeholder="Clinical justification for override..."
                  value={overrideReason}
                  onChange={e => setOverrideReason(e.target.value)}
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={handleOverride}
                disabled={overriding}
              >
                {overriding ? 'Saving...' : 'Confirm Override'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
