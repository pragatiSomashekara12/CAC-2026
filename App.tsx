import React, { useState } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div style={styles.appContainer}>
      {/* Top Navigation Bar */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>InfraFrontier</div>
        <div style={styles.navLinks}>
          <button 
            onClick={() => setActiveTab('dashboard')} 
            style={activeTab === 'dashboard' ? styles.activeNavBtn : styles.navBtn}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('projects')} 
            style={activeTab === 'projects' ? styles.activeNavBtn : styles.navBtn}
          >
            Projects
          </button>
          <button 
            onClick={() => setActiveTab('optimization')} 
            style={activeTab === 'optimization' ? styles.activeNavBtn : styles.navBtn}
          >
            Portfolio Optimization
          </button>
          <button 
            onClick={() => setActiveTab('validation')} 
            style={activeTab === 'validation' ? styles.activeNavBtn : styles.navBtn}
          >
            Validation
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={styles.mainContent}>
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'projects' && <ProjectsView />}
        {activeTab === 'optimization' && <OptimizationView />}
        {activeTab === 'validation' && <ValidationView />}
      </main>
    </div>
  );
}

// 1. Dashboard View
function DashboardView() {
  return (
    <div>
      <h1 style={styles.title}>Dashboard</h1>
      <p style={styles.subtitle}>A stronger future starts here.</p>
      
      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>TOTAL BUDGET</div>
          <div style={styles.cardVal}>$5,000,000</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardHeader}>PROJECTS ADDED</div>
          <div style={styles.cardVal}>6</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardHeader}>EXPECTED RETURN</div>
          <div style={styles.cardVal}>18.5%</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardHeader}>RISK LEVEL</div>
          <div style={styles.cardVal}>Moderate</div>
        </div>
      </div>
    </div>
  );
}

// 2. Projects View
function ProjectsView() {
  return (
    <div>
      <h1 style={styles.title}>Projects</h1>
      <p style={styles.subtitle}>Build your community's next chapter.</p>
      <div style={styles.card}>
        <p style={{ color: '#64748b' }}>Project form and infrastructure list go here...</p>
      </div>
    </div>
  );
}

// 3. Portfolio Optimization View
function OptimizationView() {
  return (
    <div>
      <h1 style={styles.title}>Portfolio Optimization</h1>
      <p style={styles.subtitle}>Find your best path forward.</p>
      <div style={styles.card}>
        <p style={{ color: '#64748b' }}>Efficient frontier chart and risk tolerance slider go here...</p>
      </div>
    </div>
  );
}

// 4. Validation View
function ValidationView() {
  return (
    <div>
      <h1 style={styles.title}>Validation</h1>
      <p style={styles.subtitle}>Confidence, backed by comparison.</p>
      <div style={styles.card}>
        <p style={{ color: '#64748b' }}>Historical Arkansas project outcomes go here...</p>
      </div>
    </div>
  );
}

// Styling Object
const styles: { [key: string]: React.CSSProperties } = {
  appContainer: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#0f172a',
  },
  navbar: {
    backgroundColor: '#0F172A',
    color: '#ffffff',
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  logo: {
    fontSize: '22px',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
  },
  navLinks: {
    display: 'flex',
    gap: '20px',
  },
  navBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    paddingBottom: '4px',
  },
  activeNavBtn: {
    background: 'none',
    border: 'none',
    color: '#38bdf8',
    borderBottom: '2px solid #38bdf8',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    paddingBottom: '4px',
  },
  mainContent: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '32px 16px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 4px 0',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: '0 0 24px 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  cardHeader: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: '0.5px',
  },
  cardVal: {
    fontSize: '28px',
    fontWeight: '700',
    marginTop: '8px',
    color: '#0f172a',
  },
};