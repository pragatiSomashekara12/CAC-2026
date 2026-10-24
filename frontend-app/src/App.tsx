import { useState, useEffect, useMemo } from 'react';
type Point = { total_cost: number; total_return: number; risk: number; project_ids?: string[]; projects?: any; };

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projects, setProjects] = useState<any[]>([]);
  const [frontier, setFrontier] = useState<Point[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const demo = await (await fetch('http://127.0.0.1:8000/demo-projects')).json();
        setProjects(demo);
        const res = await fetch('http://127.0.0.1:8000/frontier', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projects: demo, budget: 50000000 })
        });
        const data = await res.json();
        const pts = Array.isArray(data) ? data : data.frontier || [];
        setFrontier(pts);
      } catch(e){ console.error(e) } finally { setLoading(false) }
    })();
  }, []);

  const sel = frontier[idx];
  const bounds = useMemo(() => {
    if(!frontier.length) return null;
    const r = frontier.map(p=>p.risk), ret = frontier.map(p=>p.total_return);
    return { minR: Math.min(...r), maxR: Math.max(...r), minRet: Math.min(...ret), maxRet: Math.max(...ret) };
  }, [frontier]);
  const getIds = (p:Point) => p?.project_ids || p?.projects || [];

  return (
    <div style={{fontFamily:'system-ui', background:'#f5f7fb', minHeight:'100vh'}}>
      <nav style={{background:'#0f172a', color:'white', padding:'12px 24px', display:'flex', gap:20}}>
        <b>InfraFrontier</b>
        <button onClick={()=>setActiveTab('dashboard')} style={{background: activeTab==='dashboard' ? '#1e293b' : 'none', border:'none', color: activeTab==='dashboard' ? '#38bdf8' : 'white', cursor:'pointer', padding:'6px 10px', borderRadius:6}}>Dashboard</button>
        <button onClick={()=>setActiveTab('projects')} style={{background: activeTab==='projects' ? '#1e293b' : 'none', border:'none', color: activeTab==='projects' ? '#38bdf8' : 'white', cursor:'pointer', padding:'6px 10px', borderRadius:6}}>Projects</button>
        <button onClick={()=>setActiveTab('optimization')} style={{background: activeTab==='optimization' ? '#1e293b' : 'none', border:'none', color: activeTab==='optimization' ? '#38bdf8' : 'white', cursor:'pointer', padding:'6px 10px', borderRadius:6}}>Portfolio Optimization</button>
      </nav>
      <main style={{padding:24, maxWidth:1100, margin:'0 auto'}}>
        {loading && <p>Loading $50M frontier... smallest $8.5M</p>}
        {activeTab==='dashboard' && sel && (
          <>
            <h2 style={{textAlign:'center'}}>Dashboard - Point {idx} (Uses Selected Frontier Point)</h2>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
              <div style={{background:'white', padding:20, borderRadius:12, textAlign:'center', border:'1px solid #e2e8f0'}}>TOTAL BUDGET<br/><b style={{fontSize:26}}>${sel.total_cost?.toLocaleString()}</b><br/><small>Limit $50M</small></div>
              <div style={{background:'white', padding:20, borderRadius:12, textAlign:'center', border:'1px solid #e2e8f0'}}>PROJECTS ADDED<br/><b style={{fontSize:26}}>{getIds(sel).length}</b></div>
              <div style={{background:'white', padding:20, borderRadius:12, textAlign:'center', border:'1px solid #e2e8f0'}}>EXPECTED RETURN<br/><b style={{fontSize:26}}>{sel.total_return}</b></div>
              <div style={{background:'white', padding:20, borderRadius:12, textAlign:'center', border:'1px solid #e2e8f0'}}>RISK LEVEL<br/><b style={{fontSize:26}}>{sel.risk}</b></div>
            </div>
          </>
        )}
        {activeTab==='optimization' && bounds && sel && (
          <>
            <h3>Risk vs Total Return - Budget $50M (scatter)</h3>
            <div style={{background:'white', padding:16, borderRadius:12, border:'1px solid #e2e8f0'}}>
              <svg viewBox="0 0 500 300" width="100%" height={320} style={{background:'#f8fafc'}}>
                <text x="250" y="15" textAnchor="middle" fontSize="12">Risk (X) vs Total Return (Y)</text>
                <line x1={40} y1={260} x2={480} y2={260} stroke="#94a3b8"/><line x1={40} y1={20} x2={40} y2={260} stroke="#94a3b8"/>
                {frontier.map((p,i)=>{
                  const x = 40 + ((p.risk - bounds.minR)/(bounds.maxR-bounds.minR||1))*430;
                  const y = 260 - ((p.total_return - bounds.minRet)/(bounds.maxRet-bounds.minRet||1))*230;
                  return <circle key={i} cx={x} cy={y} r={i===idx?9:5} fill={i===idx?'#0ea5e9':'#94a3b8'} onClick={()=>setIdx(i)} style={{cursor:'pointer'}}/>
                })}
              </svg>
            </div>
            <div style={{background:'white', padding:16, borderRadius:12, marginTop:16, border:'1px solid #e2e8f0'}}>
              <label><b>Slider to select point on frontier: {idx} / {frontier.length-1}</b></label>
              <input type="range" min={0} max={frontier.length-1} value={idx} onChange={e=>setIdx(parseInt(e.target.value))} style={{width:'100%'}}/>
              <p>Cost: ${sel.total_cost?.toLocaleString()} | Return: {sel.total_return} | Risk: {sel.risk}</p>
              <p><b>Selected project_ids:</b></p>
              <div style={{display:'flex', flexWrap:'wrap', gap:6}}>{getIds(sel).map((id:string)=><span key={id} style={{background:'#e0f2fe', padding:'4px 8px', borderRadius:12, fontSize:12}}>{id}</span>)}</div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
