import { useState, useEffect } from 'react';

export default function Header() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">
          <div className="header-logo-icon">🏥</div>
          <div>
            <div className="header-title">TriageAI</div>
          </div>
        </div>
        <span className="header-subtitle">AI-Powered ER Smart Triage</span>
      </div>
      <div className="header-right">
        <div className="header-status">
          <span className="header-status-dot"></span>
          System Online
        </div>
        <div className="header-clock">
          {time.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </div>
        <div className="header-clock" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
          {time.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
      </div>
    </header>
  );
}
