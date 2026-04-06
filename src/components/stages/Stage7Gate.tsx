// Stage7Gate.tsx — Ported from Level 1 Stage7DecisionGate.jsx
'use client';
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme, USER } from "@/lib/theme";
const STORAGE_KEY = "dk-stage7-gate";
const READINESS = ["KPI trends documented (not just snapshots)", "Feature deprecation audit complete", "Competitive landscape updated this month", "User satisfaction tracked with churn reasons", "Refresh/investment plan defined", "Tech debt status assessed"];
function useAutoSave(s){const t=useRef(null);useEffect(()=>{clearTimeout(t.current);t.current=setTimeout(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(s))}catch(e){}},500);return()=>clearTimeout(t.current)},[s])}
function loadSaved(){try{const r=localStorage.getItem(STORAGE_KEY);if(r)return JSON.parse(r)}catch(e){}return null}
export default function Stage7Gate(){
  const[theme]=useState(getTheme);const t=THEMES[theme];const[mobile,setMobile]=useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(()=>{const c=()=>setMobile(window.innerWidth<700);window.addEventListener("resize",c);return()=>window.removeEventListener("resize",c)},[]);
  const[state,setState]=useState(()=>loadSaved()||{criteria:READINESS.map(c=>({name:c,status:"pending"})),preMortem:[{scenario:"",likelihood:3,mitigation:""}],decision:null,notes:"",decidedAt:null,decidedBy:USER?.name||"Unknown"});
  const[toast,setToast]=useState(null);const[tab,setTab]=useState(0);useAutoSave(state);
  useEffect(()=>{if(toast){const tm=setTimeout(()=>setToast(null),2500);return()=>clearTimeout(tm)}},[toast]);
  const passCount=state.criteria.filter(c=>c.status==="pass").length;
  const fs={width:"100%",padding:"8px 10px",background:t.input,border:"1px solid "+t.cardBorder,borderRadius:8,fontSize:12,color:t.text,outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif",resize:"vertical"};
  const TABS=["Readiness","Pre-Mortem","Decision"];
  return(<div style={{maxWidth:940,margin:"0 auto",padding:mobile?"20px 16px":"32px 24px",fontFamily:"'DM Sans',sans-serif"}}>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
    <div style={{marginBottom:20,borderBottom:"3px solid #C0392B",paddingBottom:16}}>
      <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#C0392B",fontWeight:600,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:4}}>Stage 7 · Maturity & Maintenance</p>
      <h1 style={{fontSize:mobile?24:30,fontFamily:"'Playfair Display',serif",fontWeight:800,color:t.text,margin:"0 0 6px"}}>Decision Gate</h1>
      <p style={{fontSize:14,color:t.textMuted,margin:0}}>Is this product still performing — or is it drifting?</p>
    </div>
    <div style={{marginBottom:16,padding:"10px 14px",background:t.card,border:"1px solid "+t.cardBorder,borderRadius:10,display:"flex",alignItems:"center",gap:12}}>
      <span style={{fontSize:12,fontWeight:600,color:t.text}}>Readiness</span>
      <div style={{flex:1,height:8,background:t.input,borderRadius:4,overflow:"hidden"}}><div style={{width:(passCount/READINESS.length*100)+"%",height:"100%",background:"#C0392B",borderRadius:4}}/></div>
      <span style={{fontSize:13,fontWeight:700,color:"#C0392B",fontFamily:"'DM Mono',monospace"}}>{passCount}/{READINESS.length}</span>
      {state.decision&&<span style={{fontSize:12,fontWeight:700,padding:"3px 10px",borderRadius:6,background:state.decision==="go"?"#1B9C8520":state.decision==="pivot"?"#E67E2220":"#C0392B20",color:state.decision==="go"?"#1B9C85":state.decision==="pivot"?"#E67E22":"#C0392B"}}>{state.decision.toUpperCase()}</span>}
    </div>
    <div style={{display:"flex",gap:4,marginBottom:16}}>
      {TABS.map((l,i)=><button key={i} onClick={()=>setTab(i)} style={{padding:"8px 16px",borderRadius:8,fontSize:12,fontWeight:tab===i?700:500,cursor:"pointer",border:"1px solid "+(tab===i?"#C0392B":t.cardBorder),background:tab===i?"#C0392B10":"transparent",color:tab===i?"#C0392B":t.textMuted}}>{l}</button>)}
    </div>
    {tab===0&&<div style={{padding:"16px 18px",background:t.card,border:"1px solid "+t.cardBorder,borderRadius:14}}>
      {state.criteria.map((c,i)=><div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"8px 0",borderBottom:i<state.criteria.length-1?"1px solid "+t.cardBorder:"none"}}>
        <button onClick={()=>setState(prev=>{const cr=[...prev.criteria];cr[i]={...cr[i],status:cr[i].status==="pass"?"pending":"pass"};return{...prev,criteria:cr}})} style={{fontSize:16,background:"none",border:"none",cursor:"pointer"}}>{c.status==="pass"?"✅":"☐"}</button>
        <span style={{fontSize:13,color:c.status==="pass"?t.text:t.textMuted,flex:1}}>{c.name}</span>
      </div>)}
      <p style={{fontSize:11,color:t.textDim,fontFamily:"'DM Mono',monospace",textAlign:"center",marginTop:10}}>Gates advise. They don't block. You decide.</p>
    </div>}
    {tab===1&&<div style={{padding:"16px 18px",background:t.card,border:"1px solid "+t.cardBorder,borderRadius:14}}>
      <h3 style={{fontSize:16,fontWeight:700,color:t.text,margin:"0 0 12px"}}>Pre-Mortem</h3>
      {state.preMortem.map((pm,i)=><div key={i} style={{marginBottom:10,padding:"10px 12px",background:t.input,borderRadius:10}}>
        <textarea value={pm.scenario} onChange={e=>setState(prev=>{const p=[...prev.preMortem];p[i]={...p[i],scenario:e.target.value};return{...prev,preMortem:p}})} rows={2} placeholder="Failure scenario..." style={fs}/>
        <textarea value={pm.mitigation} onChange={e=>setState(prev=>{const p=[...prev.preMortem];p[i]={...p[i],mitigation:e.target.value};return{...prev,preMortem:p}})} rows={1} placeholder="Mitigation..." style={{...fs,marginTop:4}}/>
      </div>)}
      <button onClick={()=>setState(prev=>({...prev,preMortem:[...prev.preMortem,{scenario:"",likelihood:3,mitigation:""}]}))} style={{width:"100%",padding:"8px",background:"none",border:"1px dashed "+t.cardBorder,borderRadius:8,fontSize:12,color:t.textMuted,cursor:"pointer"}}>+ Add</button>
    </div>}
    {tab===2&&<div style={{padding:"16px 18px",background:t.card,border:"1px solid "+t.cardBorder,borderRadius:14}}>
      <h3 style={{fontSize:16,fontWeight:700,color:t.text,margin:"0 0 12px"}}>GO / PIVOT / KILL</h3>
      <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr 1fr",gap:10,marginBottom:16}}>
        {[{key:"go",label:"GO",color:"#1B9C85"},{key:"pivot",label:"PIVOT",color:"#E67E22"},{key:"kill",label:"KILL",color:"#C0392B"}].map(d=><button key={d.key} onClick={()=>setState(prev=>({...prev,decision:d.key,decidedAt:new Date().toISOString(),decidedBy:USER?.name||"Unknown"}))} style={{padding:"16px",borderRadius:12,cursor:"pointer",border:"2px solid "+(state.decision===d.key?d.color:t.cardBorder),background:state.decision===d.key?d.color+"10":"transparent",textAlign:"left"}}><span style={{fontSize:18,fontWeight:800,color:d.color}}>{d.label}</span></button>)}
      </div>
      <textarea value={state.notes} onChange={e=>setState(prev=>({...prev,notes:e.target.value}))} rows={3} placeholder="Decision rationale..." style={fs}/>
      {state.decision&&<div style={{marginTop:12,padding:"12px 16px",background:state.decision==="go"?"#1B9C8510":state.decision==="pivot"?"#E67E2210":"#C0392B10",borderRadius:10}}>
        <p style={{fontSize:13,fontWeight:700,color:state.decision==="go"?"#1B9C85":state.decision==="pivot"?"#E67E22":"#C0392B",margin:"0 0 4px"}}>Stage 7 Verdict: {state.decision.toUpperCase()}</p>
        <p style={{fontSize:11,color:t.textDim,margin:0}}>{state.decidedAt?"Decided "+new Date(state.decidedAt).toLocaleDateString()+" by "+state.decidedBy:""}</p>
      </div>}
    </div>}
    <div style={{display:"flex",gap:8,marginTop:16}}>
      <button onClick={()=>{navigator.clipboard.writeText(JSON.stringify({stage:7,gate:state,exported_at:new Date().toISOString()},null,2));setToast("Copied")}} style={{padding:"12px 20px",background:"#C0392B",color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",flex:1,minHeight:48}}>Export Gate</button>
    </div>
    <p style={{fontSize:11,color:t.textDim,fontFamily:"'DM Mono',monospace",textAlign:"center",marginTop:16}}>Auto-saved</p>
    {toast&&<div style={{position:"fixed",bottom:32,left:"50%",transform:"translateX(-50%)",padding:"12px 24px",background:"#1B9C85",color:"#fff",borderRadius:10,fontSize:13,fontWeight:600,boxShadow:"0 4px 20px rgba(0,0,0,0.25)",zIndex:1000}}>{toast}</div>}
  </div>);
}
