// DependencyMap.tsx — Ported from Level 1 DependencyMap.jsx
'use client';
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";
const STORAGE_KEY = "dk-stage4-dependencies";
const EMPTY = { item: "", dependsOn: "", type: "blocks", owner: "", status: "open", risk: "low" };
const TYPES = [{ key: "blocks", label: "Blocks", color: "#E74C3C" }, { key: "needs", label: "Needs input", color: "#E67E22" }, { key: "parallel", label: "Parallel", color: "#1B9C85" }];
const RISKS = [{ key: "low", label: "Low", color: "#1B9C85" }, { key: "medium", label: "Medium", color: "#E67E22" }, { key: "high", label: "High", color: "#E74C3C" }];
function useAutoSave(s){const t=useRef(null);useEffect(()=>{clearTimeout(t.current);t.current=setTimeout(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(s))}catch(e){}},500);return()=>clearTimeout(t.current)},[s])}
function loadSaved(){try{const r=localStorage.getItem(STORAGE_KEY);if(r)return JSON.parse(r)}catch(e){}return null}
export default function DependencyMap(){
  const[theme]=useState(getTheme);const t=THEMES[theme];const[mobile,setMobile]=useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(()=>{const c=()=>setMobile(window.innerWidth<700);window.addEventListener("resize",c);return()=>window.removeEventListener("resize",c)},[]);
  const[state,setState]=useState(()=>loadSaved()||{dependencies:[{...EMPTY}]});const[toast,setToast]=useState(null);
  useAutoSave(state);useEffect(()=>{if(toast){const tm=setTimeout(()=>setToast(null),2500);return()=>clearTimeout(tm)}},[toast]);
  const update=(i,k,v)=>setState(prev=>{const d=[...prev.dependencies];d[i]={...d[i],[k]:v};return{...prev,dependencies:d}});
  const add=()=>setState(prev=>({...prev,dependencies:[...prev.dependencies,{...EMPTY}]}));
  const remove=(i)=>setState(prev=>({...prev,dependencies:prev.dependencies.filter((_,j)=>j!==i)}));
  const fs={width:"100%",padding:"8px 10px",background:t.input,border:`1px solid ${t.cardBorder}`,borderRadius:8,fontSize:12,color:t.text,outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif"};
  return(
    <div style={{maxWidth:900,margin:"0 auto",padding:mobile?"20px 16px":"32px 24px",fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
      <div style={{marginBottom:28,borderBottom:"3px solid #3498DB",paddingBottom:16}}>
        <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#3498DB",fontWeight:600,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:4}}>Stage 4 · Planning & Roadmap</p>
        <h1 style={{fontSize:mobile?24:30,fontFamily:"'Playfair Display',serif",fontWeight:800,color:t.text,margin:"0 0 6px"}}>Dependency Map</h1>
        <p style={{fontSize:14,color:t.textMuted,margin:0}}>What blocks what? Map dependencies, owners, and risk levels.</p>
      </div>
      {state.dependencies.map((dep,i)=>{const tp=TYPES.find(t=>t.key===dep.type)||TYPES[0];const rk=RISKS.find(r=>r.key===dep.risk)||RISKS[0];return(
        <div key={i} style={{marginBottom:8,padding:"10px 14px",background:t.card,border:`1px solid ${tp.color}25`,borderRadius:12,borderLeft:`4px solid ${tp.color}`}}>
          <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:6}}>
            <div><p style={{fontSize:10,color:"#3498DB",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>ITEM</p><input value={dep.item} onChange={e=>update(i,"item",e.target.value)} placeholder="What needs to happen..." style={{...fs,fontWeight:600}}/></div>
            <div><p style={{fontSize:10,color:"#E74C3C",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>DEPENDS ON</p><input value={dep.dependsOn} onChange={e=>update(i,"dependsOn",e.target.value)} placeholder="What must happen first..." style={fs}/></div>
            <div><p style={{fontSize:10,color:t.textDim,margin:"0 0 3px",fontFamily:"'DM Mono',monospace"}}>TYPE</p><div style={{display:"flex",gap:3}}>{TYPES.map(tp2=>(<button key={tp2.key} onClick={()=>update(i,"type",tp2.key)} style={{flex:1,padding:"5px",borderRadius:5,fontSize:10,fontWeight:600,cursor:"pointer",border:`1px solid ${tp2.color}30`,background:dep.type===tp2.key?`${tp2.color}20`:"transparent",color:dep.type===tp2.key?tp2.color:t.textDim}}>{tp2.label}</button>))}</div></div>
            <div><p style={{fontSize:10,color:t.textDim,margin:"0 0 3px",fontFamily:"'DM Mono',monospace"}}>RISK</p><div style={{display:"flex",gap:3}}>{RISKS.map(rk2=>(<button key={rk2.key} onClick={()=>update(i,"risk",rk2.key)} style={{flex:1,padding:"5px",borderRadius:5,fontSize:10,fontWeight:600,cursor:"pointer",border:`1px solid ${rk2.color}30`,background:dep.risk===rk2.key?`${rk2.color}20`:"transparent",color:dep.risk===rk2.key?rk2.color:t.textDim}}>{rk2.label}</button>))}</div></div>
            <div><p style={{fontSize:10,color:t.textDim,margin:"0 0 3px",fontFamily:"'DM Mono',monospace"}}>OWNER</p><input value={dep.owner} onChange={e=>update(i,"owner",e.target.value)} placeholder="Who owns this?" style={fs}/></div>
          </div>
          {state.dependencies.length>1&&<button onClick={()=>remove(i)} style={{background:"none",border:"none",color:"#E74C3C50",cursor:"pointer",fontSize:11,marginTop:4}}>remove</button>}
        </div>
      )})}
      <button onClick={add} style={{width:"100%",padding:"10px",background:"none",border:`1px dashed ${t.cardBorder}`,borderRadius:10,fontSize:13,color:t.textMuted,cursor:"pointer",marginBottom:18}}>+ Add Dependency</button>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <button onClick={()=>{navigator.clipboard.writeText(JSON.stringify({stage:4,framework:"dependencies",data:state,exported_at:new Date().toISOString()},null,2));setToast("Copied")}} style={{padding:"12px 20px",background:"#3498DB",color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",flex:1,minWidth:140,minHeight:48}}>📤 Export</button>
        <button onClick={()=>{const raw=prompt("Paste JSON:");if(!raw)return;try{setState({...JSON.parse(raw)});setToast("Imported")}catch(e){setToast("Invalid JSON")}}} style={{padding:"12px 20px",background:t.text,color:t.bg,border:"none",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",flex:1,minWidth:140,minHeight:48}}>📥 Import</button>
      </div>
      <p style={{fontSize:11,color:t.textDim,fontFamily:"'DM Mono',monospace",textAlign:"center",marginTop:16}}>Auto-saved to localStorage</p>
      {toast&&<div style={{position:"fixed",bottom:32,left:"50%",transform:"translateX(-50%)",padding:"12px 24px",background:"#1B9C85",color:"#fff",borderRadius:10,fontSize:13,fontWeight:600,boxShadow:"0 4px 20px rgba(0,0,0,0.25)",zIndex:1000}}>{toast}</div>}
    </div>);
}
