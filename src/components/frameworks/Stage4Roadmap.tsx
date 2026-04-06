// Stage4Roadmap.tsx — Ported from Level 1 Stage4Roadmap.jsx
'use client';
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";
const STORAGE_KEY = "dk-stage4-roadmap";
const EMPTY = { name: "", quarter: "Q1", owner: "", status: "planned", dependencies: "", notes: "" };
const STATUSES = [{ key: "planned", label: "Planned", color: "#95A5A6" }, { key: "in_progress", label: "In Progress", color: "#3498DB" }, { key: "done", label: "Done", color: "#1B9C85" }, { key: "blocked", label: "Blocked", color: "#E74C3C" }];
function useAutoSave(s) { const t = useRef(null); useEffect(() => { clearTimeout(t.current); t.current = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch(e){} }, 500); return () => clearTimeout(t.current); }, [s]); }
function loadSaved() { try { const r = localStorage.getItem(STORAGE_KEY); if(r) return JSON.parse(r); } catch(e){} return null; }

export default function Roadmap() {
  const [theme] = useState(getTheme); const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize",c); return () => window.removeEventListener("resize",c); }, []);
  const [state, setState] = useState(() => loadSaved() || { milestones: [{ ...EMPTY }, { ...EMPTY }, { ...EMPTY }] });
  const [toast, setToast] = useState(null);
  useAutoSave(state);
  useEffect(() => { if(toast) { const tm = setTimeout(() => setToast(null), 2500); return () => clearTimeout(tm); } }, [toast]);
  const update = (i,k,v) => setState(prev => { const m=[...prev.milestones]; m[i]={...m[i],[k]:v}; return {...prev,milestones:m}; });
  const add = () => setState(prev => ({...prev, milestones:[...prev.milestones,{...EMPTY}]}));
  const remove = (i) => setState(prev => ({...prev, milestones:prev.milestones.filter((_,j)=>j!==i)}));
  const fieldStyle = { width:"100%", padding:"8px 10px", background:t.input, border:`1px solid ${t.cardBorder}`, borderRadius:8, fontSize:12, color:t.text, outline:"none", boxSizing:"border-box", fontFamily:"'DM Sans',sans-serif", resize:"vertical" };

  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:mobile?"20px 16px":"32px 24px", fontFamily:"'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ marginBottom:28, borderBottom:"3px solid #3498DB", paddingBottom:16 }}>
        <p style={{ fontSize:11, fontFamily:"'DM Mono',monospace", color:"#3498DB", fontWeight:600, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:4 }}>Stage 4 · Planning & Roadmaps</p>
        <h1 style={{ fontSize:mobile?24:30, fontFamily:"'Playfair Display',serif", fontWeight:800, color:t.text, margin:"0 0 6px" }}>Roadmap</h1>
        <p style={{ fontSize:14, color:t.textMuted, margin:0 }}>Milestones, timelines, owners, and dependencies.</p>
      </div>
      {state.milestones.map((m,i) => { const st = STATUSES.find(s=>s.key===m.status)||STATUSES[0]; return (
        <div key={i} style={{ marginBottom:10, padding:"12px 14px", background:t.card, border:`1px solid ${st.color}30`, borderRadius:12, borderLeft:`4px solid ${st.color}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <span style={{ fontSize:12, fontWeight:700, color:"#3498DB", fontFamily:"'DM Mono',monospace" }}>M{i+1}</span>
            <input value={m.name} onChange={e=>update(i,"name",e.target.value)} placeholder="Milestone name..." style={{...fieldStyle, flex:1, fontWeight:600, fontSize:14}} />
            {state.milestones.length>1 && <button onClick={()=>remove(i)} style={{ background:"none", border:"none", color:"#E74C3C60", cursor:"pointer", fontSize:14 }}>×</button>}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:mobile?"1fr":"1fr 1fr 1fr", gap:6, marginBottom:6 }}>
            <div><p style={{ fontSize:10, color:t.textDim, margin:"0 0 3px", fontFamily:"'DM Mono',monospace" }}>QUARTER</p>
              <div style={{ display:"flex", gap:3 }}>{["Q1","Q2","Q3","Q4"].map(q => <button key={q} onClick={()=>update(i,"quarter",q)} style={{ flex:1, padding:"5px", borderRadius:5, fontSize:11, fontWeight:600, cursor:"pointer", border:`1px solid ${t.cardBorder}`, background:m.quarter===q?"#3498DB20":"transparent", color:m.quarter===q?"#3498DB":t.textDim }}>{q}</button>)}</div></div>
            <div><p style={{ fontSize:10, color:t.textDim, margin:"0 0 3px", fontFamily:"'DM Mono',monospace" }}>OWNER</p><input value={m.owner} onChange={e=>update(i,"owner",e.target.value)} placeholder="Who owns this?" style={fieldStyle} /></div>
            <div><p style={{ fontSize:10, color:t.textDim, margin:"0 0 3px", fontFamily:"'DM Mono',monospace" }}>STATUS</p>
              <div style={{ display:"flex", gap:3 }}>{STATUSES.map(s => <button key={s.key} onClick={()=>update(i,"status",s.key)} style={{ flex:1, padding:"5px", borderRadius:5, fontSize:9, fontWeight:600, cursor:"pointer", border:`1px solid ${s.color}30`, background:m.status===s.key?`${s.color}20`:"transparent", color:m.status===s.key?s.color:t.textDim }}>{s.label}</button>)}</div></div>
          </div>
          <textarea value={m.dependencies} onChange={e=>update(i,"dependencies",e.target.value)} rows={1} placeholder="Depends on..." style={{...fieldStyle, marginBottom:4}} />
          <textarea value={m.notes} onChange={e=>update(i,"notes",e.target.value)} rows={1} placeholder="Notes..." style={fieldStyle} />
        </div>); })}
      <button onClick={add} style={{ width:"100%", padding:"12px", background:"none", border:`1px dashed ${t.cardBorder}`, borderRadius:10, fontSize:13, color:t.textMuted, cursor:"pointer", marginBottom:18 }}>+ Add Milestone</button>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        <button onClick={() => { navigator.clipboard.writeText(JSON.stringify({stage:4,framework:"roadmap",data:state,exported_at:new Date().toISOString()},null,2)); setToast("Copied"); }} style={{ padding:"12px 20px", background:"#3498DB", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", flex:1, minHeight:48 }}>📤 Export</button>
        <button onClick={() => { const raw=prompt("Paste JSON:"); if(!raw) return; try{setState({...JSON.parse(raw)}); setToast("Imported");}catch(e){setToast("Invalid JSON");} }} style={{ padding:"12px 20px", background:t.text, color:t.bg, border:"none", borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", flex:1, minHeight:48 }}>📥 Import</button>
      </div>
      <p style={{ fontSize:11, color:t.textDim, fontFamily:"'DM Mono',monospace", textAlign:"center", marginTop:16 }}>Auto-saved to localStorage</p>
      {toast && <div style={{ position:"fixed", bottom:32, left:"50%", transform:"translateX(-50%)", padding:"12px 24px", background:"#1B9C85", color:"#fff", borderRadius:10, fontSize:13, fontWeight:600, boxShadow:"0 4px 20px rgba(0,0,0,0.25)", zIndex:1000 }}>{toast}</div>}
    </div>
  );
}
