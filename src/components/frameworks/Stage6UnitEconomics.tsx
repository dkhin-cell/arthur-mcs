// Stage6UnitEconomics.tsx — Ported from Level 1 Stage6UnitEconomics.jsx
'use client';
// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";
const STORAGE_KEY = "dk-stage6-economics";
function useAutoSave(s){const t=useRef(null);useEffect(()=>{clearTimeout(t.current);t.current=setTimeout(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(s))}catch(e){}},500);return()=>clearTimeout(t.current)},[s])}
function loadSaved(){try{const r=localStorage.getItem(STORAGE_KEY);if(r)return JSON.parse(r)}catch(e){}return null}
export default function Stage6UnitEconomics(){
  const[theme]=useState(getTheme);const t=THEMES[theme];const[mobile,setMobile]=useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(()=>{const c=()=>setMobile(window.innerWidth<700);window.addEventListener("resize",c);return()=>window.removeEventListener("resize",c)},[]);
  const[state,setState]=useState(()=>loadSaved()||{"cac":"","ltv":"","ratio":"","marginal":"","breakEven":"","risks":""});const[toast,setToast]=useState(null);
  useAutoSave(state);useEffect(()=>{if(toast){const tm=setTimeout(()=>setToast(null),2500);return()=>clearTimeout(tm)}},[toast]);
  const update=(k,v)=>setState(prev=>({...prev,[k]:v}));
  const fs={width:"100%",padding:"8px 10px",background:t.input,border:`1px solid ${t.cardBorder}`,borderRadius:8,fontSize:12,color:t.text,outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif",resize:"vertical"};
  return(<div style={{maxWidth:900,margin:"0 auto",padding:mobile?"20px 16px":"32px 24px",fontFamily:"'DM Sans',sans-serif"}}>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
    <div style={{marginBottom:28,borderBottom:"3px solid #1ABC9C",paddingBottom:16}}>
      <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#1ABC9C",fontWeight:600,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:4}}>Stage 6 · Scale & Optimize</p>
      <h1 style={{fontSize:mobile?24:30,fontFamily:"'Playfair Display',serif",fontWeight:800,color:t.text,margin:"0 0 6px"}}>Unit Economics at Scale</h1>
      <p style={{fontSize:14,color:t.textMuted,margin:0}}>Does the model hold at 10x?</p>
    </div>
    <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:10}}>
      <div style={{}}><p style={{fontSize:10,color:"#1ABC9C",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>CAC</p><textarea value={state.cac} onChange={e=>update("cac",e.target.value)} rows={2} placeholder="Current vs projected at 10x" style={fs}/></div>
      <div style={{}}><p style={{fontSize:10,color:"#1ABC9C",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>LTV</p><textarea value={state.ltv} onChange={e=>update("ltv",e.target.value)} rows={2} placeholder="Current vs projected" style={fs}/></div>
      <div style={{}}><p style={{fontSize:10,color:"#1ABC9C",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>LTV/CAC RATIO</p><textarea value={state.ratio} onChange={e=>update("ratio",e.target.value)} rows={2} placeholder="Current vs target (>3)" style={fs}/></div>
      <div style={{}}><p style={{fontSize:10,color:"#1ABC9C",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>MARGINAL COST</p><textarea value={state.marginal} onChange={e=>update("marginal",e.target.value)} rows={2} placeholder="Decrease/flat/increase at scale?" style={fs}/></div>
      <div style={{gridColumn:"1/-1",}}><p style={{fontSize:10,color:"#1ABC9C",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>BREAK-EVEN</p><textarea value={state.breakEven} onChange={e=>update("breakEven",e.target.value)} rows={2} placeholder="When profitable per cohort?" style={fs}/></div>
      <div style={{gridColumn:"1/-1",}}><p style={{fontSize:10,color:"#E74C3C",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>WHERE ECONOMICS BREAK</p><textarea value={state.risks} onChange={e=>update("risks",e.target.value)} rows={3} placeholder="What gets expensive at 10x?" style={fs}/></div>
    </div>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:18}}>
      <button onClick={()=>{navigator.clipboard.writeText(JSON.stringify({stage:6,framework:"economics",data:state,exported_at:new Date().toISOString()},null,2));setToast("Copied")}} style={{padding:"12px 20px",background:"#1ABC9C",color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",flex:1,minWidth:140,minHeight:48}}>Export</button>
    </div>
    <p style={{fontSize:11,color:t.textDim,fontFamily:"'DM Mono',monospace",textAlign:"center",marginTop:16}}>Auto-saved to localStorage</p>
    {toast&&<div style={{position:"fixed",bottom:32,left:"50%",transform:"translateX(-50%)",padding:"12px 24px",background:"#1B9C85",color:"#fff",borderRadius:10,fontSize:13,fontWeight:600,boxShadow:"0 4px 20px rgba(0,0,0,0.25)",zIndex:1000}}>{toast}</div>}
  </div>);
}
