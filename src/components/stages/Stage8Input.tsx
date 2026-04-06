// Stage8Input.tsx — Ported from Level 1 Stage8InputPanel.jsx
'use client';
// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";
const STORAGE_KEY = "dk-stage8-session";
function useAutoSave(s){const t=useRef(null);useEffect(()=>{clearTimeout(t.current);t.current=setTimeout(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(s))}catch(e){}},500);return()=>clearTimeout(t.current)},[s])}
function loadSaved(){try{const r=localStorage.getItem(STORAGE_KEY);if(r)return JSON.parse(r)}catch(e){}return null}
function loadCF(){const cf={};try{const s=JSON.parse(localStorage.getItem("dk-stage7-health")||"{}");cf.health=s.kpi1||""}catch(e){}try{const s=JSON.parse(localStorage.getItem("dk-stage7-satisfaction")||"{}");cf.nps=s.nps||""}catch(e){}try{cf.gateResult=JSON.parse(localStorage.getItem("dk-stage7-gate")||"{}").decision||""}catch(e){}return cf}
export default function Stage8Input(){
  const[theme]=useState(getTheme);const t=THEMES[theme];const[mobile,setMobile]=useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(()=>{const c=()=>setMobile(window.innerWidth<700);window.addEventListener("resize",c);return()=>window.removeEventListener("resize",c)},[]);
  const cf=loadCF();const hasCF=cf.health||cf.nps||cf.gateResult;
  const[state,setState]=useState(()=>loadSaved()||{portfolioContext:"",capitalDeployed:"",returns:"",alternatives:"",exitCost:""});const[toast,setToast]=useState(null);
  useAutoSave(state);useEffect(()=>{if(toast){const tm=setTimeout(()=>setToast(null),2500);return()=>clearTimeout(tm)}},[toast]);
  const update=(k,v)=>setState(prev=>({...prev,[k]:v}));
  const fs={width:"100%",padding:"10px 12px",background:t.input,border:`1px solid ${t.cardBorder}`,borderRadius:10,fontSize:13,color:t.text,outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif",resize:"vertical"};
  const cs={padding:"8px 12px",background:"#34495E08",border:"1px solid #34495E20",borderRadius:8,marginBottom:6};
  return(
    <div style={{maxWidth:900,margin:"0 auto",padding:mobile?"20px 16px":"32px 24px",fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
      <div style={{marginBottom:28,borderBottom:"3px solid #34495E",paddingBottom:16}}>
        <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#34495E",fontWeight:600,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:4}}>Stage 8 · Portfolio & Investment</p>
        <h1 style={{fontSize:mobile?24:30,fontFamily:"'Playfair Display',serif",fontWeight:800,color:t.text,margin:"0 0 6px"}}>Input Panel</h1>
        <p style={{fontSize:14,color:t.textMuted,margin:0}}>Portfolio context. {hasCF?"Pre-filled from Stage 7.":"Enter context below."}</p>
      </div>
      {hasCF&&<div style={{marginBottom:20}}>
        <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:t.textDim,margin:"0 0 8px",textTransform:"uppercase"}}>📋 Carry-Forward from Stage 7</p>
        {cf.health&&<div style={cs}><p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#34495E",margin:"0 0 2px",fontWeight:600}}>HEALTH STATUS</p><p style={{fontSize:12,color:t.text,margin:0}}>{cf.health}</p></div>}
        {cf.nps&&<div style={cs}><p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#34495E",margin:"0 0 2px",fontWeight:600}}>USER SATISFACTION</p><p style={{fontSize:12,color:t.text,margin:0}}>{cf.nps}</p></div>}
        {cf.gateResult&&<div style={cs}><p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#34495E",margin:"0 0 2px",fontWeight:600}}>STAGE 7 GATE</p><p style={{fontSize:12,color:t.text,margin:0}}>{cf.gateResult.toUpperCase()}</p></div>}
      </div>}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#34495E",margin:"0 0 4px",fontWeight:600}}>PORTFOLIO CONTEXT</p><textarea value={state.portfolioContext} onChange={e=>update("portfolioContext",e.target.value)} rows={2} placeholder="What other bets does the company have?" style={fs}/></div>
        <div><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#34495E",margin:"0 0 4px",fontWeight:600}}>CAPITAL DEPLOYED</p><textarea value={state.capitalDeployed} onChange={e=>update("capitalDeployed",e.target.value)} rows={2} placeholder="Total investment to date." style={fs}/></div>
        <div><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#34495E",margin:"0 0 4px",fontWeight:600}}>RETURNS</p><textarea value={state.returns} onChange={e=>update("returns",e.target.value)} rows={2} placeholder="Revenue, strategic value, org learning." style={fs}/></div>
        <div><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#34495E",margin:"0 0 4px",fontWeight:600}}>ALTERNATIVES</p><textarea value={state.alternatives} onChange={e=>update("alternatives",e.target.value)} rows={2} placeholder="Where else could this capital go?" style={fs}/></div>
        <div><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#34495E",margin:"0 0 4px",fontWeight:600}}>EXIT COST</p><textarea value={state.exitCost} onChange={e=>update("exitCost",e.target.value)} rows={2} placeholder="What would it cost to wind down? Contracts, team, brand." style={fs}/></div>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:18}}>
        <button onClick={()=>{navigator.clipboard.writeText(JSON.stringify({stage:8,input:state,carryForward:cf,exported_at:new Date().toISOString()},null,2));setToast("Copied")}} style={{padding:"12px 20px",background:"#34495E",color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",flex:1,minWidth:140,minHeight:48}}>📤 Export</button>
      </div>
      <p style={{fontSize:11,color:t.textDim,fontFamily:"'DM Mono',monospace",textAlign:"center",marginTop:16}}>Auto-saved to localStorage</p>
      {toast&&<div style={{position:"fixed",bottom:32,left:"50%",transform:"translateX(-50%)",padding:"12px 24px",background:"#1B9C85",color:"#fff",borderRadius:10,fontSize:13,fontWeight:600,boxShadow:"0 4px 20px rgba(0,0,0,0.25)",zIndex:1000}}>{toast}</div>}
    </div>);
}
