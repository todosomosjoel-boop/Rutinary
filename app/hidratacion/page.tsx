'use client';
import { useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import ProgressBar from '@/components/ProgressBar';
import { currentUser, getGoals, readJson, todayKey, writeJson } from '@/lib/storage';
export default function HydrationPage(){return <AuthGuard><AppShell><Water/></AppShell></AuthGuard>}
function Water(){const user=currentUser()!;const goal=getGoals(user.username).hydrationMl;const key=`ritmo_water_${user.username}_${todayKey()}`;const logKey=`ritmo_waterlog_${user.username}_${todayKey()}`;const [water,setWater]=useState(()=>readJson<number>(key,0));const [logs,setLogs]=useState<any[]>(()=>readJson(logKey,[]));
 function add(ml:number){const next=Math.max(0,water+ml);setWater(next);writeJson(key,next);const nextLogs=ml>0?[{time:new Date().toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'}),ml},...logs]:logs;setLogs(nextLogs);writeJson(logKey,nextLogs)}
 const pct=Math.min(100,water/goal*100);
 return <><PageHeader eyebrow="HIDRATACIÓN" title="Agua durante el día" text="Registra cada vaso en segundos. Tu objetivo puede ajustarse según tu ritmo de vida."/>
 <section className="water-hero card"><div className="water-ring"><div><b>{Math.round(pct)}%</b><span>de tu meta</span></div></div><div className="water-data"><h2>{water.toLocaleString('es-CL')} <small>/ {goal.toLocaleString('es-CL')} ml</small></h2><ProgressBar value={pct}/><div className="water-buttons"><button className="primary giant" onClick={()=>add(200)}>+ 200 ml</button><button onClick={()=>add(400)}>+ 400</button><button onClick={()=>add(600)}>+ 600</button><button onClick={()=>add(-200)}>− 200</button></div><p className="muted">La meta es orientativa y configurable. Las necesidades reales pueden variar según clima, actividad, alimentación y condiciones personales.</p></div></section>
 <section className="card"><div className="row-between"><h2>Registros de hoy</h2><span className="pill">{logs.length} tomas</span></div><div className="timeline">{logs.length===0&&<div className="empty">Aún no registras agua hoy.</div>}{logs.map((l,i)=><div key={i}><span>💧</span><b>+{l.ml} ml</b><small>{l.time}</small></div>)}</div></section></>}
