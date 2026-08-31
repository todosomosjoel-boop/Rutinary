'use client';

import { useEffect, useMemo, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import { currentUser, dateKey, readJson, todayKey, writeJson } from '@/lib/storage';

type Exercise = { name: string; sets: number; reps: string; rest: number; img: string; tip: string };
type DayPlan = { focus: string; subtitle: string; duration: string; icon: string; exercises: Exercise[] };

const plans: DayPlan[] = [
  {
    focus: 'Tren inferior', subtitle: 'Piernas y glúteos · Fuerza base', duration: '38–42 min', icon: '🦵',
    exercises: [
      { name: 'Sentadilla tempo', sets: 4, reps: '12', rest: 50, img: '🧍', tip: 'Baja en 3 segundos, pausa brevemente y sube empujando el suelo.' },
      { name: 'Zancada hacia atrás', sets: 3, reps: '10 c/pierna', rest: 45, img: '🚶', tip: 'Da un paso hacia atrás manteniendo el torso erguido y la rodilla delantera estable.' },
      { name: 'Peso muerto rumano con mochila', sets: 4, reps: '12', rest: 60, img: '🎒', tip: 'Lleva la cadera hacia atrás con espalda neutra y la mochila cerca del cuerpo.' },
      { name: 'Step-up en escalón firme', sets: 3, reps: '10 c/pierna', rest: 45, img: '🪜', tip: 'Usa un escalón bajo y estable. Sube controlando la rodilla y baja lentamente.' },
      { name: 'Puente de glúteo con marcha', sets: 3, reps: '12 alternas', rest: 45, img: '🌉', tip: 'Mantén la pelvis elevada mientras alternas un pie sin girar la cadera.' },
    ],
  },
  {
    focus: 'Tren superior', subtitle: 'Pecho, espalda y hombros', duration: '35–40 min', icon: '💪',
    exercises: [
      { name: 'Flexión inclinada en mesa', sets: 4, reps: '10–14', rest: 50, img: '🤸', tip: 'Apoya las manos en una superficie firme y mantén el cuerpo alineado.' },
      { name: 'Remo bilateral con mochila', sets: 4, reps: '12', rest: 60, img: '🎒', tip: 'Inclina el torso con espalda neutra y lleva la mochila hacia el abdomen.' },
      { name: 'Press de hombros con botellas', sets: 3, reps: '12', rest: 50, img: '🧴', tip: 'Empuja las botellas sobre la cabeza sin arquear la zona lumbar.' },
      { name: 'Flexión cerrada con apoyo', sets: 3, reps: '8–12', rest: 55, img: '🙌', tip: 'Mantén los codos cercanos al cuerpo. Puedes apoyar rodillas para regular dificultad.' },
      { name: 'Pull-over con mochila en el suelo', sets: 3, reps: '12', rest: 45, img: '🛏️', tip: 'Acostado, lleva la mochila detrás de la cabeza solo hasta donde controles el movimiento.' },
    ],
  },
  {
    focus: 'Zona central', subtitle: 'Core, estabilidad y control', duration: '30–35 min', icon: '🎯',
    exercises: [
      { name: 'Plancha con toque de hombros', sets: 3, reps: '12 c/lado', rest: 40, img: '🧱', tip: 'Separa ligeramente los pies y evita que la pelvis rote al tocar cada hombro.' },
      { name: 'Dead bug alternado', sets: 3, reps: '10 c/lado', rest: 40, img: '🐞', tip: 'Mantén la espalda baja en contacto suave con el suelo mientras extiendes brazo y pierna opuestos.' },
      { name: 'Bird-dog con pausa', sets: 3, reps: '10 c/lado', rest: 40, img: '🐕', tip: 'Desde cuatro apoyos, extiende brazo y pierna opuestos y pausa 2 segundos.' },
      { name: 'Mountain climber lento', sets: 3, reps: '16 alternas', rest: 45, img: '⛰️', tip: 'Lleva cada rodilla hacia el pecho sin perder la posición estable de hombros.' },
      { name: 'Plancha lateral con rotación', sets: 3, reps: '8 c/lado', rest: 45, img: '🔄', tip: 'Rota el brazo por debajo del torso y vuelve a abrir el pecho de forma controlada.' },
    ],
  },
  {
    focus: 'Tren inferior', subtitle: 'Unilateral, cadera y estabilidad', duration: '38–43 min', icon: '🦵',
    exercises: [
      { name: 'Sentadilla búlgara con silla', sets: 3, reps: '9 c/pierna', rest: 60, img: '🪑', tip: 'Usa una silla estable y una profundidad que puedas controlar sin perder equilibrio.' },
      { name: 'Buenos días con mochila', sets: 4, reps: '12', rest: 50, img: '🎒', tip: 'Mochila contra el pecho, rodillas suaves y cadera hacia atrás.' },
      { name: 'Zancada lateral alterna', sets: 3, reps: '10 c/lado', rest: 50, img: '↔️', tip: 'Desplaza la cadera hacia el lado de la pierna que flexiona manteniendo el otro pie apoyado.' },
      { name: 'Puente de glúteo a una pierna', sets: 3, reps: '10 c/lado', rest: 45, img: '🌉', tip: 'Eleva la cadera sin rotarla. Si es exigente, acorta el recorrido.' },
      { name: 'Sentadilla + elevación de talones', sets: 3, reps: '14', rest: 45, img: '⬆️', tip: 'Al terminar la sentadilla, sube sobre la punta de los pies con control.' },
    ],
  },
  {
    focus: 'Tren superior', subtitle: 'Empuje, tirón y control escapular', duration: '36–41 min', icon: '💪',
    exercises: [
      { name: 'Flexión tradicional progresiva', sets: 4, reps: '8–12', rest: 60, img: '🤸', tip: 'Cuerpo alineado. Reduce el recorrido o apoya rodillas si lo necesitas.' },
      { name: 'Remo unilateral con mochila', sets: 4, reps: '10 c/brazo', rest: 55, img: '🎒', tip: 'Apoya una mano en una mesa firme y lleva la mochila hacia la cadera.' },
      { name: 'Flexión pike', sets: 3, reps: '8–10', rest: 60, img: '🔺', tip: 'Eleva la cadera y lleva la cabeza hacia delante de las manos, sin forzar el cuello.' },
      { name: 'Press de pecho con mochila en suelo', sets: 3, reps: '12', rest: 50, img: '🛏️', tip: 'Acostado, empuja la mochila desde el pecho y controla la bajada.' },
      { name: 'Remo alto con toalla isométrica', sets: 3, reps: '20–30 s', rest: 45, img: '🧻', tip: 'Tira de ambos extremos de una toalla creando tensión continua sin movimientos bruscos.' },
    ],
  },
  {
    focus: 'Zona central', subtitle: 'Core dinámico y estabilidad global', duration: '32–36 min', icon: '🎯',
    exercises: [
      { name: 'Bear crawl controlado', sets: 4, reps: '20–30 s', rest: 45, img: '🐻', tip: 'Rodillas a pocos centímetros del suelo y pasos cortos manteniendo la espalda estable.' },
      { name: 'Plancha caminando con manos', sets: 3, reps: '8', rest: 50, img: '🚶‍♂️', tip: 'Desde pie, camina con las manos hasta plancha y vuelve sin acelerar.' },
      { name: 'Hollow tuck alternado', sets: 3, reps: '10 c/lado', rest: 40, img: '🥚', tip: 'Mantén abdomen activo y alterna extensión de pierna sin despegar demasiado la espalda baja.' },
      { name: 'Rotación sentada con mochila', sets: 3, reps: '12 c/lado', rest: 45, img: '🎒', tip: 'Gira el torso con una mochila liviana y pies apoyados para priorizar el control.' },
      { name: 'Plancha invertida con rodilla', sets: 3, reps: '10 c/lado', rest: 45, img: '🔁', tip: 'Empuja el suelo con las manos, eleva la cadera y acerca una rodilla por vez.' },
    ],
  },
  {
    focus: 'Tren inferior + movilidad', subtitle: 'Trabajo suave para cerrar la semana', duration: '30–35 min', icon: '🌿',
    exercises: [
      { name: 'Sentadilla sumo controlada', sets: 3, reps: '14', rest: 45, img: '🧍', tip: 'Pies algo más abiertos, puntas levemente hacia fuera y rodillas siguiendo la dirección de los pies.' },
      { name: 'Zancada frontal corta', sets: 3, reps: '8 c/pierna', rest: 45, img: '➡️', tip: 'Paso cómodo, baja solo hasta donde mantengas control y vuelve empujando con el pie delantero.' },
      { name: 'Peso muerto maleta con mochila', sets: 3, reps: '10 c/lado', rest: 50, img: '🧳', tip: 'Sujeta la mochila a un lado y evita inclinar el tronco durante el movimiento.' },
      { name: 'Sentarse y levantarse de silla', sets: 3, reps: '15', rest: 40, img: '🪑', tip: 'Toca la silla suavemente y vuelve a subir sin dejarte caer.' },
      { name: 'Estocada de corredor dinámica', sets: 3, reps: '8 c/lado', rest: 35, img: '🏃', tip: 'Alterna una estocada amplia con regreso controlado, priorizando movilidad de cadera.' },
    ],
  },
];

const weekdays = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

function mondayOfCurrentWeek() {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  const jsDay = d.getDay();
  const diff = jsDay === 0 ? -6 : 1 - jsDay;
  d.setDate(d.getDate() + diff);
  return d;
}

export default function ExercisePage() {
  return <AuthGuard userOnly><AppShell><Exercise /></AppShell></AuthGuard>;
}

function Exercise() {
  const user = currentUser()!;
  const weekDates = useMemo(() => {
    const monday = mondayOfCurrentWeek();
    return weekdays.map((label, index) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + index);
      return { label, date: d, key: dateKey(d), plan: plans[index] };
    });
  }, []);

  const today = todayKey();
  const initialIndex = Math.max(0, weekDates.findIndex(item => item.key === today));
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const selectedDay = weekDates[selectedIndex];
  const selectedPlan = selectedDay.plan;
  const key = `ritmo_exercise_${user.username}_${selectedDay.key}`;
  const [done, setDone] = useState(false);
  const [timer, setTimer] = useState(0);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    setDone(Boolean(readJson<any>(key, { completed: false }).completed));
    setActive(null);
    setTimer(0);
  }, [key]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = window.setInterval(() => setTimer(value => value - 1), 1000);
    return () => window.clearInterval(interval);
  }, [timer]);

  const isFuture = selectedDay.key > today;
  const totalSeries = selectedPlan.exercises.reduce((sum, item) => sum + item.sets, 0);

  function complete() {
    if (isFuture) return;
    setDone(true);
    writeJson(key, { completed: true, completedAt: new Date().toISOString(), focus: selectedPlan.focus });
  }

  return (
    <>
      <PageHeader
        eyebrow="PLAN SEMANAL · LUNES A DOMINGO"
        title={`${selectedDay.label} · ${selectedPlan.focus}`}
        text="Rutinas diferentes durante la semana, pensadas para casa y alternando tren inferior, tren superior y zona central."
      />

      <section className="weekly-workout-strip" aria-label="Días de entrenamiento">
        {weekDates.map((day, index) => {
          const dayDone = Boolean(readJson<any>(`ritmo_exercise_${user.username}_${day.key}`, { completed: false }).completed);
          return (
            <button key={day.key} className={`${selectedIndex === index ? 'selected' : ''} ${day.key === today ? 'today' : ''}`} onClick={() => setSelectedIndex(index)}>
              <small>{day.label.slice(0, 3)}</small>
              <b>{day.date.getDate()}</b>
              <span>{day.plan.icon} {day.plan.focus.replace('Tren ', '').replace('Zona ', '')}</span>
              {dayDone && <i>✓</i>}
            </button>
          );
        })}
      </section>

      <div className="stats-row">
        <div className="stat"><span>⏱️</span><b>{selectedPlan.duration}</b><small>duración estimada</small></div>
        <div className="stat"><span>🔁</span><b>{totalSeries} series</b><small>volumen del día</small></div>
        <div className="stat"><span>🏠</span><b>Casa</b><small>mochila, silla o botellas</small></div>
      </div>

      <div className="focus-banner"><span>{selectedPlan.icon}</span><div><b>{selectedPlan.focus}</b><small>{selectedPlan.subtitle}</small></div>{isFuture && <em>PRÓXIMO</em>}</div>

      {timer > 0 && <div className="timer-banner"><span>Descanso</span><b>{timer}s</b><button onClick={() => setTimer(0)}>Saltar</button></div>}

      <div className="exercise-list">
        {selectedPlan.exercises.map((exercise, index) => (
          <div className="exercise-card" key={exercise.name}>
            <div className="exercise-visual">{exercise.img}</div>
            <div className="exercise-main">
              <div className="row-between"><h3>{index + 1}. {exercise.name}</h3><button className="ghost" onClick={() => setActive(active === index ? null : index)}>Técnica</button></div>
              <div className="chips"><span>{exercise.sets} series</span><span>{exercise.reps}</span><span>Descanso {exercise.rest}s</span></div>
              {active === index && <p className="tip">{exercise.tip}</p>}
            </div>
            <button className="round-btn" onClick={() => setTimer(exercise.rest)} title="Iniciar descanso">▶</button>
          </div>
        ))}
      </div>

      <div className="sticky-action">
        <button className={`primary big-btn ${done ? 'done' : ''}`} disabled={isFuture} onClick={complete}>
          {isFuture ? 'Entrenamiento planificado' : done ? '✓ Entrenamiento completado' : selectedDay.key === today ? 'Finalizar entrenamiento de hoy' : 'Marcar entrenamiento como completado'}
        </button>
      </div>
    </>
  );
}
