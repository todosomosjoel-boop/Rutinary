'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import { currentUser, readJson, todayKey, writeJson } from '@/lib/storage';

const workouts = [
  { name:'Sentadilla', sets:4, reps:'12', rest:45, img:'🧍↕️', tip:'Pies al ancho de hombros. Baja controlado y empuja el suelo al subir.' },
  { name:'Flexiones', sets:4, reps:'8–12', rest:60, img:'🤸', tip:'Cuerpo alineado, abdomen activo. Puedes apoyar rodillas si lo necesitas.' },
  { name:'Zancadas alternas', sets:3, reps:'10 c/pierna', rest:45, img:'🚶', tip:'Paso largo y torso erguido. Rodilla delantera alineada con el pie.' },
  { name:'Remo con mochila', sets:4, reps:'12', rest:60, img:'🎒', tip:'Inclina el torso con espalda neutra y lleva la mochila hacia el abdomen.' },
  { name:'Puente de glúteos', sets:3, reps:'15', rest:45, img:'🌉', tip:'Empuja desde talones y aprieta glúteos arriba sin arquear la zona lumbar.' },
  { name:'Plancha', sets:3, reps:'30–45 s', rest:45, img:'🧱', tip:'Codos bajo hombros y cuerpo en línea recta.' }
];

export default function ExercisePage(){return <AuthGuard><AppShell><Exercise/></AppShell></AuthGuard>}
function Exercise(){
 const user=currentUser()!; const key=`ritmo_exercise_${user.username}_${todayKey()}`;
 const [done,setDone]=useState(false); const [timer,setTimer]=useState(0); const [active,setActive]=useState<number|null>(null);
 useEffect(()=>setDone(readJson<any>(key,{completed:false}).completed),[key]);
 useEffect(()=>{ if(timer<=0)return; const i=setInterval(()=>setTimer(t=>t-1),1000); return()=>clearInterval(i)},[timer]);
 function complete(){setDone(true);writeJson(key,{completed:true,completedAt:new Date().toISOString()})}
 return <><PageHeader eyebrow="ENTRENAMIENTO DE HOY" title="Fuerza funcional · Cuerpo completo" text="Rutina multiarticular de 35–40 minutos, sin equipamiento especial."/>
 <div className="stats-row"><div className="stat"><span>⏱️</span><b>38 min</b><small>duración estimada</small></div><div className="stat"><span>🔁</span><b>21 series</b><small>volumen total</small></div><div className="stat"><span>🏠</span><b>Casa</b><small>solo mochila opcional</small></div></div>
 {timer>0 && <div className="timer-banner"><span>Descanso</span><b>{timer}s</b><button onClick={()=>setTimer(0)}>Saltar</button></div>}
 <div className="exercise-list">{workouts.map((w,i)=><div className="exercise-card" key={w.name}><div className="exercise-visual">{w.img}</div><div className="exercise-main"><div className="row-between"><h3>{i+1}. {w.name}</h3><button className="ghost" onClick={()=>setActive(active===i?null:i)}>Técnica</button></div><div className="chips"><span>{w.sets} series</span><span>{w.reps}</span><span>Descanso {w.rest}s</span></div>{active===i&&<p className="tip">{w.tip}</p>}</div><button className="round-btn" onClick={()=>setTimer(w.rest)}>▶</button></div>)}</div>
 <div className="sticky-action"><button className={`primary big-btn ${done?'done':''}`} onClick={complete}>{done?'✓ Entrenamiento completado':'Finalizar entrenamiento'}</button></div>
 </>}
