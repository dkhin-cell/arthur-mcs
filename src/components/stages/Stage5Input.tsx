// Stage5Input.tsx — Ported from Level 1 Stage5InputPanel.jsx
'use client';
// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";
const STORAGE_KEY = "dk-stage5-session";
function useAutoSave(s){const t=useRef(null);useEffect(()=>{clearTimeout(t.current);t.current=setTimeout(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(s))}catch(e){}},500);return()=>clearTimeout(t.current)},[s])}
function loadSaved(){try{const r=localStorage.getItem(STORAGE_KEY);if(r)return JSON.parse(r)}catch(e){}return null}
function loadCF(){const cf={};try{const s=JSON.parse(localStorage.getItem("dk-stage0-session")||"{}");cf.problem=s.problem_hypothesis||""}catch(e){}try{const s=JSON.parse(localStorage.getItem("dk-stage1-session")||"{}");cf.vision=s.vision_statement||""}catch(e){}try{const s=JSON.parse(localStorage.getItem("dk-stage2-beachhead")||"{}");cf.beachhead=s.selected||""}catch(e){}try{const s=JSON.parse(localStorage.getItem("dk-stage3-protospec")||"{}");cf.prototype=s.name?s.name+" ("+( s.fidelity||"?")+")":" "}catch(e){}try{const s=JSON.parse(localStorage.getItem("dk-stage4-roadmap")||"{}");cf.roadmap=s.milestones||""}catch(e){}try{const r=JSON.parse(localStorage.getItem("dk-stage4-brief")||"{}");cf.briefLevel=r.overrides?"Brief data exists":""}catch(e){}return cf}
export default function Stage5Input(){
  const[theme]=useState(getTheme);const t=THEMES[theme];const[mobile,setMobile]=useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(()=>{const c=()=>setMobile(window.innerWidth<700);window.addEventListener("resize",c);return()=>window.removeEventListener("resize",c)},[]);
  const cf=loadCF();const hasCF=cf.problem||cf.beachhead||cf.prototype;
  const[state,setState]=useState(()=>loadSaved()||{launchMarket:"",mvpFocus:"",timeline:"",teamAllocation:"",successCriteria:""});const[toast,setToast]=useState(null);
  useAutoSave(state);useEffect(()=>{if(toast){const tm=setTimeout(()=>setToast(null),2500);return()=>clearTimeout(tm)}},[toast]);
  const update=(k,v)=>setState(prev=>({...prev,[k]:v}));
  const fs={width:"100%",padding:"10px 12px",background:t.input,border:`1px solid ${t.cardBorder}`,borderRadius:10,fontSize:13,color:t.text,outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif",resize:"vertical"};
  const cs={padding:"8px 12px",background:"#9B59B608",border:"1px solid #9B59B620",borderRadius:8,marginBottom:6};
  return(
    <div style={{maxWidth:900,margin:"0 auto",padding:mobile?"20px 16px":"32px 24px",fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
      <div style={{marginBottom:28,borderBottom:"3px solid #9B59B6",paddingBottom:16}}>
        <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#9B59B6",fontWeight:600,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:4}}>Stage 5 · Build & Ship</p>
        <h1 style={{fontSize:mobile?24:30,fontFamily:"'Playfair Display',serif",fontWeight:800,color:t.text,margin:"0 0 6px"}}>Input Panel</h1>
        <p style={{fontSize:14,color:t.textMuted,margin:0}}>Launch context. {hasCF?"Pre-filled from Stages 0–4.":"Enter context below."}</p>
      </div>
      {hasCF&&<div style={{marginBottom:20}}>
        <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:t.textDim,margin:"0 0 8px",textTransform:"uppercase"}}>📋 Carry-Forward (read-only)</p>
        {cf.problem&&<div style={cs}><p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#9B59B6",margin:"0 0 2px",fontWeight:600}}>PROBLEM (S0)</p><p style={{fontSize:12,color:t.text,margin:0}}>{cf.problem}</p></div>}
        {cf.vision&&<div style={cs}><p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#9B59B6",margin:"0 0 2px",fontWeight:600}}>VISION (S1)</p><p style={{fontSize:12,color:t.text,margin:0}}>{cf.vision}</p></div>}
        {cf.beachhead&&<div style={cs}><p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#9B59B6",margin:"0 0 2px",fontWeight:600}}>BEACHHEAD (S2)</p><p style={{fontSize:12,color:t.text,margin:0}}>{cf.beachhead}</p></div>}
        {cf.prototype&&cf.prototype.trim()&&<div style={cs}><p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#9B59B6",margin:"0 0 2px",fontWeight:600}}>PROTOTYPE (S3)</p><p style={{fontSize:12,color:t.text,margin:0}}>{cf.prototype}</p></div>}
      </div>}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#9B59B6",margin:"0 0 4px",fontWeight:600}}>LAUNCH MARKET</p><textarea value={state.launchMarket} onChange={e=>update("launchMarket",e.target.value)} rows={2} placeholder="Where are you launching first? Specific geography, segment." style={fs}/></div>
        <div><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#9B59B6",margin:"0 0 4px",fontWeight:600}}>MVP FOCUS</p><textarea value={state.mvpFocus} onChange={e=>update("mvpFocus",e.target.value)} rows={2} placeholder="What single thing does this MVP prove?" style={fs}/></div>
        <div><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#9B59B6",margin:"0 0 4px",fontWeight:600}}>TIMELINE</p><textarea value={state.timeline} onChange={e=>update("timeline",e.target.value)} rows={2} placeholder="Launch date, key milestones, dependencies." style={fs}/></div>
        <div><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#9B59B6",margin:"0 0 4px",fontWeight:600}}>TEAM ALLOCATION</p><textarea value={state.teamAllocation} onChange={e=>update("teamAllocation",e.target.value)} rows={2} placeholder="Engineers, ops, marketing. Who's working on this?" style={fs}/></div>
        <div><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#9B59B6",margin:"0 0 4px",fontWeight:600}}>SUCCESS CRITERIA</p><textarea value={state.successCriteria} onChange={e=>update("successCriteria",e.target.value)} rows={2} placeholder="What metrics prove the beachhead converted?" style={fs}/></div>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:18}}>
        <button onClick={()=>{navigator.clipboard.writeText(JSON.stringify({stage:5,input:state,carryForward:cf,exported_at:new Date().toISOString()},null,2));setToast("Copied")}} style={{padding:"12px 20px",background:"#9B59B6",color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",flex:1,minWidth:140,minHeight:48}}>📤 Export</button>
      </div>
      <p style={{fontSize:11,color:t.textDim,fontFamily:"'DM Mono',monospace",textAlign:"center",marginTop:16}}>Auto-saved to localStorage</p>
      {toast&&<div style={{position:"fixed",bottom:32,left:"50%",transform:"translateX(-50%)",padding:"12px 24px",background:"#1B9C85",color:"#fff",borderRadius:10,fontSize:13,fontWeight:600,boxShadow:"0 4px 20px rgba(0,0,0,0.25)",zIndex:1000}}>{toast}</div>}
    </div>);
}
