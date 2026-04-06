// Stage5BeachheadExecution.tsx — Ported from Level 1 Stage5BeachheadExecution.jsx
'use client';
// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";
const STORAGE_KEY = "dk-stage5-beachhead";
function useAutoSave(s){const t=useRef(null);useEffect(()=>{clearTimeout(t.current);t.current=setTimeout(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(s))}catch(e){}},500);return()=>clearTimeout(t.current)},[s])}
function loadSaved(){try{const r=localStorage.getItem(STORAGE_KEY);if(r)return JSON.parse(r)}catch(e){}return null}
export default function Stage5BeachheadExecution(){
  const[theme]=useState(getTheme);const t=THEMES[theme];const[mobile,setMobile]=useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(()=>{const c=()=>setMobile(window.innerWidth<700);window.addEventListener("resize",c);return()=>window.removeEventListener("resize",c)},[]);
  const[state,setState]=useState(()=>loadSaved()||{market:"",size:"",neighborhoods:"",driverTarget:"",riderTarget:"",successCriteria:"",resourceAllocation:"",timeline:""});
  const[toast,setToast]=useState(null);useAutoSave(state);
  useEffect(()=>{if(toast){const tm=setTimeout(()=>setToast(null),2500);return()=>clearTimeout(tm)}},[toast]);
  const update=(k,v)=>setState(prev=>({...prev,[k]:v}));
  const fs={width:"100%",padding:"8px 10px",background:t.input,border:`1px solid ${t.cardBorder}`,borderRadius:8,fontSize:12,color:t.text,outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif",resize:"vertical"};
  return(<div style={{maxWidth:900,margin:"0 auto",padding:mobile?"20px 16px":"32px 24px",fontFamily:"'DM Sans',sans-serif"}}>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
    <div style={{marginBottom:28,borderBottom:"3px solid #9B59B6",paddingBottom:16}}>
      <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#9B59B6",fontWeight:600,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:4}}>Stage 5 · Build & Ship</p>
      <h1 style={{fontSize:mobile?24:30,fontFamily:"'Playfair Display',serif",fontWeight:800,color:t.text,margin:"0 0 6px"}}>Beachhead Execution Plan</h1>
      <p style={{fontSize:14,color:t.textMuted,margin:0}}>Define the specific beachhead market, constraints, and success criteria.</p>
    </div>
    <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:10}}>
      <div style={{gridColumn:"1/-1"}}><p style={{fontSize:10,color:"#9B59B6",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>TARGET MARKET</p><input value={state.market} onChange={e=>update("market",e.target.value)} placeholder="e.g., Jakarta, Indonesia — urban rideshare" style={{...fs,fontWeight:600,fontSize:14}}/></div>
      <div><p style={{fontSize:10,color:"#9B59B6",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>MARKET SIZE CONSTRAINT</p><textarea value={state.size} onChange={e=>update("size",e.target.value)} rows={2} placeholder="e.g., 1,000 drivers, 3 neighborhoods, 10K target riders" style={fs}/></div>
      <div><p style={{fontSize:10,color:"#9B59B6",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>NEIGHBORHOODS / ZONES</p><textarea value={state.neighborhoods} onChange={e=>update("neighborhoods",e.target.value)} rows={2} placeholder="Specific areas to launch in" style={fs}/></div>
      <div><p style={{fontSize:10,color:"#E67E22",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>SUPPLY TARGET (drivers/sellers)</p><textarea value={state.driverTarget} onChange={e=>update("driverTarget",e.target.value)} rows={2} placeholder="How many supply-side participants needed at launch?" style={fs}/></div>
      <div><p style={{fontSize:10,color:"#3498DB",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>DEMAND TARGET (riders/buyers)</p><textarea value={state.riderTarget} onChange={e=>update("riderTarget",e.target.value)} rows={2} placeholder="How many demand-side users needed to validate?" style={fs}/></div>
      <div style={{gridColumn:"1/-1"}}><p style={{fontSize:10,color:"#1B9C85",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>SUCCESS CRITERIA (from Stage 4 OKRs)</p><textarea value={state.successCriteria} onChange={e=>update("successCriteria",e.target.value)} rows={3} placeholder="What metrics prove the beachhead converted? e.g., 5K daily rides, <3 min pickup, 40% day-30 retention" style={fs}/></div>
      <div><p style={{fontSize:10,color:t.textDim,margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>RESOURCE ALLOCATION</p><textarea value={state.resourceAllocation} onChange={e=>update("resourceAllocation",e.target.value)} rows={2} placeholder="Team size, budget, infrastructure" style={fs}/></div>
      <div><p style={{fontSize:10,color:t.textDim,margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>TIMELINE</p><textarea value={state.timeline} onChange={e=>update("timeline",e.target.value)} rows={2} placeholder="Launch date, key milestones" style={fs}/></div>
    </div>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:18}}>
      <button onClick={()=>{navigator.clipboard.writeText(JSON.stringify({stage:5,framework:"beachhead_execution",data:state,exported_at:new Date().toISOString()},null,2));setToast("Copied")}} style={{padding:"12px 20px",background:"#9B59B6",color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",flex:1,minWidth:140,minHeight:48}}>📤 Export</button>
    </div>
    <p style={{fontSize:11,color:t.textDim,fontFamily:"'DM Mono',monospace",textAlign:"center",marginTop:16}}>Auto-saved to localStorage</p>
    {toast&&<div style={{position:"fixed",bottom:32,left:"50%",transform:"translateX(-50%)",padding:"12px 24px",background:"#1B9C85",color:"#fff",borderRadius:10,fontSize:13,fontWeight:600,boxShadow:"0 4px 20px rgba(0,0,0,0.25)",zIndex:1000}}>{toast}</div>}
  </div>);
}
