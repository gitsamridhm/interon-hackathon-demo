import { ESI_LEVELS } from '../utils/constants';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
} from 'recharts';

export default function AnalyticsPanel({ analytics, loading }) {
  if (loading || !analytics) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading analytics...</div>
      </div>
    );
  }

  // Prepare chart data
  const esiData = [1, 2, 3, 4, 5].map(level => ({
    name: `ESI ${level}`,
    label: ESI_LEVELS[level].label,
    count: analytics.patients_by_esi[String(level)] || 0,
    color: ESI_LEVELS[level].color,
  }));

  const statusData = Object.entries(analytics.patients_by_status).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  const STATUS_CHART_COLORS = ['#ffd600', '#448aff', '#00e676', '#ab47bc'];

  const waitTimeData = Object.entries(analytics.current_wait_times).map(([level, mins]) => ({
    name: `ESI ${level}`,
    label: ESI_LEVELS[parseInt(level)]?.label || `Level ${level}`,
    minutes: mins,
    color: ESI_LEVELS[parseInt(level)]?.color || '#888',
  }));

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="section-title">Analytics Dashboard</h1>
          <p className="section-subtitle">Real-time ER performance metrics</p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="stat-cards">
        <div className="stat-card" style={{ '--stat-color': 'var(--accent-primary)' }}>
          <div className="stat-card-label">Total Patients</div>
          <div className="stat-card-value">{analytics.total_patients}</div>
          <div className="stat-card-sub">All registered patients</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--esi-4)' }}>
          <div className="stat-card-label">AI Acceptance Rate</div>
          <div className="stat-card-value">{Math.round(analytics.ai_acceptance_rate * 100)}%</div>
          <div className="stat-card-sub">Nurse agreement with AI</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--esi-2)' }}>
          <div className="stat-card-label">Critical Patients</div>
          <div className="stat-card-value">
            {(analytics.patients_by_esi['1'] || 0) + (analytics.patients_by_esi['2'] || 0)}
          </div>
          <div className="stat-card-sub">ESI 1-2 requiring immediate care</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--esi-5)' }}>
          <div className="stat-card-label">Non-Critical</div>
          <div className="stat-card-value">
            {(analytics.patients_by_esi['4'] || 0) + (analytics.patients_by_esi['5'] || 0)}
          </div>
          <div className="stat-card-sub">ESI 4-5 lower priority</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="analytics-grid">
        {/* ESI Distribution Bar Chart */}
        <div className="chart-container">
          <div className="chart-title">📊 Patients by ESI Level</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={esiData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {esiData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Pie Chart */}
        <div className="chart-container">
          <div className="chart-title">🥧 Patients by Status</div>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_CHART_COLORS[index % STATUS_CHART_COLORS.length]}
                      fillOpacity={0.8}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                />
                <Legend
                  wrapperStyle={{ color: 'var(--text-secondary)', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ height: '280px' }}>
              <div className="empty-state-text">No data yet</div>
            </div>
          )}
        </div>

        {/* Wait Times */}
        <div className="chart-container">
          <div className="chart-title">⏱️ Average Wait Times by ESI Level</div>
          {waitTimeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={waitTimeData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={12} unit=" min" />
                <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={12} width={50} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                  formatter={(value) => [`${value} min`, 'Avg Wait']}
                />
                <Bar dataKey="minutes" radius={[0, 6, 6, 0]}>
                  {waitTimeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.7} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ height: '280px' }}>
              <div className="empty-state-text">No wait time data</div>
            </div>
          )}
        </div>

        {/* AI Performance Card */}
        <div className="chart-container">
          <div className="chart-title">🤖 AI Triage Performance</div>
          <div style={{ padding: '20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                border: `4px solid ${analytics.ai_acceptance_rate >= 0.8 ? 'var(--esi-4)' : analytics.ai_acceptance_rate >= 0.6 ? 'var(--esi-3)' : 'var(--esi-2)'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-input)',
              }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {Math.round(analytics.ai_acceptance_rate * 100)}%
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Accuracy
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
                  AI-Nurse Agreement Rate
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Percentage of AI triage assessments that were accepted by nurses without override.
                  Higher rates indicate strong AI alignment with clinical judgment.
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                  Total Assessed
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700 }}>
                  {analytics.total_patients}
                </div>
              </div>
              <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                  AI Model
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-primary)' }}>
                  Gemini 2.0 Flash
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
