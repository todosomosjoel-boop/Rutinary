'use client';

import { useMemo, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import ProgressBar from '@/components/ProgressBar';
import {
  currentUser,
  dateKey,
  getGoals,
  getHabitProgress,
  readJson,
  setGoals,
  type Goals,
} from '@/lib/storage';

type Tab = 'summary' | 'goals';

export default function ProgressPage() {
  return <AuthGuard userOnly><AppShell><Progress /></AppShell></AuthGuard>;
}

function Progress() {
  const user = currentUser()!;
  const [tab, setTab] = useState<Tab>('summary');
  const [refresh, setRefresh] = useState(0);
  const goals = useMemo(() => getGoals(user.username), [user.username, refresh]);
  const progress = useMemo(() => getHabitProgress(user.username, 7), [user.username, refresh]);

  return (
    <>
      <PageHeader
        eyebrow="PROGRESO"
        title="Tu avance y tus metas"
        text="Revisa tu consistencia y ajusta objetivos que sean realistas para tu propio ritmo."
      />

      <div className="progress-tabs" role="tablist" aria-label="Progreso">
        <button className={tab === 'summary' ? 'active' : ''} onClick={() => setTab('summary')}>📈 Resumen</button>
        <button className={tab === 'goals' ? 'active' : ''} onClick={() => setTab('goals')}>🎯 Administrar metas</button>
      </div>

      {tab === 'summary'
        ? <ProgressSummary username={user.username} goals={goals} progress={progress} />
        : <GoalsPanel username={user.username} goals={goals} onSaved={() => { setRefresh(value => value + 1); setTab('summary'); }} />}
    </>
  );
}

function ProgressSummary({ username, goals, progress }: { username: string; goals: Goals; progress: ReturnType<typeof getHabitProgress> }) {
  const days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - (6 - i));
    return dateKey(d);
  });

  const readings = readJson<any[]>(`ritmo_readings_${username}`, []);
  const rows = days.map(d => {
    const ex = readJson<any>(`ritmo_exercise_${username}_${d}`, { completed: false }).completed;
    const sl = Number(readJson<any>(`ritmo_sleep_${username}_${d}`, { hours: 0 }).hours || 0);
    const wa = Number(readJson<number>(`ritmo_water_${username}_${d}`, 0) || 0);
    const fo = readJson<any[]>(`ritmo_food_${username}_${d}`, []).length > 0;
    const pages = readings.reduce((sum, reading) => {
      const log = readJson<any>(`ritmo_readlog_${username}_${reading.id}_${d}`, { pages: 0 });
      return sum + Number(log.pages || 0);
    }, 0);
    const checks = [
      ex,
      pages >= goals.readingPages,
      sl >= goals.sleepHours,
      wa >= goals.hydrationMl,
      !goals.foodTracking || fo,
    ];
    return { d, score: (checks.filter(Boolean).length / checks.length) * 100 };
  });

  return (
    <>
      <div className="macro-grid progress-kpis">
        <div><span>Cumplimiento general</span><b>{progress.overall}%</b><small>según tus metas · 7 días</small></div>
        <div><span>Entrenamientos</span><b>{progress.metrics.exerciseDone}</b><small>meta ≈ {progress.metrics.exerciseTarget.toFixed(1)}</small></div>
        <div><span>Sueño</span><b>{(progress.metrics.sleepHours / 7).toFixed(1)} h</b><small>promedio diario</small></div>
        <div><span>Agua</span><b>{Math.round(progress.metrics.waterMl / 7).toLocaleString('es-CL')} ml</b><small>promedio diario</small></div>
      </div>

      <section className="card">
        <div className="row-between section-heading">
          <div><h2>Consistencia diaria</h2><p>Porcentaje de hábitos diarios cumplidos.</p></div>
          <span className="pill">ÚLTIMOS 7 DÍAS</span>
        </div>
        <div className="week-chart">
          {rows.map(row => (
            <div key={row.d}>
              <div className="bar-wrap"><span style={{ height: `${Math.max(4, row.score)}%` }} /></div>
              <b>{new Intl.DateTimeFormat('es-CL', { weekday: 'short' }).format(new Date(`${row.d}T12:00:00`)).replace('.', '')}</b>
              <small>{Math.round(row.score)}%</small>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="row-between section-heading">
          <div><h2>Avance según tus metas</h2><p>Compara lo realizado durante 7 días con los objetivos que definiste.</p></div>
        </div>
        <div className="summary-list detailed-progress">
          <Summary title="Ejercicio" icon="🏋️" value={progress.exercise} detail={`${progress.metrics.exerciseDone} entrenamientos / meta ${progress.metrics.exerciseTarget.toFixed(1)}`} />
          <Summary title="Lectura" icon="📚" value={progress.reading} detail={`${progress.metrics.pagesRead} / ${progress.metrics.pagesTarget} páginas`} />
          <Summary title="Sueño" icon="😴" value={progress.sleep} detail={`${progress.metrics.sleepHours.toFixed(1)} / ${progress.metrics.sleepTarget.toFixed(1)} horas`} />
          <Summary title="Hidratación" icon="💧" value={progress.hydration} detail={`${progress.metrics.waterMl.toLocaleString('es-CL')} / ${progress.metrics.waterTarget.toLocaleString('es-CL')} ml`} />
          <Summary title="Alimentación" icon="🥗" value={progress.food} detail={progress.food === null ? 'Meta de registro desactivada' : `${progress.metrics.foodDays} / ${progress.metrics.foodTarget} días con registro`} />
        </div>
      </section>
    </>
  );
}

function Summary({ title, icon, value, detail }: { title: string; icon: string; value: number | null; detail: string }) {
  return (
    <div className="progress-row">
      <div className="progress-row-top">
        <div className="progress-label"><span>{icon}</span><div><b>{title}</b><small>{detail}</small></div></div>
        <strong>{value === null ? '—' : `${value}%`}</strong>
      </div>
      <ProgressBar value={value ?? 0} />
    </div>
  );
}

function GoalsPanel({ username, goals, onSaved }: { username: string; goals: Goals; onSaved: () => void }) {
  const [form, setForm] = useState(goals);
  const [saved, setSaved] = useState(false);

  function save() {
    setGoals(username, form);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onSaved();
    }, 900);
  }

  return (
    <section className="card goals-card embedded-goals">
      <div className="goals-intro">
        <span className="pill">METAS PERSONALES</span>
        <h2>Define un ritmo realista</h2>
        <p>Estas metas son personales y se utilizan para calcular tu porcentaje de avance en Progreso.</p>
      </div>
      <Goal icon="🏋️" title="Ejercicio" desc="Días de entrenamiento por semana">
        <input type="number" min="1" max="7" value={form.exerciseDays} onChange={e => setForm({ ...form, exerciseDays: Number(e.target.value) })} /><span>días</span>
      </Goal>
      <Goal icon="📚" title="Lectura" desc="Páginas que quieres leer cada día">
        <input type="number" min="1" value={form.readingPages} onChange={e => setForm({ ...form, readingPages: Number(e.target.value) })} /><span>páginas</span>
      </Goal>
      <Goal icon="😴" title="Sueño" desc="Objetivo diario de descanso">
        <input type="number" min="4" max="12" step="0.5" value={form.sleepHours} onChange={e => setForm({ ...form, sleepHours: Number(e.target.value) })} /><span>horas</span>
      </Goal>
      <Goal icon="💧" title="Hidratación" desc="Objetivo diario orientativo">
        <input type="number" min="1000" max="5000" step="200" value={form.hydrationMl} onChange={e => setForm({ ...form, hydrationMl: Number(e.target.value) })} /><span>ml</span>
      </Goal>
      <Goal icon="🥗" title="Alimentación" desc="Registrar al menos una comida al día">
        <input type="checkbox" checked={form.foodTracking} onChange={e => setForm({ ...form, foodTracking: e.target.checked })} /><span>{form.foodTracking ? 'Activo' : 'Inactivo'}</span>
      </Goal>
      <button className="primary full big-btn" onClick={save}>{saved ? '✓ Metas guardadas' : 'Guardar mis metas'}</button>
    </section>
  );
}

function Goal({ icon, title, desc, children }: { icon: string; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="goal-row">
      <div className="goal-icon">{icon}</div>
      <div><b>{title}</b><small>{desc}</small></div>
      <div className="goal-control">{children}</div>
    </div>
  );
}
