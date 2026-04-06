// Stage7HealthMonitor.tsx — Ported from Level 1 Stage7HealthMonitor.jsx
'use client';
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";
const STORAGE_KEY = "dk-stage7-health";
function useAutoSave(s){const t=useRef(null);useEffect(()=>{clearTimeout(t.current);t.current=setTimeout(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(s))}catch(e){}},500);return()=>clearTimeout(t.current)},[s])}
function loadSaved(){try{const r=localStorage.getItem(STORAGE_KEY);if(r)return JSON.parse(r)}catch(e){}return null}
export default function Stage7HealthMonitor(){
  const[theme]=useState(getTheme);const t=THEMES[theme];const[mobile,setMobile]=useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(()=>{const c=()=>setMobile(window.innerWidth<700);window.addEventListener("resize",c);return()=>window.removeEventListener("resize",c)},[]);
  const[state,setState]=useState(()=>loadSaved()||{"kpi1":"","kpi2":"","kpi3":"","redFlags":"","greenSignals":""});const[toast,setToast]=useState(null);
  useAutoSave(state);useEffect(()=>{if(toast){const tm=setTimeout(()=>setToast(null),2500);return()=>clearTimeout(tm)}},[toast]);
  const update=(k,v)=>setState(prev=>({...prev,[k]:v}));
  const fs={width:"100%",padding:"8px 10px",background:t.input,border:`1px solid ${t.cardBorder}`,borderRadius:8,fontSize:12,color:t.text,outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif",resize:"vertical"};
  return(<div style={{maxWidth:900,margin:"0 auto",padding:mobile?"20px 16px":"32px 24px",fontFamily:"'DM Sans',sans-serif"}}>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
    <div style={{marginBottom:28,borderBottom:"3px solid #C0392B",paddingBottom:16}}>
      <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#C0392B",fontWeight:600,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:4}}>Stage 7 · Maturity & Maintenance</p>
      <h1 style={{fontSize:mobile?24:30,fontFamily:"'Playfair Display',serif",fontWeight:800,color:t.text,margin:"0 0 6px"}}>Performance Health Monitor</h1>
      <p style={{fontSize:14,color:t.textMuted,margin:0}}>Track KPIs over time. Trends, not snapshots.</p>
    </div>
    <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:10}}>
      <div style={{gridColumn:"1/-1",}}><p style={{fontSize:10,color:"#C0392B",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>KPI 1 + TREND</p><textarea value={state.kpi1} onChange={e=>update("kpi1",e.target.value)} rows={2} placeholder="Metric: value. Trend: declining/flat/improving" style={fs}/></div>
      <div style={{gridColumn:"1/-1",}}><p style={{fontSize:10,color:"#C0392B",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>KPI 2 + TREND</p><textarea value={state.kpi2} onChange={e=>update("kpi2",e.target.value)} rows={2} placeholder="Metric: value. Trend." style={fs}/></div>
      <div style={{gridColumn:"1/-1",}}><p style={{fontSize:10,color:"#C0392B",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>KPI 3 + TREND</p><textarea value={state.kpi3} onChange={e=>update("kpi3",e.target.value)} rows={2} placeholder="Metric: value. Trend." style={fs}/></div>
      <div style={{gridColumn:"1/-1",}}><p style={{fontSize:10,color:"#C0392B",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>RED FLAGS</p><textarea value={state.redFlags} onChange={e=>update("redFlags",e.target.value)} rows={3} placeholder="Declining metrics, how fast, when started" style={fs}/></div>
      <div style={{gridColumn:"1/-1",}}><p style={{fontSize:10,color:"#1B9C85",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>GREEN SIGNALS</p><textarea value={state.greenSignals} onChange={e=>update("greenSignals",e.target.value)} rows={2} placeholder="What's still working?" style={fs}/></div>
    </div>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:18}}>
      <button onClick={()=>{navigator.clipboard.writeText(JSON.stringify({stage:7,framework:"health",data:state,exported_at:new Date().toISOString()},null,2));setToast("Copied")}} style={{padding:"12px 20px",background:"#C0392B",color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",flex:1,minWidth:140,minHeight:48}}>Export</button>
    </div>
    <p style={{fontSize:11,color:t.textDim,fontFamily:"'DM Mono',monospace",textAlign:"center",marginTop:16}}>Auto-saved to localStorage</p>
    {toast&&<div style={{position:"fixed",bottom:32,left:"50%",transform:"translateX(-50%)",padding:"12px 24px",background:"#1B9C85",color:"#fff",borderRadius:10,fontSize:13,fontWeight:600,boxShadow:"0 4px 20px rgba(0,0,0,0.25)",zIndex:1000}}>{toast}</div>}
  </div>);
}
