// Stage4Gate.tsx — Ported from Level 1 Stage4DecisionGate.jsx
'use client';
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme, USER } from "./theme.js";
const STORAGE_KEY = "dk-stage4-gate";
const TABS = ["Planning Brief", "Readiness Criteria", "Pre-Mortem", "Risk Assessment", "Decision"];
const EXIT_CRITERIA = ["Living Brief assembled with evidence scores", "Roadmap with milestones and timeline", "DACI assigned for all key execution decisions", "OKRs with baseline, target, and confidence", "User stories with acceptance criteria", "Dependencies mapped with owners and risk", "Brief earned at least Opportunity Brief level"];
function useAutoSave(s){const t=useRef(null);useEffect(()=>{clearTimeout(t.current);t.current=setTimeout(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(s))}catch(e){}},500);return()=>clearTimeout(t.current)},[s])}
function loadSaved(){try{const r=localStorage.getItem(STORAGE_KEY);if(r)return JSON.parse(r)}catch(e){}return null}
function has(k){try{const d=localStorage.getItem(k);return d&&d!=="{}"&&d!=="null"}catch(e){return false}}
function getBriefLevel(){const g={};try{g.s0=JSON.parse(localStorage.getItem("dk-stage0-gate")||"{}").decision}catch(e){}try{g.s1=JSON.parse(localStorage.getItem("dk-stage1-gate")||"{}").decision}catch(e){}try{g.s2=JSON.parse(localStorage.getItem("dk-stage2-gate")||"{}").decision}catch(e){}try{g.s3=JSON.parse(localStorage.getItem("dk-stage3-gate")||"{}").decision}catch(e){}const hs=has("dk-stage4-stories")&&has("dk-stage4-acceptance");if(g.s0==="go"&&g.s1==="go"&&g.s2==="go"&&g.s3==="go"&&hs)return{name:"PRD",level:6,color:"#1B9C85"};if(g.s0==="go"&&g.s1==="go"&&g.s2==="go"&&g.s3==="go")return{name:"Product Brief",level:5,color:"#2ECC71"};if(g.s0==="go"&&g.s1==="go"&&g.s2==="go")return{name:"Opportunity Brief",level:4,color:"#F1C40F"};if(g.s0==="go"&&g.s1==="go")return{name:"Strategy Brief",level:3,color:"#E67E22"};if(g.s0==="go")return{name:"Problem Brief",level:2,color:"#E74C3C"};return{name:"Working Draft",level:1,color:"#95A5A6"}}

export default function Stage4Gate(){
  const[theme]=useState(getTheme);const t=THEMES[theme];const[mobile,setMobile]=useState(window.innerWidth<700);
  useEffect(()=>{const c=()=>setMobile(window.innerWidth<700);window.addEventListener("resize",c);return()=>window.removeEventListener("resize",c)},[]);
  const[tab,setTab]=useState(0);
  const[state,setState]=useState(()=>loadSaved()||{criteria:EXIT_CRITERIA.map(c=>({name:c,status:"pending"})),preMortem:[{scenario:"",likelihood:3,mitigation:""}],riskNotes:"",decision:null,notes:"",decidedAt:null,decidedBy:USER?.name||"Unknown"});
  const[toast,setToast]=useState(null);useAutoSave(state);
  useEffect(()=>{if(toast){const tm=setTimeout(()=>setToast(null),2500);return()=>clearTimeout(tm)}},[toast]);
  const passCount=state.criteria.filter(c=>c.status==="pass").length;
  const brief=getBriefLevel();
  const fs={width:"100%",padding:"8px 10px",background:t.input,border:`1px solid ${t.cardBorder}`,borderRadius:8,fontSize:12,color:t.text,outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif",resize:"vertical"};
  const autoCheck=()=>{const c=[...state.criteria];if(has("dk-stage4-brief"))c[0].status="pass";if(has("dk-stage4-roadmap"))c[1].status="pass";if(has("dk-stage4-daci"))c[2].status="pass";if(has("dk-stage4-okr"))c[3].status="pass";if(has("dk-stage4-stories")&&has("dk-stage4-acceptance"))c[4].status="pass";if(has("dk-stage4-dependencies"))c[5].status="pass";if(brief.level>=4)c[6].status="pass";setState(prev=>({...prev,criteria:c}));setToast("Auto-checked")};

  return(
    <div style={{maxWidth:940,margin:"0 auto",padding:mobile?"20px 16px":"32px 24px",fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
      <div style={{marginBottom:20,borderBottom:"3px solid #3498DB",paddingBottom:16}}>
        <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#3498DB",fontWeight:600,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:4}}>Stage 4 · Planning & Roadmap</p>
        <h1 style={{fontSize:mobile?24:30,fontFamily:"'Playfair Display',serif",fontWeight:800,color:t.text,margin:"0 0 6px"}}>Decision Gate</h1>
        <p style={{fontSize:14,color:t.textMuted,margin:0}}>Is the plan ready for execution? Document: <b style={{color:brief.color}}>{brief.name}</b> (Level {brief.level}/6)</p>
      </div>
      <div style={{marginBottom:16,padding:"10px 14px",background:t.card,border:`1px solid ${t.cardBorder}`,borderRadius:10,display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:12,fontWeight:600,color:t.text}}>Readiness</span>
        <div style={{flex:1,height:8,background:t.input,borderRadius:4,overflow:"hidden"}}><div style={{width:`${(passCount/EXIT_CRITERIA.length)*100}%`,height:"100%",background:passCount===EXIT_CRITERIA.length?"#1B9C85":"#3498DB",borderRadius:4,transition:"width 0.3s"}}/></div>
        <span style={{fontSize:13,fontWeight:700,color:"#3498DB",fontFamily:"'DM Mono',monospace"}}>{passCount}/{EXIT_CRITERIA.length}</span>
        {state.decision&&<span style={{fontSize:12,fontWeight:700,padding:"3px 10px",borderRadius:6,background:state.decision==="go"?"#1B9C8520":state.decision==="pivot"?"#E67E2220":"#E74C3C20",color:state.decision==="go"?"#1B9C85":state.decision==="pivot"?"#E67E22":"#E74C3C"}}>{state.decision.toUpperCase()}</span>}
      </div>
      <div style={{display:"flex",gap:4,marginBottom:16,flexWrap:"wrap"}}>
        {TABS.map((label,i)=>(<button key={i} onClick={()=>setTab(i)} style={{padding:"8px 16px",borderRadius:8,fontSize:12,fontWeight:tab===i?700:500,cursor:"pointer",border:`1px solid ${tab===i?"#3498DB":t.cardBorder}`,background:tab===i?"#3498DB10":"transparent",color:tab===i?"#3498DB":t.textMuted}}>{label}</button>))}
      </div>

      {tab===0&&(<div style={{padding:"16px 18px",background:t.card,border:`1px solid ${t.cardBorder}`,borderRadius:14}}>
        <h3 style={{fontSize:16,fontWeight:700,color:t.text,margin:"0 0 12px"}}>Planning Brief</h3>
        <div style={{padding:"10px 14px",background:`${brief.color}08`,border:`1px solid ${brief.color}25`,borderRadius:10,marginBottom:10}}>
          <p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:brief.color,margin:"0 0 4px"}}>DOCUMENT STATUS</p>
          <p style={{fontSize:18,fontWeight:800,color:brief.color,margin:0}}>{brief.name} — Level {brief.level}/6</p>
        </div>
        <p style={{fontSize:12,color:t.textMuted}}>Open the Living Brief Engine to see full evidence scores per section. The brief reads from all prior stages and shows green (validated), amber (data exists), or red (missing) for each section.</p>
        <button onClick={()=>window.location.href="/stage/4/gate"} style={{padding:"10px 20px",borderRadius:8,background:"#3498DB",color:"#fff",border:"none",fontSize:13,fontWeight:600,cursor:"pointer",marginTop:8}}>Open Living Brief →</button>
      </div>)}

      {tab===1&&(<div style={{padding:"16px 18px",background:t.card,border:`1px solid ${t.cardBorder}`,borderRadius:14}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}><h3 style={{fontSize:16,fontWeight:700,color:t.text,margin:0}}>Exit Criteria</h3><button onClick={autoCheck} style={{marginLeft:"auto",padding:"6px 14px",borderRadius:6,fontSize:11,fontWeight:600,background:"#3498DB10",border:"1px solid #3498DB30",color:"#3498DB",cursor:"pointer"}}>Auto-check</button></div>
        {state.criteria.map((c,i)=>(<div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"8px 0",borderBottom:i<state.criteria.length-1?`1px solid ${t.cardBorder}`:"none"}}>
          <button onClick={()=>setState(prev=>{const cr=[...prev.criteria];cr[i]={...cr[i],status:cr[i].status==="pass"?"pending":"pass"};return{...prev,criteria:cr}})} style={{fontSize:16,background:"none",border:"none",cursor:"pointer",marginTop:2}}>{c.status==="pass"?"✅":"☐"}</button>
          <span style={{fontSize:13,color:c.status==="pass"?t.text:t.textMuted,lineHeight:1.4,flex:1}}>{c.name}</span>
        </div>))}
        <p style={{fontSize:11,color:t.textDim,fontFamily:"'DM Mono',monospace",textAlign:"center",marginTop:10}}>Gates advise. They don't block. You decide.</p>
      </div>)}

      {tab===2&&(<div style={{padding:"16px 18px",background:t.card,border:`1px solid ${t.cardBorder}`,borderRadius:14}}>
        <h3 style={{fontSize:16,fontWeight:700,color:t.text,margin:"0 0 8px"}}>Pre-Mortem</h3>
        <p style={{fontSize:12,color:t.textMuted,margin:"0 0 12px"}}>The plan executed perfectly. It still failed. Why?</p>
        {state.preMortem.map((pm,i)=>(<div key={i} style={{marginBottom:10,padding:"10px 12px",background:t.input,borderRadius:10,border:`1px solid ${t.cardBorder}`}}>
          <textarea value={pm.scenario} onChange={e=>setState(prev=>{const p=[...prev.preMortem];p[i]={...p[i],scenario:e.target.value};return{...prev,preMortem:p}})} rows={2} placeholder="Failure scenario..." style={{...fs,marginBottom:6}}/>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={{fontSize:11,color:t.textDim}}>Likelihood:</span>{[1,2,3,4,5].map(v=>(<button key={v} onClick={()=>setState(prev=>{const p=[...prev.preMortem];p[i]={...p[i],likelihood:v};return{...prev,preMortem:p}})} style={{width:28,height:28,borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",border:"none",background:pm.likelihood>=v?"#E74C3C":t.card,color:pm.likelihood>=v?"#fff":t.textMuted}}>{v}</button>))}</div>
          <textarea value={pm.mitigation} onChange={e=>setState(prev=>{const p=[...prev.preMortem];p[i]={...p[i],mitigation:e.target.value};return{...prev,preMortem:p}})} rows={1} placeholder="Mitigation..." style={fs}/>
        </div>))}
        <button onClick={()=>setState(prev=>({...prev,preMortem:[...prev.preMortem,{scenario:"",likelihood:3,mitigation:""}]}))} style={{width:"100%",padding:"10px",background:"none",border:`1px dashed ${t.cardBorder}`,borderRadius:8,fontSize:12,color:t.textMuted,cursor:"pointer"}}>+ Add Scenario</button>
      </div>)}

      {tab===3&&(<div style={{padding:"16px 18px",background:t.card,border:`1px solid ${t.cardBorder}`,borderRadius:14}}>
        <h3 style={{fontSize:16,fontWeight:700,color:t.text,margin:"0 0 8px"}}>Risk Assessment</h3>
        <p style={{fontSize:12,color:t.textMuted,margin:"0 0 12px"}}>What are the execution risks? Technical, resource, timeline, market.</p>
        <textarea value={state.riskNotes} onChange={e=>setState(prev=>({...prev,riskNotes:e.target.value}))} rows={6} placeholder="Document execution risks, mitigation strategies, and contingency plans..." style={fs}/>
      </div>)}

      {tab===4&&(<div style={{padding:"16px 18px",background:t.card,border:`1px solid ${t.cardBorder}`,borderRadius:14}}>
        <h3 style={{fontSize:16,fontWeight:700,color:t.text,margin:"0 0 12px"}}>GO / PIVOT / KILL</h3>
        <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr 1fr",gap:10,marginBottom:16}}>
          {[{key:"go",label:"GO",color:"#1B9C85",desc:"Plan is solid. Evidence supports execution. Ship it."},{key:"pivot",label:"PIVOT",color:"#E67E22",desc:"Plan needs revision. Key gaps or risks unresolved. Iterate before committing."},{key:"kill",label:"KILL",color:"#E74C3C",desc:"Plan doesn't hold up. Return to earlier stages and reconsider."}].map(d=>(<button key={d.key} onClick={()=>setState(prev=>({...prev,decision:d.key,decidedAt:new Date().toISOString(),decidedBy:USER?.name||"Unknown"}))} style={{padding:"16px 14px",borderRadius:12,cursor:"pointer",border:`2px solid ${state.decision===d.key?d.color:t.cardBorder}`,background:state.decision===d.key?`${d.color}10`:"transparent",textAlign:"left"}}><span style={{fontSize:18,fontWeight:800,color:d.color,display:"block",marginBottom:6}}>{d.label}</span><span style={{fontSize:11,color:t.textMuted,lineHeight:1.4}}>{d.desc}</span></button>))}
        </div>
        <textarea value={state.notes} onChange={e=>setState(prev=>({...prev,notes:e.target.value}))} rows={3} placeholder="Decision rationale..." style={{...fs,marginBottom:12}}/>
        {state.decision&&(<div style={{padding:"12px 16px",background:state.decision==="go"?"#1B9C8510":state.decision==="pivot"?"#E67E2210":"#E74C3C10",borderRadius:10,border:`1px solid ${state.decision==="go"?"#1B9C8530":state.decision==="pivot"?"#E67E2230":"#E74C3C30"}`}}>
          <p style={{fontSize:13,fontWeight:700,color:state.decision==="go"?"#1B9C85":state.decision==="pivot"?"#E67E22":"#E74C3C",margin:"0 0 4px"}}>Stage 4 Verdict: {state.decision.toUpperCase()}</p>
          <p style={{fontSize:11,color:t.textDim,margin:0}}>{state.decidedAt?`Decided ${new Date(state.decidedAt).toLocaleDateString()} by ${state.decidedBy}`:""}</p>
        </div>)}
        <p style={{fontSize:11,color:t.textDim,fontFamily:"'DM Mono',monospace",textAlign:"center",marginTop:12}}>Gates advise. You decide.</p>
      </div>)}

      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:16}}>
        <button onClick={()=>{navigator.clipboard.writeText(JSON.stringify({stage:4,gate:state,brief:brief,exported_at:new Date().toISOString()},null,2));setToast("Copied")}} style={{padding:"12px 20px",background:"#3498DB",color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",flex:1,minWidth:140,minHeight:48}}>📤 Export Gate</button>
      </div>
      <p style={{fontSize:11,color:t.textDim,fontFamily:"'DM Mono',monospace",textAlign:"center",marginTop:16}}>Auto-saved to localStorage</p>
      {toast&&<div style={{position:"fixed",bottom:32,left:"50%",transform:"translateX(-50%)",padding:"12px 24px",background:"#1B9C85",color:"#fff",borderRadius:10,fontSize:13,fontWeight:600,boxShadow:"0 4px 20px rgba(0,0,0,0.25)",zIndex:1000}}>{toast}</div>}
    </div>);
}
