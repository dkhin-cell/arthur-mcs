// Stage4DACI.tsx — Ported from Level 1 Stage4DACI.jsx
'use client';
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";
const STORAGE_KEY = "dk-stage4-daci";
const EMPTY = { topic: "", driver: "", approver: "", contributors: "", informed: "", status: "open", deadline: "" };
function useAutoSave(s){const t=useRef(null);useEffect(()=>{clearTimeout(t.current);t.current=setTimeout(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(s))}catch(e){}},500);return()=>clearTimeout(t.current)},[s])}
function loadSaved(){try{const r=localStorage.getItem(STORAGE_KEY);if(r)return JSON.parse(r)}catch(e){}return null}
const STATUSES=[{key:"open",label:"Open",color:"#3498DB"},{key:"decided",label:"Decided",color:"#1B9C85"},{key:"revisit",label:"Revisit",color:"#E67E22"}];
export default function Stage4DACI(){
  const[theme]=useState(getTheme);const t=THEMES[theme];const[mobile,setMobile]=useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(()=>{const c=()=>setMobile(window.innerWidth<700);window.addEventListener("resize",c);return()=>window.removeEventListener("resize",c)},[]);
  const[state,setState]=useState(()=>loadSaved()||{decisions:[{...EMPTY}]});const[toast,setToast]=useState(null);
  useAutoSave(state);useEffect(()=>{if(toast){const tm=setTimeout(()=>setToast(null),2500);return()=>clearTimeout(tm)}},[toast]);
  const update=(i,k,v)=>setState(prev=>{const d=[...prev.decisions];d[i]={...d[i],[k]:v};return{...prev,decisions:d}});
  const add=()=>setState(prev=>({...prev,decisions:[...prev.decisions,{...EMPTY}]}));
  const remove=(i)=>setState(prev=>({...prev,decisions:prev.decisions.filter((_,j)=>j!==i)}));
  const fs={width:"100%",padding:"8px 10px",background:t.input,border:`1px solid ${t.cardBorder}`,borderRadius:8,fontSize:12,color:t.text,outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif",resize:"vertical"};
  return(
    <div style={{maxWidth:900,margin:"0 auto",padding:mobile?"20px 16px":"32px 24px",fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
      <div style={{marginBottom:28,borderBottom:"3px solid #3498DB",paddingBottom:16}}>
        <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#3498DB",fontWeight:600,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:4}}>Stage 4 · Planning & Roadmap</p>
        <h1 style={{fontSize:mobile?24:30,fontFamily:"'Playfair Display',serif",fontWeight:800,color:t.text,margin:"0 0 6px"}}>DACI (Execution)</h1>
        <p style={{fontSize:14,color:t.textMuted,margin:0}}>Who drives, approves, contributes, and stays informed for each key decision.</p>
      </div>
      {state.decisions.map((dec,i)=>{const st=STATUSES.find(s=>s.key===dec.status)||STATUSES[0];return(
        <div key={i} style={{marginBottom:10,background:t.card,border:`1px solid ${st.color}30`,borderRadius:14,overflow:"hidden"}}>
          <div style={{padding:"10px 14px",borderBottom:`1px solid ${t.cardBorder}`,display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:13,fontWeight:800,color:"#3498DB",fontFamily:"'DM Mono',monospace"}}>D{i+1}</span>
            <div style={{display:"flex",gap:3,marginLeft:"auto"}}>{STATUSES.map(s=>(
              <button key={s.key} onClick={()=>update(i,"status",s.key)} style={{padding:"3px 8px",borderRadius:5,fontSize:10,fontWeight:600,cursor:"pointer",border:`1px solid ${s.color}30`,background:dec.status===s.key?`${s.color}20`:"transparent",color:dec.status===s.key?s.color:t.textDim}}>{s.label}</button>
            ))}</div>
            {state.decisions.length>1&&<button onClick={()=>remove(i)} style={{background:"none",border:"none",color:"#E74C3C50",cursor:"pointer",fontSize:14}}>×</button>}
          </div>
          <div style={{padding:"12px 14px",display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:8}}>
            <div style={{gridColumn:"1/-1"}}><p style={{fontSize:10,color:"#3498DB",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>DECISION TOPIC</p><input value={dec.topic} onChange={e=>update(i,"topic",e.target.value)} placeholder="What decision needs to be made?" style={{...fs,fontWeight:600,fontSize:14}}/></div>
            <div><p style={{fontSize:10,color:"#E74C3C",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>DRIVER</p><input value={dec.driver} onChange={e=>update(i,"driver",e.target.value)} placeholder="Who drives this decision?" style={fs}/></div>
            <div><p style={{fontSize:10,color:"#1B9C85",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>APPROVER</p><input value={dec.approver} onChange={e=>update(i,"approver",e.target.value)} placeholder="Who has final say?" style={fs}/></div>
            <div><p style={{fontSize:10,color:"#E67E22",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>CONTRIBUTORS</p><input value={dec.contributors} onChange={e=>update(i,"contributors",e.target.value)} placeholder="Who provides input?" style={fs}/></div>
            <div><p style={{fontSize:10,color:"#95A5A6",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>INFORMED</p><input value={dec.informed} onChange={e=>update(i,"informed",e.target.value)} placeholder="Who needs to know?" style={fs}/></div>
            <div><p style={{fontSize:10,color:t.textDim,margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>DEADLINE</p><input value={dec.deadline} onChange={e=>update(i,"deadline",e.target.value)} placeholder="By when?" style={fs}/></div>
          </div>
        </div>
      )})}
      <button onClick={add} style={{width:"100%",padding:"10px",background:"none",border:`1px dashed ${t.cardBorder}`,borderRadius:10,fontSize:13,color:t.textMuted,cursor:"pointer",marginBottom:18}}>+ Add Decision</button>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <button onClick={()=>{navigator.clipboard.writeText(JSON.stringify({stage:4,framework:"daci",data:state,exported_at:new Date().toISOString()},null,2));setToast("Copied")}} style={{padding:"12px 20px",background:"#3498DB",color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",flex:1,minWidth:140,minHeight:48}}>📤 Export</button>
        <button onClick={()=>{const raw=prompt("Paste JSON:");if(!raw)return;try{setState({...JSON.parse(raw)});setToast("Imported")}catch(e){setToast("Invalid JSON")}}} style={{padding:"12px 20px",background:t.text,color:t.bg,border:"none",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",flex:1,minWidth:140,minHeight:48}}>📥 Import</button>
      </div>
      <p style={{fontSize:11,color:t.textDim,fontFamily:"'DM Mono',monospace",textAlign:"center",marginTop:16}}>Auto-saved to localStorage</p>
      {toast&&<div style={{position:"fixed",bottom:32,left:"50%",transform:"translateX(-50%)",padding:"12px 24px",background:"#1B9C85",color:"#fff",borderRadius:10,fontSize:13,fontWeight:600,boxShadow:"0 4px 20px rgba(0,0,0,0.25)",zIndex:1000}}>{toast}</div>}
    </div>);
}
