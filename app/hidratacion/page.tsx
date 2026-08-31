'use client';

import { useMemo, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import ProgressBar from '@/components/ProgressBar';
import { currentUser, dateKey, getGoals, monthDateKeys, readJson, recentDateKeys, todayKey, writeJson } from '@/lib/storage';

type WaterLog = { id?: string; time: string; ml: number; at?: string; correction?: boolean };
type DayWater = { date: string; total: number; logs: WaterLog[]; pct: number };

const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export default function HydrationPage() {
  return <AuthGuard userOnly><AppShell><Water /></AppShell></AuthGuard>;
}

function Water() {
  const user = currentUser()!;
  const goal = getGoals(user.username).hydrationMl;
  const now = new Date();
  const today = todayKey();
  const key = `ritmo_water_${user.username}_${today}`;
  const logKey = `ritmo_waterlog_${user.username}_${today}`;
  const [water, setWater] = useState(() => readJson<number>(key, 0));
  const [logs, setLogs] = useState<WaterLog[]>(() => readJson(logKey, []));
  const [refresh, setRefresh] = useState(0);
  const [historyYear, setHistoryYear] = useState(now.getFullYear());
  const [historyMonth, setHistoryMonth] = useState(now.getMonth() + 1);
  const years = useMemo(() => Array.from({ length: 5 }, (_, i) => now.getFullYear() - i), [now]);

  function add(ml: number) {
    const next = Math.max(0, water + ml);
    setWater(next);
    writeJson(key, next);

    const currentTime = new Date();
    const entry: WaterLog = {
      id: crypto.randomUUID(),
      time: currentTime.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      at: currentTime.toISOString(),
      ml,
      correction: ml < 0,
    };
    const nextLogs = [entry, ...logs];
    setLogs(nextLogs);
    writeJson(logKey, nextLogs);
    setRefresh(value => value + 1);
  }

  const pct = Math.min(100, water / goal * 100);
  const weekDays = useMemo(() => hydrateDays(user.username, recentDateKeys(7), goal), [user.username, goal, refresh]);
  const currentMonthDates = useMemo(
    () => monthDateKeys(now.getFullYear(), now.getMonth() + 1).filter(item => item <= today),
    [now, today],
  );
  const currentMonthDays = useMemo(() => hydrateDays(user.username, currentMonthDates, goal), [user.username, currentMonthDates, goal, refresh]);

  const historyDates = useMemo(() => {
    const all = monthDateKeys(historyYear, historyMonth);
    return historyYear === now.getFullYear() && historyMonth === now.getMonth() + 1 ? all.filter(item => item <= today) : all;
  }, [historyYear, historyMonth, now, today]);
  const historyDays = useMemo(() => hydrateDays(user.username, historyDates, goal), [user.username, historyDates, goal, refresh]);

  const weekSummary = summarize(weekDays, goal);
  const monthSummary = summarize(currentMonthDays, goal);
  const historySummary = summarize(historyDays, goal);

  return (
    <>
      <PageHeader
        eyebrow="HIDRATACIÓN"
        title="Agua y seguimiento"
        text="Registra cada toma y revisa tu desempeño diario, semanal, mensual e histórico respecto de tu meta personal."
      />

      <section className="water-hero card">
        <div className="water-ring"><div><b>{Math.round(pct)}%</b><span>de tu meta de hoy</span></div></div>
        <div className="water-data">
          <h2>{water.toLocaleString('es-CL')} <small>/ {goal.toLocaleString('es-CL')} ml</small></h2>
          <ProgressBar value={pct} />
          <div className="water-buttons">
            <button className="primary giant" onClick={() => add(200)}>+ 200 ml</button>
            <button onClick={() => add(400)}>+ 400</button>
            <button onClick={() => add(600)}>+ 600</button>
            <button onClick={() => add(-200)} disabled={water === 0}>Corregir −200</button>
          </div>
          <p className="muted">La meta es orientativa y configurable. Las necesidades reales pueden variar según clima, actividad, alimentación y condiciones personales.</p>
        </div>
      </section>

      <section className="card water-today-log">
        <div className="row-between section-heading">
          <div><h2>Detalle de consumos de hoy</h2><p>Cada registro conserva la hora y la cantidad agregada.</p></div>
          <span className="pill">{logs.filter(item => !item.correction).length} TOMAS</span>
        </div>
        <div className="timeline water-timeline">
          {logs.length === 0 && <div className="empty">Aún no registras agua hoy.</div>}
          {logs.map((log, index) => (
            <div key={log.id || index} className={log.correction ? 'correction' : ''}>
              <span>{log.correction ? '↩️' : '💧'}</span>
              <b>{log.ml > 0 ? '+' : ''}{log.ml} ml</b>
              <small>{log.correction ? 'Corrección · ' : ''}{log.time}</small>
            </div>
          ))}
        </div>
      </section>

      <div className="hydration-summary-grid">
        <PeriodCard title="Últimos 7 días" icon="📆" summary={weekSummary} />
        <PeriodCard title={`${monthNames[now.getMonth()]} ${now.getFullYear()}`} icon="🗓️" summary={monthSummary} />
      </div>

      <section className="card hydration-week-detail">
        <div className="row-between section-heading"><div><h2>Detalle semanal</h2><p>Consumo total y cantidad de tomas de los últimos siete días.</p></div><span className="pill">7 DÍAS</span></div>
        <div className="hydration-bars">
          {weekDays.map(day => <WaterBar key={day.date} day={day} goal={goal} />)}
        </div>
      </section>

      <section className="card hydration-history">
        <div className="row-between section-heading history-heading">
          <div><span className="pill">HISTORIAL</span><h2>Revisar un mes específico</h2><p>Selecciona año y mes para consultar cómo estuvo tu hidratación en ese período.</p></div>
          <div className="history-filters">
            <label>Año<select value={historyYear} onChange={e => setHistoryYear(Number(e.target.value))}>{years.map(year => <option key={year}>{year}</option>)}</select></label>
            <label>Mes<select value={historyMonth} onChange={e => setHistoryMonth(Number(e.target.value))}>{monthNames.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}</select></label>
          </div>
        </div>

        <div className="history-kpis">
          <div><span>Total consumido</span><b>{historySummary.total.toLocaleString('es-CL')} ml</b></div>
          <div><span>Promedio diario</span><b>{historySummary.avg.toLocaleString('es-CL')} ml</b></div>
          <div><span>Cumplimiento de meta</span><b>{historySummary.percent}%</b></div>
          <div><span>Días con meta lograda</span><b>{historySummary.daysMet} / {historySummary.days}</b></div>
        </div>

        <div className="month-water-chart">
          {historyDays.map(day => (
            <div key={day.date} title={`${day.date}: ${day.total} ml`}>
              <div className="month-water-bar"><span style={{ height: `${Math.max(3, Math.min(100, day.pct))}%` }} /></div>
              <small>{Number(day.date.slice(-2))}</small>
            </div>
          ))}
        </div>

        <div className="table-wrap hydration-table-wrap">
          <table className="hydration-table">
            <thead><tr><th>Fecha</th><th>Total</th><th>Tomas</th><th>Meta</th><th>Estado</th></tr></thead>
            <tbody>
              {[...historyDays].reverse().map(day => (
                <tr key={day.date}>
                  <td>{formatDate(day.date)}</td>
                  <td><b>{day.total.toLocaleString('es-CL')} ml</b></td>
                  <td>{day.logs.filter(item => !item.correction).length}</td>
                  <td>{Math.round(day.pct)}%</td>
                  <td><span className={`status ${day.total >= goal ? 'ok' : 'off'}`}>{day.total >= goal ? 'Meta lograda' : day.total > 0 ? 'Bajo meta' : 'Sin registro'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function hydrateDays(username: string, dates: string[], goal: number): DayWater[] {
  return dates.map(date => {
    const total = Number(readJson<number>(`ritmo_water_${username}_${date}`, 0) || 0);
    const logs = readJson<WaterLog[]>(`ritmo_waterlog_${username}_${date}`, []);
    return { date, total, logs, pct: goal ? (total / goal) * 100 : 0 };
  });
}

function summarize(days: DayWater[], goal: number) {
  const total = days.reduce((sum, day) => sum + day.total, 0);
  const count = Math.max(1, days.length);
  return {
    total,
    avg: Math.round(total / count),
    percent: Math.min(100, Math.round(total / Math.max(1, goal * days.length) * 100)),
    daysMet: days.filter(day => day.total >= goal).length,
    days: days.length,
  };
}

function PeriodCard({ title, icon, summary }: { title: string; icon: string; summary: ReturnType<typeof summarize> }) {
  return (
    <article className="card hydration-period-card">
      <div className="hydration-period-title"><span>{icon}</span><div><small>RESUMEN</small><h3>{title}</h3></div></div>
      <div className="hydration-period-main"><b>{summary.percent}%</b><span>de la meta acumulada</span></div>
      <div className="hydration-mini-stats"><span><b>{summary.avg.toLocaleString('es-CL')} ml</b>promedio/día</span><span><b>{summary.daysMet}/{summary.days}</b>días con meta</span></div>
    </article>
  );
}

function WaterBar({ day, goal }: { day: DayWater; goal: number }) {
  const label = new Intl.DateTimeFormat('es-CL', { weekday: 'short' }).format(new Date(`${day.date}T12:00:00`)).replace('.', '');
  return (
    <div className="hydration-day">
      <div className="hydration-day-top"><b>{label}</b><small>{Number(day.date.slice(-2))}</small></div>
      <div className="hydration-vertical"><span style={{ height: `${Math.max(3, Math.min(100, day.pct))}%` }} /></div>
      <strong>{day.total ? `${(day.total / 1000).toFixed(1)}L` : '—'}</strong>
      <small>{day.logs.filter(item => !item.correction).length} tomas</small>
      {day.total >= goal && <i>✓</i>}
    </div>
  );
}

function formatDate(key: string) {
  return new Intl.DateTimeFormat('es-CL', { weekday: 'short', day: '2-digit', month: 'short' }).format(new Date(`${key}T12:00:00`));
}
