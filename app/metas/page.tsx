'use client';
import { useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import { currentUser, getGoals, setGoals } from '@/lib/storage';
export default function GoalsPage(){return <AuthGuard><AppShell><GoalsPanel/></AppShell></AuthGuard>}
function GoalsPanel(){const user=currentUser()!;const [g,setG]=useState(()=>getGoals(user.username));const [saved,setSaved]=useState(false);function save(){setGoals(user.username,g);setSaved(true);setTimeout(()=>setSaved(false),1600)}
 return <><PageHeader eyebrow="MIS METAS" title="Define un ritmo realista" text="Las metas deben ayudarte a sostener el hábito, no a castigarte cuando un día sale distinto."/>
 <section className="card goals-card"><Goal icon="🏋️" title="Ejercicio" desc="Días de entrenamiento por semana"><input type="number" min="1" max="7" value={g.exerciseDays} onChange={e=>setG({...g,exerciseDays:Number(e.target.value)})}/><span>días</span></Goal><Goal icon="📚" title="Lectura" desc="Páginas que quieres leer cada día"><input type="number" min="1" value={g.readingPages} onChange={e=>setG({...g,readingPages:Number(e.target.value)})}/><span>páginas</span></Goal><Goal icon="😴" title="Sueño" desc="Objetivo diario de descanso"><input type="number" min="4" max="12" step="0.5" value={g.sleepHours} onChange={e=>setG({...g,sleepHours:Number(e.target.value)})}/><span>horas</span></Goal><Goal icon="💧" title="Hidratación" desc="Objetivo diario orientativo"><input type="number" min="1000" max="5000" step="200" value={g.hydrationMl} onChange={e=>setG({...g,hydrationMl:Number(e.target.value)})}/><span>ml</span></Goal><Goal icon="🥗" title="Alimentación" desc="Registrar al menos una comida al día"><input type="checkbox" checked={g.foodTracking} onChange={e=>setG({...g,foodTracking:e.target.checked})}/><span>{g.foodTracking?'Activo':'Inactivo'}</span></Goal><button className="primary full big-btn" onClick={save}>{saved?'✓ Metas guardadas':'Guardar mis metas'}</button></section>
 </>}
function Goal({icon,title,desc,children}:{icon:string;title:string;desc:string;children:React.ReactNode}){return <div className="goal-row"><div className="goal-icon">{icon}</div><div><b>{title}</b><small>{desc}</small></div><div className="goal-control">{children}</div></div>}
