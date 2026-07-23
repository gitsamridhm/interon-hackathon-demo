import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PatientIntakeForm from './components/PatientIntakeForm';
import PriorityQueue from './components/PriorityQueue';
import AnalyticsPanel from './components/AnalyticsPanel';
import PatientDetail from './components/PatientDetail';
import Toast from './components/Toast';
import { getAllPatients, getAnalytics } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [patientsData, analyticsData] = await Promise.all([
        getAllPatients(),
        getAnalytics(),
      ]);
      setPatients(patientsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handlePatientCreated = (patient) => {
    addToast(`Patient "${patient.name}" registered successfully`, 'success');
    fetchData();
    setActiveTab('queue');
  };

  const handleTriageComplete = (patient) => {
    addToast(`AI Triage complete for "${patient.name}" — ESI Level ${patient.esi_level}`, 'info');
    fetchData();
  };

  const handlePatientUpdated = () => {
    fetchData();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            patients={patients}
            analytics={analytics}
            loading={loading}
            onSelectPatient={setSelectedPatient}
            onNavigate={setActiveTab}
          />
        );
      case 'intake':
        return (
          <PatientIntakeForm
            onPatientCreated={handlePatientCreated}
            onTriageComplete={handleTriageComplete}
            addToast={addToast}
          />
        );
      case 'queue':
        return (
          <PriorityQueue
            patients={patients}
            onSelectPatient={setSelectedPatient}
            onPatientUpdated={handlePatientUpdated}
            addToast={addToast}
          />
        );
      case 'analytics':
        return (
          <AnalyticsPanel analytics={analytics} loading={loading} />
        );
      default:
        return <Dashboard patients={patients} analytics={analytics} loading={loading} />;
    }
  };

  return (
    <div className="app-layout">
      <Header />
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="main-content">
        {renderContent()}
      </main>

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast key={toast.id} message={toast.message} type={toast.type} />
        ))}
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <PatientDetail
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onPatientUpdated={handlePatientUpdated}
          addToast={addToast}
        />
      )}
    </div>
  );
}

export default App;
