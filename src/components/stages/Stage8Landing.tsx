// Stage8Landing.tsx — Ported from Level 1 Stage8Landing.jsx
'use client';
// @ts-nocheck
import { useState, useEffect } from "react";
import { THEMES, getTheme } from "@/lib/theme";
const COLOR = "#34495E";
const GROUPS = [{"title": "Input", "items": [{"name": "Input Panel", "route": "#/stage8/input", "key": "dk-stage8-session"}]}, {"title": "Analysis", "items": [{"name": "Portfolio Allocation View", "route": "#/stage8/portfolio", "key": "dk-stage8-portfolio"}, {"name": "Opportunity Cost Analysis", "route": "#/stage8/opportunity", "key": "dk-stage8-opportunity"}]}, {"title": "Decision Criteria", "items": [{"name": "Strategic Kill Criteria", "route": "#/stage8/kill-criteria", "key": "dk-stage8-killcriteria"}, {"name": "Investment Horizon", "route": "#/stage8/horizon", "key": "dk-stage8-horizon"}, {"name": "Organizational Impact", "route": "#/stage8/impact", "key": "dk-stage8-impact"}]}, {"title": "Decision Gate", "items": [{"name": "Stage 8 Decision Gate", "route": "#/stage8/gate", "key": "dk-stage8-gate", "isGate": true}]}];
const READINESS = ["Portfolio allocation compared to other bets", "Opportunity cost analysis with named alternatives", "Strategic kill criteria pre-defined", "Investment horizon set with review cadence", "Organizational impact documented", "Exit cost estimated"];
function hasData(key){try{const d=localStorage.getItem(key);return d&&d!=="{}"&&d!=="null"}catch(e){return false}}
export default function Stage8Landing(){
  const[theme]=useState(getTheme);const t=THEMES[theme];const[mobile,setMobile]=useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(()=>{const c=()=>setMobile(window.innerWidth<700);window.addEventListener("resize",c);return()=>window.removeEventListener("resize",c)},[]);
  const allItems=GROUPS.flatMap(g=>g.items);const touched=allItems.filter(i=>hasData(i.key)).length;
  const gate=(()=>{try{return JSON.parse(localStorage.getItem("dk-stage8-gate")||"{}")}catch(e){return{}}})();
  const readinessPass=READINESS.filter((_,i)=>{const keys=allItems.filter(it=>!it.isGate).map(it=>it.key);return i<keys.length&&hasData(keys[i])}).length;
  const recommended=allItems.find(i=>!hasData(i.key))||allItems[allItems.length-1];
  return(
    <div style={{maxWidth:900,margin:"0 auto",padding:mobile?"20px 16px":"32px 24px",fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet"/>
      <a href="#/" style={{fontSize:13,color:"#2980B9",textDecoration:"none",display:"inline-block",marginBottom:16}}>← Back To Arthur PM MCS</a>
      <div style={{marginBottom:24}}>
        <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:COLOR,fontWeight:600,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:4}}>🏛️ STAGE 8</p>
        <h1 style={{fontSize:mobile?28:36,fontFamily:"'Playfair Display',serif",fontWeight:900,color:t.text,margin:"0 0 8px"}}>Portfolio & Investment</h1>
        <p style={{fontSize:16,color:t.textMuted,margin:0,fontStyle:"italic"}}>Does this product earn its share of capital and attention?</p>
        <div style={{width:60,height:4,background:COLOR,borderRadius:2,marginTop:12}}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:mobile?"1fr 1fr":"1fr 1fr 1fr 1fr",gap:10,marginBottom:20}}>
        {[{label:"Artifacts Touched",value:touched+"/"+allItems.length},{label:"Readiness Criteria",value:readinessPass+"/"+READINESS.length},{label:"Gate Status",value:gate.decision?gate.decision.toUpperCase():"Pending"},{label:"Decision",value:gate.decision?gate.decision.toUpperCase():"—"}].map((s,i)=>(
          <div key={i} style={{padding:"14px 16px",background:t.card,border:"1px solid "+t.cardBorder,borderRadius:12}}>
            <p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:t.textDim,margin:"0 0 4px",textTransform:"uppercase"}}>{s.label}</p>
            <p style={{fontSize:22,fontWeight:800,color:COLOR,margin:0,fontFamily:"'DM Mono',monospace"}}>{s.value}</p>
          </div>))}
      </div>
      <div onClick={()=>window.location.href=recommended.route} style={{padding:"14px 18px",background:COLOR+"10",border:"1px solid "+COLOR+"30",borderRadius:12,marginBottom:20,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:12,color:COLOR,fontFamily:"'DM Mono',monospace",fontWeight:600}}>→ RECOMMENDED NEXT:</span>
        <span style={{fontSize:14,fontWeight:600,color:t.text}}>{recommended.name}</span>
      </div>
      {GROUPS.map((group,gi)=>(
        <div key={gi} style={{marginBottom:18}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:t.textDim,margin:0,textTransform:"uppercase",letterSpacing:"0.1em"}}>{group.title}</p>
            <span style={{fontSize:10,color:COLOR,fontFamily:"'DM Mono',monospace"}}>{group.items.filter(i=>hasData(i.key)).length}/{group.items.length}</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:10}}>
            {group.items.map((item,ii)=>{const active=hasData(item.key);return(
              <div key={ii} onClick={()=>window.location.href=item.route} style={{padding:"16px 18px",background:t.card,border:"1px solid "+(active?COLOR+"40":t.cardBorder),borderRadius:14,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.borderColor=COLOR}}
                onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.borderColor=active?COLOR+"40":t.cardBorder}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:active?COLOR:t.cardBorder,flexShrink:0}}/>
                <span style={{fontSize:15,fontWeight:600,color:t.text,flex:1}}>{item.name}</span>
                {active&&<span style={{fontSize:10,color:COLOR,fontFamily:"'DM Mono',monospace"}}>✓</span>}
                <span style={{color:t.textDim,fontSize:14}}>→</span>
              </div>)})}
          </div>
          {gi<GROUPS.length-1&&<div style={{display:"flex",justifyContent:"center",padding:"8px 0"}}><span style={{fontSize:16,color:t.cardBorder}}>↓</span></div>}
        </div>))}
      <div style={{padding:"16px 18px",background:t.card,border:"1px solid "+t.cardBorder,borderRadius:14,marginTop:16}}>
        <p style={{fontSize:13,fontWeight:700,color:t.text,margin:"0 0 10px"}}>🚦 Readiness ({readinessPass}/{READINESS.length})</p>
        {READINESS.map((c,i)=><div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"4px 0"}}><span style={{fontSize:14}}>☐</span><span style={{fontSize:13,color:t.textMuted}}>{c}</span></div>)}
        <p style={{fontSize:11,color:t.textDim,fontFamily:"'DM Mono',monospace",textAlign:"center",marginTop:8}}>Gates advise. They don't block. You decide.</p>
      </div>
      <div style={{marginTop:32,textAlign:"center",paddingTop:16,borderTop:"1px solid "+t.cardBorder}}>
        <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:t.textDim}}>© 2026 Arthur · Mission Control System</p>
      </div>
    </div>);
}
