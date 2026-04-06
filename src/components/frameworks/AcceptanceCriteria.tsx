// AcceptanceCriteria.tsx — Ported from Level 1 AcceptanceCriteria.jsx
'use client';
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";
const STORAGE_KEY = "dk-stage4-acceptance";
const EMPTY = { story: "", given: "", when: "", then: "", priority: "must", notes: "" };
const PRIORITIES = [{ key: "must", label: "Must", color: "#E74C3C" }, { key: "should", label: "Should", color: "#E67E22" }, { key: "could", label: "Could", color: "#95A5A6" }];
function useAutoSave(s){const t=useRef(null);useEffect(()=>{clearTimeout(t.current);t.current=setTimeout(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(s))}catch(e){}},500);return()=>clearTimeout(t.current)},[s])}
function loadSaved(){try{const r=localStorage.getItem(STORAGE_KEY);if(r)return JSON.parse(r)}catch(e){}return null}
export default function AcceptanceCriteria(){
  const[theme]=useState(getTheme);const t=THEMES[theme];const[mobile,setMobile]=useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(()=>{const c=()=>setMobile(window.innerWidth<700);window.addEventListener("resize",c);return()=>window.removeEventListener("resize",c)},[]);
  const[state,setState]=useState(()=>loadSaved()||{criteria:[{...EMPTY}]});const[toast,setToast]=useState(null);
  useAutoSave(state);useEffect(()=>{if(toast){const tm=setTimeout(()=>setToast(null),2500);return()=>clearTimeout(tm)}},[toast]);
  const update=(i,k,v)=>setState(prev=>{const c=[...prev.criteria];c[i]={...c[i],[k]:v};return{...prev,criteria:c}});
  const add=()=>setState(prev=>({...prev,criteria:[...prev.criteria,{...EMPTY}]}));
  const remove=(i)=>setState(prev=>({...prev,criteria:prev.criteria.filter((_,j)=>j!==i)}));
  const fs={width:"100%",padding:"8px 10px",background:t.input,border:`1px solid ${t.cardBorder}`,borderRadius:8,fontSize:12,color:t.text,outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif"};
  const exportLinear=()=>{let md="";state.criteria.forEach((c,i)=>{md+=`## AC${i+1}: ${c.story||"Untitled"}\n`;md+=`**Given** ${c.given}\n**When** ${c.when}\n**Then** ${c.then}\n`;if(c.notes)md+=`> ${c.notes}\n`;md+=`Priority: ${c.priority}\n\n`});navigator.clipboard.writeText(md);setToast("Linear-format Markdown copied")};
  return(
    <div style={{maxWidth:900,margin:"0 auto",padding:mobile?"20px 16px":"32px 24px",fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
      <div style={{marginBottom:28,borderBottom:"3px solid #3498DB",paddingBottom:16}}>
        <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#3498DB",fontWeight:600,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:4}}>Stage 4 · Planning & Roadmap</p>
        <h1 style={{fontSize:mobile?24:30,fontFamily:"'Playfair Display',serif",fontWeight:800,color:t.text,margin:"0 0 6px"}}>Acceptance Criteria</h1>
        <p style={{fontSize:14,color:t.textMuted,margin:0}}>Given / When / Then — define what "done" means for each story.</p>
      </div>
      {state.criteria.map((ac,i)=>{const pr=PRIORITIES.find(p=>p.key===ac.priority)||PRIORITIES[0];return(
        <div key={i} style={{marginBottom:10,background:t.card,border:`1px solid ${pr.color}25`,borderRadius:14,borderLeft:`4px solid ${pr.color}`,overflow:"hidden"}}>
          <div style={{padding:"10px 14px",borderBottom:`1px solid ${t.cardBorder}`,display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:12,fontWeight:800,color:"#3498DB",fontFamily:"'DM Mono',monospace"}}>AC{i+1}</span>
            <input value={ac.story} onChange={e=>update(i,"story",e.target.value)} placeholder="Related user story..." style={{...fs,flex:1,fontWeight:600,fontSize:13,border:"none",background:"transparent"}}/>
            <div style={{display:"flex",gap:3}}>{PRIORITIES.map(p=>(<button key={p.key} onClick={()=>update(i,"priority",p.key)} style={{padding:"3px 8px",borderRadius:5,fontSize:9,fontWeight:600,cursor:"pointer",border:`1px solid ${p.color}30`,background:ac.priority===p.key?`${p.color}20`:"transparent",color:ac.priority===p.key?p.color:t.textDim}}>{p.label}</button>))}</div>
            {state.criteria.length>1&&<button onClick={()=>remove(i)} style={{background:"none",border:"none",color:"#E74C3C50",cursor:"pointer",fontSize:14}}>×</button>}
          </div>
          <div style={{padding:"10px 14px"}}>
            <div style={{marginBottom:4}}><span style={{fontSize:10,color:"#3498DB",fontFamily:"'DM Mono',monospace",fontWeight:600}}>GIVEN</span><input value={ac.given} onChange={e=>update(i,"given",e.target.value)} placeholder="Initial context or state..." style={{...fs,marginTop:2}}/></div>
            <div style={{marginBottom:4}}><span style={{fontSize:10,color:"#E67E22",fontFamily:"'DM Mono',monospace",fontWeight:600}}>WHEN</span><input value={ac.when} onChange={e=>update(i,"when",e.target.value)} placeholder="Action or event..." style={{...fs,marginTop:2}}/></div>
            <div style={{marginBottom:4}}><span style={{fontSize:10,color:"#1B9C85",fontFamily:"'DM Mono',monospace",fontWeight:600}}>THEN</span><input value={ac.then} onChange={e=>update(i,"then",e.target.value)} placeholder="Expected result..." style={{...fs,marginTop:2}}/></div>
            <input value={ac.notes} onChange={e=>update(i,"notes",e.target.value)} placeholder="Edge cases, notes..." style={{...fs,fontSize:11,color:t.textMuted,marginTop:4}}/>
          </div>
        </div>
      )})}
      <button onClick={add} style={{width:"100%",padding:"10px",background:"none",border:`1px dashed ${t.cardBorder}`,borderRadius:10,fontSize:13,color:t.textMuted,cursor:"pointer",marginBottom:18}}>+ Add Acceptance Criteria</button>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <button onClick={exportLinear} style={{padding:"12px 20px",background:"#3498DB",color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",flex:1,minWidth:140,minHeight:48}}>📋 Export Linear-format</button>
        <button onClick={()=>{navigator.clipboard.writeText(JSON.stringify({stage:4,framework:"acceptance",data:state,exported_at:new Date().toISOString()},null,2));setToast("JSON copied")}} style={{padding:"12px 20px",background:t.text,color:t.bg,border:"none",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",flex:1,minWidth:140,minHeight:48}}>📤 Export JSON</button>
      </div>
      <p style={{fontSize:11,color:t.textDim,fontFamily:"'DM Mono',monospace",textAlign:"center",marginTop:16}}>Auto-saved to localStorage</p>
      {toast&&<div style={{position:"fixed",bottom:32,left:"50%",transform:"translateX(-50%)",padding:"12px 24px",background:"#1B9C85",color:"#fff",borderRadius:10,fontSize:13,fontWeight:600,boxShadow:"0 4px 20px rgba(0,0,0,0.25)",zIndex:1000}}>{toast}</div>}
    </div>);
}
