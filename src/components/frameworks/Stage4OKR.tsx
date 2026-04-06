// Stage4OKR.tsx — Ported from Level 1 Stage4OKR.jsx
'use client';
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";
const STORAGE_KEY = "dk-stage4-okr";
const EMPTY_KR = { metric: "", baseline: "", target: "", confidence: 70 };
const EMPTY_OBJ = { name: "", keyResults: [{ ...EMPTY_KR }] };
function useAutoSave(s){const t=useRef(null);useEffect(()=>{clearTimeout(t.current);t.current=setTimeout(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(s))}catch(e){}},500);return()=>clearTimeout(t.current)},[s])}
function loadSaved(){try{const r=localStorage.getItem(STORAGE_KEY);if(r)return JSON.parse(r)}catch(e){}return null}
export default function Stage4OKR(){
  const[theme]=useState(getTheme);const t=THEMES[theme];const[mobile,setMobile]=useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(()=>{const c=()=>setMobile(window.innerWidth<700);window.addEventListener("resize",c);return()=>window.removeEventListener("resize",c)},[]);
  const[state,setState]=useState(()=>loadSaved()||{objectives:[{...EMPTY_OBJ,keyResults:[{...EMPTY_KR}]}]});const[toast,setToast]=useState(null);
  useAutoSave(state);useEffect(()=>{if(toast){const tm=setTimeout(()=>setToast(null),2500);return()=>clearTimeout(tm)}},[toast]);
  const updateObj=(i,v)=>setState(prev=>{const o=[...prev.objectives];o[i]={...o[i],name:v};return{...prev,objectives:o}});
  const updateKR=(oi,ki,k,v)=>setState(prev=>{const o=[...prev.objectives];const kr=[...o[oi].keyResults];kr[ki]={...kr[ki],[k]:v};o[oi]={...o[oi],keyResults:kr};return{...prev,objectives:o}});
  const addKR=(oi)=>setState(prev=>{const o=[...prev.objectives];o[oi]={...o[oi],keyResults:[...o[oi].keyResults,{...EMPTY_KR}]};return{...prev,objectives:o}});
  const addObj=()=>setState(prev=>({...prev,objectives:[...prev.objectives,{...EMPTY_OBJ,keyResults:[{...EMPTY_KR}]}]}));
  const fs={width:"100%",padding:"8px 10px",background:t.input,border:`1px solid ${t.cardBorder}`,borderRadius:8,fontSize:12,color:t.text,outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif"};
  return(
    <div style={{maxWidth:900,margin:"0 auto",padding:mobile?"20px 16px":"32px 24px",fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
      <div style={{marginBottom:28,borderBottom:"3px solid #3498DB",paddingBottom:16}}>
        <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#3498DB",fontWeight:600,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:4}}>Stage 4 · Planning & Roadmap</p>
        <h1 style={{fontSize:mobile?24:30,fontFamily:"'Playfair Display',serif",fontWeight:800,color:t.text,margin:"0 0 6px"}}>OKRs (Execution)</h1>
        <p style={{fontSize:14,color:t.textMuted,margin:0}}>Objectives and measurable key results for the execution phase.</p>
      </div>
      {state.objectives.map((obj,oi)=>(
        <div key={oi} style={{marginBottom:14,background:t.card,border:`1px solid #3498DB30`,borderRadius:14,overflow:"hidden"}}>
          <div style={{padding:"12px 14px",borderBottom:`1px solid ${t.cardBorder}`}}>
            <p style={{fontSize:10,color:"#3498DB",margin:"0 0 3px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>OBJECTIVE {oi+1}</p>
            <input value={obj.name} onChange={e=>updateObj(oi,e.target.value)} placeholder="What are we trying to achieve?" style={{...fs,fontWeight:700,fontSize:15,border:"none",background:"transparent",padding:"4px 0"}}/>
          </div>
          <div style={{padding:"10px 14px"}}>
            {obj.keyResults.map((kr,ki)=>(
              <div key={ki} style={{marginBottom:8,padding:"8px 10px",background:t.input,borderRadius:8,border:`1px solid ${t.cardBorder}`}}>
                <p style={{fontSize:10,color:"#1B9C85",margin:"0 0 4px",fontFamily:"'DM Mono',monospace",fontWeight:600}}>KEY RESULT {ki+1}</p>
                <input value={kr.metric} onChange={e=>updateKR(oi,ki,"metric",e.target.value)} placeholder="Metric to measure..." style={{...fs,marginBottom:4}}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4}}>
                  <div><p style={{fontSize:9,color:t.textDim,margin:"0 0 2px"}}>Baseline</p><input value={kr.baseline} onChange={e=>updateKR(oi,ki,"baseline",e.target.value)} placeholder="Current" style={fs}/></div>
                  <div><p style={{fontSize:9,color:t.textDim,margin:"0 0 2px"}}>Target</p><input value={kr.target} onChange={e=>updateKR(oi,ki,"target",e.target.value)} placeholder="Goal" style={fs}/></div>
                  <div><p style={{fontSize:9,color:t.textDim,margin:"0 0 2px"}}>Confidence</p><input type="number" value={kr.confidence} onChange={e=>updateKR(oi,ki,"confidence",parseInt(e.target.value)||0)} min={0} max={100} style={{...fs,textAlign:"center"}}/></div>
                </div>
              </div>
            ))}
            <button onClick={()=>addKR(oi)} style={{fontSize:11,color:t.textMuted,background:"none",border:"none",cursor:"pointer",padding:"4px 0"}}>+ key result</button>
          </div>
        </div>
      ))}
      <button onClick={addObj} style={{width:"100%",padding:"10px",background:"none",border:`1px dashed ${t.cardBorder}`,borderRadius:10,fontSize:13,color:t.textMuted,cursor:"pointer",marginBottom:18}}>+ Add Objective</button>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <button onClick={()=>{navigator.clipboard.writeText(JSON.stringify({stage:4,framework:"okr",data:state,exported_at:new Date().toISOString()},null,2));setToast("Copied")}} style={{padding:"12px 20px",background:"#3498DB",color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",flex:1,minWidth:140,minHeight:48}}>📤 Export</button>
        <button onClick={()=>{const raw=prompt("Paste JSON:");if(!raw)return;try{setState({...JSON.parse(raw)});setToast("Imported")}catch(e){setToast("Invalid JSON")}}} style={{padding:"12px 20px",background:t.text,color:t.bg,border:"none",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",flex:1,minWidth:140,minHeight:48}}>📥 Import</button>
      </div>
      <p style={{fontSize:11,color:t.textDim,fontFamily:"'DM Mono',monospace",textAlign:"center",marginTop:16}}>Auto-saved to localStorage</p>
      {toast&&<div style={{position:"fixed",bottom:32,left:"50%",transform:"translateX(-50%)",padding:"12px 24px",background:"#1B9C85",color:"#fff",borderRadius:10,fontSize:13,fontWeight:600,boxShadow:"0 4px 20px rgba(0,0,0,0.25)",zIndex:1000}}>{toast}</div>}
    </div>);
}
