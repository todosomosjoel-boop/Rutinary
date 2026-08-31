'use client';

import { useEffect, useMemo, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import { currentUser, getGoals, readJson, todayKey, writeJson } from '@/lib/storage';

const BREATH_TOTAL = 120;

export default function SleepPage() {
  return <AuthGuard userOnly><AppShell><Sleep /></AppShell></AuthGuard>;
}

function Sleep() {
  const user = currentUser()!;
  const goals = getGoals(user.username);
  const key = `ritmo_sleep_${user.username}_${todayKey()}`;
  const saved = readJson<any>(key, { start: '23:30', end: '07:00', hours: 0, quality: 3 });
  const [start, setStart] = useState(saved.start);
  const [end, setEnd] = useState(saved.end);
  const [quality, setQuality] = useState(saved.quality || 3);
  const [hours, setHours] = useState(saved.hours || 0);
  const [breathRemaining, setBreathRemaining] = useState(BREATH_TOTAL);
  const [breathing, setBreathing] = useState(false);

  const status = useMemo(() => hours === 0
    ? ['Sin registro', 'Registra tu descanso para ver una recomendación.']
    : hours < 7
      ? ['Bajo el rango habitual', 'Dormiste menos de 7 horas. Si puedes, prioriza una noche más larga hoy.']
      : hours <= 9
        ? ['Dentro del rango orientativo', 'Para muchos adultos, 7–9 horas suele ser un rango adecuado.']
        : ['Sobre el rango orientativo', 'Una noche larga ocasional puede ser normal; observa cómo te sientes durante el día.'], [hours]);

  useEffect(() => {
    if (!breathing) return;
    if (breathRemaining <= 0) {
      setBreathing(false);
      return;
    }
    const interval = window.setInterval(() => setBreathRemaining(value => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(interval);
  }, [breathing, breathRemaining]);

  const elapsed = BREATH_TOTAL - breathRemaining;
  const cyclePosition = elapsed % 10;
  const phase = breathRemaining === 0 ? 'Completado' : cyclePosition < 4 ? 'Inhala' : 'Exhala';
  const phaseRemaining = breathRemaining === 0 ? 0 : cyclePosition < 4 ? 4 - cyclePosition : 10 - cyclePosition;

  function save() {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins <= 0) mins += 1440;
    const value = Math.round(mins / 6) / 10;
    setHours(value);
    writeJson(key, { start, end, hours: value, quality });
  }

  function toggleBreathing() {
    if (breathRemaining === 0) setBreathRemaining(BREATH_TOTAL);
    setBreathing(value => !value);
  }

  function resetBreathing() {
    setBreathing(false);
    setBreathRemaining(BREATH_TOTAL);
  }

  const timerText = `${String(Math.floor(breathRemaining / 60)).padStart(2, '0')}:${String(breathRemaining % 60).padStart(2, '0')}`;

  return (
    <>
      <PageHeader eyebrow="SUEÑO" title="Descanso de hoy" text="Registra cuánto dormiste y encuentra herramientas simples para preparar un descanso más reparador." />

      <div className="two-col">
        <section className="card">
          <h2>Registro</h2>
          <div className="split">
            <label>Hora de dormir<input type="time" value={start} onChange={e => setStart(e.target.value)} /></label>
            <label>Hora de despertar<input type="time" value={end} onChange={e => setEnd(e.target.value)} /></label>
          </div>
          <label>¿Cómo sentiste tu descanso?</label>
          <div className="mood-row">
            {['😫','😕','😐','🙂','😴'].map((mood, index) => (
              <button key={mood} className={quality === index + 1 ? 'selected' : ''} onClick={() => setQuality(index + 1)}>
                {mood}<small>{['Muy malo','Malo','Normal','Bueno','Excelente'][index]}</small>
              </button>
            ))}
          </div>
          <button className="primary full" onClick={save}>Guardar sueño</button>
        </section>

        <section className="card sleep-summary">
          <div className="sleep-orb"><b>{hours || '—'}</b><span>horas</span></div>
          <h2>{status[0]}</h2>
          <p>{status[1]}</p>
          <div className="recommend"><b>Meta personal</b><span>{goals.sleepHours} horas</span></div>
        </section>
      </div>

      <section className="sleep-tips-highlight">
        <div className="sleep-tips-heading">
          <div className="sleep-tips-icon">🌙</div>
          <div><span>PREPARA TU NOCHE</span><h2>Consejos para un descanso reparador</h2><p>Pequeñas señales repetidas antes de dormir pueden ayudar a que el cuerpo reconozca que es momento de bajar el ritmo.</p></div>
        </div>
        <div className="sleep-tip-grid">
          <article><span>🕰️</span><b>Horarios regulares</b><p>Intenta acostarte y levantarte en horarios relativamente parecidos, especialmente entre semana.</p></article>
          <article><span>📵</span><b>Baja los estímulos</b><p>Reduce pantallas, trabajo intenso y contenido muy estimulante durante el tramo previo a dormir.</p></article>
          <article><span>🌡️</span><b>Prepara el ambiente</b><p>Un dormitorio oscuro, silencioso y confortable suele favorecer una transición más tranquila al sueño.</p></article>
          <article><span>☕</span><b>Cuida los estimulantes</b><p>Si notas que te afectan, evita cafeína u otros estimulantes cerca de la hora de dormir.</p></article>
        </div>
      </section>

      <section className="card breathing-card">
        <div className="breathing-copy">
          <span className="pill">EJERCICIO GUIADO · 2 MINUTOS</span>
          <h2>Respiración 4–6 para bajar el ritmo</h2>
          <p>Inhala suavemente durante 4 segundos y exhala durante 6. El temporizador te va indicando cada fase para que no tengas que contar.</p>
          <div className="breathing-note">Si sientes mareo o incomodidad, detén el ejercicio y vuelve a respirar normalmente.</div>
        </div>

        <div className={`breathing-timer ${breathing ? 'running' : ''} ${phase === 'Exhala' ? 'exhale' : ''}`}>
          <div className="breath-circle"><span>{phase}</span><b>{phaseRemaining || '✓'}</b><small>{timerText} restantes</small></div>
          <div className="breathing-actions">
            <button className="primary" onClick={toggleBreathing}>{breathing ? 'Pausar' : breathRemaining === 0 ? 'Repetir ejercicio' : 'Comenzar'}</button>
            <button className="ghost" onClick={resetBreathing}>Reiniciar</button>
          </div>
        </div>
      </section>
    </>
  );
}
