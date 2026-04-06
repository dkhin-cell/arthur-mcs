// Stage7Input.tsx — Ported from Level 1 Stage7InputPanel.jsx
'use client';
// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";
const STORAGE_KEY = "dk-stage7-session";
function useAutoSave(s){const t=useRef(null);useEffect(()=>{clearTimeout(t.current);t.current=setTimeout(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(s))}catch(e){}},500);return()=>clearTimeout(t.current)},[s])}
function loadSaved(){try{const r=localStorage.getItem(STORAGE_KEY);if(r)return JSON.parse(r)}catch(e){}return null}
function loadCF(){const cf={};try{const s=JSON.parse(localStorage.getItem("dk-stage6-performance")||"{}");cf.performance=s.trend||""}catch(e){}try{const s=JSON.parse(localStorage.getItem("dk-stage6-expansion")||"{}");cf.expansion=s.market1||""}catch(e){}try{cf.gateResult=JSON.parse(localStorage.getItem("dk-stage6-gate")||"{}").decision||""}catch(e){}return cf}
export default function Stage7Input(){
  const[theme]=useState(getTheme);const t=THEMES[theme];const[mobile,setMobile]=useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(()=>{const c=()=>setMobile(window.innerWidth<700);window.addEventListener("resize",c);return()=>window.removeEventListener("resize",c)},[]);
  const cf=loadCF();const hasCF=cf.performance||cf.expansion||cf.gateResult;
  const[state,setState]=useState(()=>loadSaved()||{currentState:"",concerns:"",competitiveChanges:"",teamStatus:"",investmentNeeds:""});const[toast,setToast]=useState(null);
  useAutoSave(state);useEffect(()=>{if(toast){const tm=setTimeout(()=>setToast(null),2500);return()=>clearTimeout(tm)}},[toast]);
  const update=(k,v)=>setState(prev=>({...prev,[k]:v}));
  const fs={width:"100%",padding:"10px 12px",background:t.input,border:`1px solid ${t.cardBorder}`,borderRadius:10,fontSize:13,color:t.text,outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif",resize:"vertical"};
  const cs={padding:"8px 12px",background:"#C0392B08",border:"1px solid #C0392B20",borderRadius:8,marginBottom:6};
  return(
    <div style={{maxWidth:900,margin:"0 auto",padding:mobile?"20px 16px":"32px 24px",fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
      <div style={{marginBottom:28,borderBottom:"3px solid #C0392B",paddingBottom:16}}>
        <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#C0392B",fontWeight:600,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:4}}>Stage 7 · Maturity & Maintenance</p>
        <h1 style={{fontSize:mobile?24:30,fontFamily:"'Playfair Display',serif",fontWeight:800,color:t.text,margin:"0 0 6px"}}>Input Panel</h1>
        <p style={{fontSize:14,color:t.textMuted,margin:0}}>Current product health. {hasCF?"Pre-filled from Stage 6.":"Enter context below."}</p>
      </div>
      {hasCF&&<div style={{marginBottom:20}}>
        <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:t.textDim,margin:"0 0 8px",textTransform:"uppercase"}}>📋 Carry-Forward from Stage 6</p>
        {cf.performance&&<div style={cs}><p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#C0392B",margin:"0 0 2px",fontWeight:600}}>PERFORMANCE TREND</p><p style={{fontSize:12,color:t.text,margin:0}}>{cf.performance}</p></div>}
        {cf.expansion&&<div style={cs}><p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#C0392B",margin:"0 0 2px",fontWeight:600}}>EXPANSION STATUS</p><p style={{fontSize:12,color:t.text,margin:0}}>{cf.expansion}</p></div>}
        {cf.gateResult&&<div style={cs}><p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#C0392B",margin:"0 0 2px",fontWeight:600}}>STAGE 6 GATE</p><p style={{fontSize:12,color:t.text,margin:0}}>{cf.gateResult.toUpperCase()}</p></div>}
      </div>}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#C0392B",margin:"0 0 4px",fontWeight:600}}>CURRENT STATE</p><textarea value={state.currentState} onChange={e=>update("currentState",e.target.value)} rows={2} placeholder="How is the product performing? Key metrics and trends." style={fs}/></div>
        <div><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#C0392B",margin:"0 0 4px",fontWeight:600}}>CONCERNS</p><textarea value={state.concerns} onChange={e=>update("concerns",e.target.value)} rows={2} placeholder="What worries you about trajectory?" style={fs}/></div>
        <div><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#C0392B",margin:"0 0 4px",fontWeight:600}}>COMPETITIVE CHANGES</p><textarea value={state.competitiveChanges} onChange={e=>update("competitiveChanges",e.target.value)} rows={2} placeholder="What have competitors done recently?" style={fs}/></div>
        <div><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#C0392B",margin:"0 0 4px",fontWeight:600}}>TEAM STATUS</p><textarea value={state.teamStatus} onChange={e=>update("teamStatus",e.target.value)} rows={2} placeholder="Morale, attrition, tech debt." style={fs}/></div>
        <div><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#C0392B",margin:"0 0 4px",fontWeight:600}}>INVESTMENT NEEDS</p><textarea value={state.investmentNeeds} onChange={e=>update("investmentNeeds",e.target.value)} rows={2} placeholder="What does this product need to stay competitive?" style={fs}/></div>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:18}}>
        <button onClick={()=>{navigator.clipboard.writeText(JSON.stringify({stage:7,input:state,carryForward:cf,exported_at:new Date().toISOString()},null,2));setToast("Copied")}} style={{padding:"12px 20px",background:"#C0392B",color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",flex:1,minWidth:140,minHeight:48}}>📤 Export</button>
      </div>
      <p style={{fontSize:11,color:t.textDim,fontFamily:"'DM Mono',monospace",textAlign:"center",marginTop:16}}>Auto-saved to localStorage</p>
      {toast&&<div style={{position:"fixed",bottom:32,left:"50%",transform:"translateX(-50%)",padding:"12px 24px",background:"#1B9C85",color:"#fff",borderRadius:10,fontSize:13,fontWeight:600,boxShadow:"0 4px 20px rgba(0,0,0,0.25)",zIndex:1000}}>{toast}</div>}
    </div>);
}
