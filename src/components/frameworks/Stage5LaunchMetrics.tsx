// Stage5LaunchMetrics.tsx — Ported from Level 1 Stage5LaunchMetrics.jsx
'use client';
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";
const STORAGE_KEY = "dk-stage5-metrics";
function useAutoSave(s){const t=useRef(null);useEffect(()=>{clearTimeout(t.current);t.current=setTimeout(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(s))}catch(e){}},500);return()=>clearTimeout(t.current)},[s])}
function loadSaved(){try{const r=localStorage.getItem(STORAGE_KEY);if(r)return JSON.parse(r)}catch(e){}return null}
export default function Stage5LaunchMetrics(){
  const[theme]=useState(getTheme);const t=THEMES[theme];const[mobile,setMobile]=useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(()=>{const c=()=>setMobile(window.innerWidth<700);window.addEventListener("resize",c);return()=>window.removeEventListener("resize",c)},[]);
  const[state,setState]=useState(()=>loadSaved()||{"dailyUsage":"","retentionD7":"","retentionD30":"","nps":"","unitEconomics":"","custom1":"","custom2":""});const[toast,setToast]=useState(null);
  useAutoSave(state);useEffect(()=>{if(toast){const tm=setTimeout(()=>setToast(null),2500);return()=>clearTimeout(tm)}},[toast]);
  const update=(k,v)=>setState(prev=>({...prev,[k]:v}));
  const fs={width:"100%",padding:"8px 10px",background:t.input,border:`1px solid ${t.cardBorder}`,borderRadius:8,fontSize:12,color:t.text,outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif",resize:"vertical"};
  return(<div style={{maxWidth:900,margin:"0 auto",padding:mobile?"20px 16px":"32px 24px",fontFamily:"'DM Sans',sans-serif"}}>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
    <div style={{marginBottom:28,borderBottom:"3px solid #9B59B6",paddingBottom:16}}>
      <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#9B59B6",fontWeight:600,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:4}}>Stage 5 · Build & Ship</p>
      <h1 style={{fontSize:mobile?24:30,fontFamily:"'Playfair Display',serif",fontWeight:800,color:t.text,margin:"0 0 6px"}}>Launch Metrics Dashboard</h1>
      <p style={{fontSize:14,color:t.textMuted,margin:0}}>Define the KPIs that prove the beachhead works.</p>
    </div>
    <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:10}}>
      <div style={{}}><p style={{fontSize:10,color:"#9B59B6",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>DAILY ACTIVE USAGE</p><textarea value={state.dailyUsage} onChange={e=>update("dailyUsage",e.target.value)} rows={2} placeholder="Target + source" style={fs}/></div>
      <div style={{}}><p style={{fontSize:10,color:"#9B59B6",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>RETENTION DAY 7</p><textarea value={state.retentionD7} onChange={e=>update("retentionD7",e.target.value)} rows={2} placeholder="Target + source" style={fs}/></div>
      <div style={{}}><p style={{fontSize:10,color:"#9B59B6",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>RETENTION DAY 30</p><textarea value={state.retentionD30} onChange={e=>update("retentionD30",e.target.value)} rows={2} placeholder="Target + source" style={fs}/></div>
      <div style={{}}><p style={{fontSize:10,color:"#9B59B6",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>NPS TARGET</p><textarea value={state.nps} onChange={e=>update("nps",e.target.value)} rows={2} placeholder="Target + source" style={fs}/></div>
      <div style={{gridColumn:"1/-1",}}><p style={{fontSize:10,color:"#9B59B6",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>UNIT ECONOMICS</p><textarea value={state.unitEconomics} onChange={e=>update("unitEconomics",e.target.value)} rows={2} placeholder="CAC, LTV, cost per transaction" style={fs}/></div>
      <div style={{}}><p style={{fontSize:10,color:"#9B59B6",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>CUSTOM METRIC 1</p><input value={state.custom1} onChange={e=>update("custom1",e.target.value)} placeholder="Mission-specific" style={fs}/></div>
      <div style={{}}><p style={{fontSize:10,color:"#9B59B6",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>CUSTOM METRIC 2</p><input value={state.custom2} onChange={e=>update("custom2",e.target.value)} placeholder="Mission-specific" style={fs}/></div>
    </div>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:18}}>
      <button onClick={()=>{navigator.clipboard.writeText(JSON.stringify({stage:5,framework:"metrics",data:state,exported_at:new Date().toISOString()},null,2));setToast("Copied")}} style={{padding:"12px 20px",background:"#9B59B6",color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",flex:1,minWidth:140,minHeight:48}}>Export</button>
    </div>
    <p style={{fontSize:11,color:t.textDim,fontFamily:"'DM Mono',monospace",textAlign:"center",marginTop:16}}>Auto-saved to localStorage</p>
    {toast&&<div style={{position:"fixed",bottom:32,left:"50%",transform:"translateX(-50%)",padding:"12px 24px",background:"#1B9C85",color:"#fff",borderRadius:10,fontSize:13,fontWeight:600,boxShadow:"0 4px 20px rgba(0,0,0,0.25)",zIndex:1000}}>{toast}</div>}
  </div>);
}
