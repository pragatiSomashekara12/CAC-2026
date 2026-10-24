import { useState, useEffect, useMemo } from 'react';

type Point = { total_cost: number; total_return: number; risk: number; project_ids: string[] };
type Project = {
  id: string; name: string; type: string; location: string; cost: number;
  expected_return?: { time_savings: number; property_gain: number; tax_gain: number; total: number };
  risk?: { mean_overrun_pct: number; sd_overrun_pct: number; expected_cost: number; risk_dollars: number };
};

const API = 'http://127.0.0.1:8000';
const BUDGET = 50000000;

// Completed ARDOT projects with verified final costs (InfraFrontier_verified_cost_cases_audit.csv)
const VERIFIED_CASES = [
  { name: 'Manila - East (Widening)', cost: 35100000, year: 2021, miles: 1.8 },
  { name: 'Monette Bypass', cost: 14400000, year: 2018, miles: 3.17 },
  { name: 'Vandenberg Blvd. - Hwy. 5 (Widening)', cost: 95400000, year: 2016, miles: 4.6 },
  { name: 'Hwy. 365 - I-430 (Widening) & I-430 Interchange Modification', cost: 42500000, year: 2020, miles: 5.63 },
  { name: 'Hwy. 264 - New Hope Rd. (Widening)', cost: 40100000, year: 2017, miles: 5.1 },
  { name: 'Baptist Hospital - University Ave. (Widening)', cost: 97400000, year: 2023, miles: 2.16 },
];

const money = (n: number) => '$' + Math.round(n).toLocaleString();
const millions = (n: number) => '$' + (n / 1e6).toFixed(1) + 'M';
const pct = (n: number) => (n * 100).toFixed(1) + '%';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [frontier, setFrontier] = useState<Point[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const demo = await (await fetch(`${API}/demo-projects`)).json();
        const res = await fetch(`${API}/frontier`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projects: demo, budget: BUDGET }),
        });
        const data = await res.json();
        setProjects(data.projects || demo);
        setFrontier(data.frontier || []);
        setIdx(Math.floor(((data.frontier || []).length - 1) / 2));
      } catch (e) {
        console.error(e);
        setError('Could not reach the InfraFrontier backend. Is it running on port 8000?');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const nameOf = useMemo(() => {
    const m: Record<string, string> = {};
    projects.forEach(p => { m[p.id] = p.name; });
    return (id: string) => m[id] || id;
  }, [projects]);

  const sel = frontier[idx];
  const bounds = useMemo(() => {
    if (!frontier.length) return null;
    const r = frontier.map(p => p.risk), ret = frontier.map(p => p.total_return);
    return { minR: Math.min(...r), maxR: Math.max(...r), minRet: Math.min(...ret), maxRet: Math.max(...ret) };
  }, [frontier]);

  const riskLabel = () => {
    if (frontier.length < 2) return 'Low';
    const f = idx / (frontier.length - 1);
    return f < 0.34 ? 'Low' : f < 0.67 ? 'Moderate' : 'High';
  };

  const tab = (key: string, label: string) => (
    <button
      onClick={() => setActiveTab(key)}
      style={{ background: activeTab === key ? '#1e293b' : 'none', border: 'none', color: activeTab === key ? '#38bdf8' : 'white', cursor: 'pointer', padding: '6px 10px', borderRadius: 6, fontSize: 14 }}
    >{label}</button>
  );

  const card = { background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' } as const;
  const statCard = { ...card, textAlign: 'center' } as const;
  const statLabel = { fontSize: 12, fontWeight: 600, color: '#94a3b8', letterSpacing: 0.5 } as const;
  const statVal = { fontSize: 26, fontWeight: 700, marginTop: 6 } as const;
  const th = { textAlign: 'left', padding: '8px 10px', fontSize: 12, color: '#64748b', borderBottom: '1px solid #e2e8f0' } as const;
  const td = { padding: '10px', fontSize: 14, borderBottom: '1px solid #f1f5f9' } as const;

  // Chart geometry
  const X0 = 70, X1 = 480, Y0 = 250, Y1 = 30;
  const px = (risk: number) => bounds ? X0 + ((risk - bounds.minR) / (bounds.maxR - bounds.minR || 1)) * (X1 - X0) : X0;
  const py = (ret: number) => bounds ? Y0 - ((ret - bounds.minRet) / (bounds.maxRet - bounds.minRet || 1)) * (Y0 - Y1) : Y0;

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#f5f7fb', minHeight: '100vh', color: '#0f172a' }}>
      <nav style={{ background: '#0f172a', color: 'white', padding: '12px 24px', display: 'flex', gap: 20, alignItems: 'center' }}>
        <b style={{ fontSize: 20, marginRight: 'auto' }}>InfraFrontier</b>
        {tab('dashboard', 'Dashboard')}
        {tab('projects', 'Projects')}
        {tab('optimization', 'Portfolio Optimization')}
        {tab('validation', 'Validation')}
      </nav>

      <main style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        {loading && <p>Loading portfolio analysis...</p>}
        {error && <p style={{ color: '#dc2626' }}>{error}</p>}

        {activeTab === 'dashboard' && sel && (
          <>
            <h1 style={{ textAlign: 'center', marginBottom: 4 }}>Dashboard</h1>
            <p style={{ textAlign: 'center', color: '#64748b', marginTop: 0 }}>
              Recommended portfolio for a {millions(BUDGET)} budget at {riskLabel().toLowerCase()} risk tolerance
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div style={statCard}><div style={statLabel}>PORTFOLIO COST</div><div style={statVal}>{millions(sel.total_cost)}</div><small style={{ color: '#64748b' }}>of {millions(BUDGET)} budget</small></div>
              <div style={statCard}><div style={statLabel}>PROJECTS FUNDED</div><div style={statVal}>{sel.project_ids.length} of {projects.length}</div></div>
              <div style={statCard}><div style={statLabel}>EXPECTED BENEFIT</div><div style={statVal}>{millions(sel.total_return)}</div><small style={{ color: '#64748b' }}>20-yr present value</small></div>
              <div style={statCard}><div style={statLabel}>COST OVERRUN RISK</div><div style={statVal}>{riskLabel()}</div><small style={{ color: '#64748b' }}>± {millions(sel.risk)} (1 std. dev.)</small></div>
            </div>
            <div style={{ ...card, marginTop: 16 }}>
              <b>Funded projects</b>
              <ul style={{ margin: '8px 0 0 0' }}>{sel.project_ids.map(id => <li key={id}>{nameOf(id)}</li>)}</ul>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 0 }}>Change risk tolerance on the Portfolio Optimization tab.</p>
            </div>
          </>
        )}

        {activeTab === 'projects' && projects.length > 0 && (
          <>
            <h1 style={{ marginBottom: 4 }}>Candidate Projects</h1>
            <p style={{ color: '#64748b', marginTop: 0 }}>Northwest Arkansas and Fort Smith infrastructure candidates</p>
            <div style={{ ...card, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>
                  <th style={th}>Project</th><th style={th}>Location</th><th style={th}>Cost</th>
                  <th style={th}>Expected Benefit</th><th style={th}>Benefit / Cost</th><th style={th}>Expected Overrun</th>
                </tr></thead>
                <tbody>
                  {projects.map(p => (
                    <tr key={p.id}>
                      <td style={td}><b>{p.name}</b></td>
                      <td style={td}>{p.location}</td>
                      <td style={td}>{millions(p.cost)}</td>
                      <td style={td}>{p.expected_return ? millions(p.expected_return.total) : '-'}</td>
                      <td style={td}>{p.expected_return ? (p.expected_return.total / p.cost).toFixed(1) + 'x' : '-'}</td>
                      <td style={td}>{p.risk ? pct(p.risk.mean_overrun_pct) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ color: '#64748b', fontSize: 13 }}>
              Traffic, property values and millage rates from county assessors and ARDOT. Project costs and travel-time savings are illustrative estimates.
            </p>
          </>
        )}

        {activeTab === 'optimization' && bounds && sel && (
          <>
            <h1 style={{ marginBottom: 4 }}>Portfolio Optimization</h1>
            <p style={{ color: '#64748b', marginTop: 0 }}>Efficient frontier: the highest benefit for each level of risk, within a {millions(BUDGET)} budget</p>
            <div style={card}>
              <svg viewBox="0 0 500 300" width="100%" height={340}>
                <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="#94a3b8" />
                <line x1={X0} y1={Y1} x2={X0} y2={Y0} stroke="#94a3b8" />
                <text x={X0} y={Y0 + 16} fontSize="10" fill="#64748b" textAnchor="middle">{millions(bounds.minR)}</text>
                <text x={X1} y={Y0 + 16} fontSize="10" fill="#64748b" textAnchor="middle">{millions(bounds.maxR)}</text>
                <text x={X0 - 6} y={Y0} fontSize="10" fill="#64748b" textAnchor="end">{millions(bounds.minRet)}</text>
                <text x={X0 - 6} y={Y1 + 4} fontSize="10" fill="#64748b" textAnchor="end">{millions(bounds.maxRet)}</text>
                <text x={(X0 + X1) / 2} y={Y0 + 36} fontSize="11" textAnchor="middle">Cost overrun risk (1 std. dev.)</text>
                <text x={14} y={(Y0 + Y1) / 2} fontSize="11" textAnchor="middle" transform={`rotate(-90 14 ${(Y0 + Y1) / 2})`}>Expected benefit</text>
                <polyline fill="none" stroke="#cbd5e1" strokeWidth={2} points={frontier.map(p => `${px(p.risk)},${py(p.total_return)}`).join(' ')} />
                {frontier.map((p, i) => (
                  <circle key={i} cx={px(p.risk)} cy={py(p.total_return)} r={i === idx ? 9 : 5}
                    fill={i === idx ? '#0ea5e9' : '#94a3b8'} onClick={() => setIdx(i)} style={{ cursor: 'pointer' }} />
                ))}
              </svg>
            </div>
            <div style={{ ...card, marginTop: 16 }}>
              <label><b>Risk tolerance: {riskLabel()}</b></label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>Lower risk</span>
                <input type="range" min={0} max={frontier.length - 1} value={idx} onChange={e => setIdx(parseInt(e.target.value))} style={{ flex: 1 }} />
                <span style={{ fontSize: 12, color: '#64748b' }}>Higher benefit</span>
              </div>
              <p>Cost: <b>{millions(sel.total_cost)}</b> &nbsp;|&nbsp; Expected benefit: <b>{millions(sel.total_return)}</b> &nbsp;|&nbsp; Overrun risk: <b>± {millions(sel.risk)}</b></p>
              <p style={{ marginBottom: 6 }}><b>Recommended projects:</b></p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {sel.project_ids.map(id => <span key={id} style={{ background: '#e0f2fe', padding: '4px 10px', borderRadius: 12, fontSize: 13 }}>{nameOf(id)}</span>)}
              </div>
            </div>
          </>
        )}

        {activeTab === 'validation' && (
          <>
            <h1 style={{ marginBottom: 4 }}>Validation</h1>
            <p style={{ color: '#64748b', marginTop: 0 }}>Completed Arkansas projects with verified final costs</p>
            <div style={{ ...card, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th style={th}>ARDOT project</th><th style={th}>Final cost</th><th style={th}>Year</th><th style={th}>Length</th><th style={th}>Cost per mile</th></tr></thead>
                <tbody>
                  {VERIFIED_CASES.map(c => (
                    <tr key={c.name}>
                      <td style={td}>{c.name}</td><td style={td}>{money(c.cost)}</td><td style={td}>{c.year}</td>
                      <td style={td}>{c.miles} mi</td><td style={td}>{millions(c.cost / c.miles)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ ...card, marginTop: 16, borderLeft: '4px solid #f59e0b' }}>
              <b>Data limitation</b>
              <p style={{ margin: '6px 0 0 0', color: '#334155' }}>
                Final costs are verified in ARDOT's 2025 Benefit-Cost Analysis. Original cost estimates for these projects were not
                publicly available, so overrun predictions can't yet be checked against actual outcomes. Until they are, InfraFrontier
                uses published reference-class overrun rates (Flyvbjerg, 2005: roads +20.4%, bridges +33.8%) instead of a trained model.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}