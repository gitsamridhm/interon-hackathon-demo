export default function Sidebar({ activeTab, onTabChange }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'intake', label: 'New Patient', icon: '➕' },
    { id: 'queue', label: 'Priority Queue', icon: '📋' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-section-label">Navigation</div>
      {navItems.map(item => (
        <div
          key={item.id}
          className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''}`}
          onClick={() => onTabChange(item.id)}
        >
          <span className="nav-icon">{item.icon}</span>
          {item.label}
        </div>
      ))}
      <div className="sidebar-divider" />
      <div className="sidebar-section-label">Quick Info</div>
      <div style={{ padding: '8px 16px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
        <div style={{ marginBottom: '8px' }}>
          <strong style={{ color: 'var(--text-secondary)' }}>ESI System</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <span style={{ color: 'var(--esi-1)' }}>●</span> Level 1 — Resuscitation
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <span style={{ color: 'var(--esi-2)' }}>●</span> Level 2 — Emergent
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <span style={{ color: 'var(--esi-3)' }}>●</span> Level 3 — Urgent
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <span style={{ color: 'var(--esi-4)' }}>●</span> Level 4 — Less Urgent
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--esi-5)' }}>●</span> Level 5 — Non-Urgent
        </div>
      </div>
    </aside>
  );
}
