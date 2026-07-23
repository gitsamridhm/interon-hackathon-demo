import { ESI_LEVELS } from '../utils/constants';

export default function Dashboard({ patients, analytics, loading, onSelectPatient, onNavigate }) {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading TriageAI Dashboard...</div>
      </div>
    );
  }

  const waitingPatients = patients.filter(p => p.status === 'Waiting');
  const treatingPatients = patients.filter(p => p.status === 'In Treatment');
  const criticalPatients = patients.filter(p => p.esi_level && p.esi_level <= 2);

  // Get time since arrival
  const getWaitTime = (createdAt) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="section-title">ER Command Center</h1>
          <p className="section-subtitle">Real-time patient overview & triage status</p>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate('intake')}>
          ➕ New Patient
        </button>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards">
        <div className="stat-card" style={{ '--stat-color': 'var(--accent-primary)' }}>
          <div className="stat-card-label">Total Patients</div>
          <div className="stat-card-value">{analytics?.total_patients || 0}</div>
          <div className="stat-card-sub">Currently in system</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--status-waiting)' }}>
          <div className="stat-card-label">Waiting</div>
          <div className="stat-card-value">{waitingPatients.length}</div>
          <div className="stat-card-sub">In triage queue</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--status-treatment)' }}>
          <div className="stat-card-label">In Treatment</div>
          <div className="stat-card-value">{treatingPatients.length}</div>
          <div className="stat-card-sub">Being treated</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--esi-1)' }}>
          <div className="stat-card-label">Critical (ESI 1-2)</div>
          <div className="stat-card-value">{criticalPatients.length}</div>
          <div className="stat-card-sub">High priority</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--esi-4)' }}>
          <div className="stat-card-label">AI Acceptance</div>
          <div className="stat-card-value">
            {analytics?.ai_acceptance_rate ? `${Math.round(analytics.ai_acceptance_rate * 100)}%` : '—'}
          </div>
          <div className="stat-card-sub">Nurse agreement rate</div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Critical Patients */}
        <div className="card">
          <div className="card-title">🚨 Critical Patients (ESI 1-2)</div>
          {criticalPatients.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              <div className="empty-state-icon">✅</div>
              <div className="empty-state-text">No critical patients</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {criticalPatients.map(patient => (
                <div
                  key={patient.id}
                  className="patient-card"
                  style={{ gridTemplateColumns: 'auto 1fr auto' }}
                  onClick={() => onSelectPatient(patient)}
                >
                  <div
                    className="patient-card-esi"
                    style={{
                      background: ESI_LEVELS[patient.esi_level]?.bgColor,
                      color: ESI_LEVELS[patient.esi_level]?.color,
                      border: `1px solid ${ESI_LEVELS[patient.esi_level]?.borderColor}`,
                    }}
                  >
                    {patient.esi_level}
                  </div>
                  <div className="patient-card-info">
                    <div className="patient-card-name">{patient.name}</div>
                    <div className="patient-card-complaint">{patient.chief_complaint}</div>
                    <div className="patient-card-meta">
                      <span>Age: {patient.age}</span>
                      <span>•</span>
                      <span>{patient.arrival_mode}</span>
                    </div>
                  </div>
                  <div className="patient-card-wait">
                    <div className="patient-card-wait-time" style={{ color: ESI_LEVELS[patient.esi_level]?.color }}>
                      {getWaitTime(patient.created_at)}
                    </div>
                    <div className="patient-card-wait-label">wait time</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-title">📋 Recent Patients</div>
          {patients.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              <div className="empty-state-icon">🏥</div>
              <div className="empty-state-text">No patients registered yet</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {patients.slice(0, 8).map(patient => (
                <div
                  key={patient.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                  onClick={() => onSelectPatient(patient)}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-input)'}
                >
                  {patient.esi_level && (
                    <span className={`esi-badge esi-badge-${patient.esi_level}`}>
                      ESI {patient.esi_level}
                    </span>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{patient.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {patient.chief_complaint}
                    </div>
                  </div>
                  <span className={`status-badge status-${patient.status.toLowerCase().replace(' ', '-')}`}>
                    {patient.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ESI Distribution */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-title">📊 Patient Distribution by ESI Level</div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          {[1, 2, 3, 4, 5].map(level => {
            const count = patients.filter(p => p.esi_level === level).length;
            const total = patients.filter(p => p.esi_level).length || 1;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={level} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  height: '120px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  marginBottom: '8px',
                }}>
                  <div style={{
                    width: '100%',
                    maxWidth: '60px',
                    height: `${Math.max(8, pct)}%`,
                    background: `linear-gradient(to top, ${ESI_LEVELS[level].color}40, ${ESI_LEVELS[level].color}20)`,
                    border: `1px solid ${ESI_LEVELS[level].borderColor}`,
                    borderRadius: '6px 6px 0 0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    paddingTop: '4px',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: ESI_LEVELS[level].color,
                    transition: 'height 0.5s ease',
                  }}>
                    {count}
                  </div>
                </div>
                <span className={`esi-badge esi-badge-${level}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                  ESI {level}
                </span>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {ESI_LEVELS[level].label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
