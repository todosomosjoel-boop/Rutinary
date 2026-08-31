'use client';
import { useEffect, useMemo, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import ProgressBar from '@/components/ProgressBar';
import { currentUser, getGoals, readJson, todayKey } from '@/lib/storage';
import Link from 'next/link';

export default function HomePage() {
  return <AuthGuard userOnly><AppShell><Dashboard /></AppShell></AuthGuard>;
}

function Dashboard() {
  const user = currentUser()!;
  const goals = getGoals(user.username);
  const today = todayKey();
  const [tick, setTick] = useState(0);
  useEffect(() => { const h=()=>setTick(x=>x+1); window.addEventListener('storage',h); return()=>window.removeEventListener('storage',h); },[]);
  const data = useMemo(() => {
    const exercise = readJson<any>(`ritmo_exercise_${user.username}_${today}`, {completed:false});
    const readings = readJson<any[]>(`ritmo_readings_${user.username}`, []);
    const sleep = readJson<any>(`ritmo_sleep_${user.username}_${today}`, {hours:0});
    const water = readJson<number>(`ritmo_water_${user.username}_${today}`, 0);
    const foods = readJson<any[]>(`ritmo_food_${user.username}_${today}`, []);
    const pagesToday = readings.reduce((sum, reading) => {
      const log = readJson<any>(`ritmo_readlog_${user.username}_${reading.id}_${today}`, {pages:0});
      return sum + Number(log.pages || 0);
    }, 0);
    return { exercise, readings, sleep, water, foods, pagesToday };
  }, [tick, user.username, today]);
  const calories = data.foods.reduce((s:any,x:any)=>s+Number(x.calories||0),0);
  const protein = data.foods.reduce((s:any,x:any)=>s+Number(x.protein||0),0);
  const checks = [data.exercise.completed, data.pagesToday>=goals.readingPages, data.sleep.hours>=goals.sleepHours, data.water>=goals.hydrationMl, !goals.foodTracking || data.foods.length>0];
  const completed = checks.filter(Boolean).length;
  const pct = completed*20;

  return <>
    <div className="top-row"><div><div className="eyebrow">MI DÍA</div><h1>Hola, {user.name} 👋</h1><p>{new Intl.DateTimeFormat('es-CL',{weekday:'long',day:'numeric',month:'long'}).format(new Date())}</p></div><div className="score-card"><b>{pct}%</b><span>del día completado</span></div></div>
    <div className="hero-progress"><div className="row-between"><b>{completed} de 5 hábitos</b><span>{pct === 100 ? 'Día completo 🎉' : 'Sigue construyendo tu ritmo'}</span></div><ProgressBar value={pct}/></div>
    <div className="habit-grid">
      <Habit href="/ejercicio" icon="🏋️" title="Ejercicio" value={data.exercise.completed?'Completado':'Pendiente'} detail="30–45 min · Multiarticular" percent={data.exercise.completed?100:0}/>
      <Habit href="/lectura" icon="📚" title="Lectura" value={`${data.pagesToday} / ${goals.readingPages} páginas`} detail="Meta diaria" percent={Math.min(100,data.pagesToday/goals.readingPages*100)}/>
      <Habit href="/sueno" icon="😴" title="Sueño" value={`${data.sleep.hours || 0} h`} detail={`Meta ${goals.sleepHours} h`} percent={Math.min(100,(data.sleep.hours||0)/goals.sleepHours*100)}/>
      <Habit href="/hidratacion" icon="💧" title="Hidratación" value={`${data.water.toLocaleString('es-CL')} / ${goals.hydrationMl.toLocaleString('es-CL')} ml`} detail="Registro rápido +200 ml" percent={Math.min(100,data.water/goals.hydrationMl*100)}/>
      <Habit href="/alimentacion" icon="🥗" title="Alimentación" value={`${calories.toLocaleString('es-CL')} kcal`} detail={`${Math.round(protein)} g proteína · ${data.foods.length} comidas`} percent={data.foods.length?100:0}/>
    </div>
    <section className="card insight-card"><div><span className="pill">ENFOQUE DEL DÍA</span><h2>Hazlo suficientemente simple para repetirlo mañana.</h2><p>No necesitas un día perfecto. Prioriza completar tus hábitos principales con consistencia.</p></div><Link href="/progreso" className="primary">Ver mi progreso</Link></section>
  </>;
}
function Habit({href,icon,title,value,detail,percent}:{href:string;icon:string;title:string;value:string;detail:string;percent:number}){
 return <Link href={href} className="habit-card"><div className="habit-icon">{icon}</div><div className="habit-copy"><span>{title}</span><b>{value}</b><small>{detail}</small><ProgressBar value={percent}/></div><span className="arrow">→</span></Link>
}
