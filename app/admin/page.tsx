'use client';

import { useMemo, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import ProgressBar from '@/components/ProgressBar';
import { dateKey, getGoals, getHabitProgressForDates, getUsers, monthDateKeys, monthWeeks } from '@/lib/storage';

const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export default function AdminPage() {
  return <AuthGuard adminOnly><AppShell><AdminDashboard /></AppShell></AuthGuard>;
}

function AdminDashboard() {
  const now = new Date();
  const users = useMemo(() => getUsers().filter(user => user.role === 'user' && user.active), []);
  const [selected, setSelected] = useState(users[0]?.username || '');
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [week, setWeek] = useState('all');

  const years = useMemo(() => Array.from({ length: 5 }, (_, i) => now.getFullYear() - i), [now]);
  const weeks = useMemo(() => monthWeeks(year, month), [year, month]);
  const selectedUser = users.find(user => user.username === selected) || users[0];

  const dates = useMemo(() => {
    const raw = week === 'all'
      ? monthDateKeys(year, month)
      : weeks.find(item => String(item.id) === week)?.dates || monthDateKeys(year, month);
    const today = dateKey();
    return raw.filter(key => key <= today);
  }, [year, month, week, weeks]);

  const periodLabel = week === 'all'
    ? `${monthNames[month - 1]} ${year}`
    : `${weeks.find(item => String(item.id) === week)?.label || 'Semana'} · ${monthNames[month - 1]} ${year}`;

  const progress = selectedUser ? getHabitProgressForDates(selectedUser.username, dates) : null;
  const goals = selectedUser ? getGoals(selectedUser.username) : null;
  const allRows = users.map(user => ({ user, progress: getHabitProgressForDates(user.username, dates) }));

  return (
    <>
      <PageHeader
        eyebrow="ADMINISTRACIÓN"
        title="Dashboard de usuarios"
        text="Filtra por persona, año, mes y semana para revisar el porcentaje de avance respecto de sus metas personales."
      />

      <section className="card admin-filter-card">
        <div className="admin-filter-grid admin-filter-grid-v2">
          <label>
            Usuario a revisar
            <select value={selectedUser?.username || ''} onChange={e => setSelected(e.target.value)}>
              {users.map(user => <option key={user.username} value={user.username}>{user.name} · {user.username}</option>)}
            </select>
          </label>
          <label>
            Año
            <select value={year} onChange={e => { setYear(Number(e.target.value)); setWeek('all'); }}>
              {years.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            Mes
            <select value={month} onChange={e => { setMonth(Number(e.target.value)); setWeek('all'); }}>
              {monthNames.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}
            </select>
          </label>
          <label>
            Semana
            <select value={week} onChange={e => setWeek(e.target.value)}>
              <option value="all">Todo el mes</option>
              {weeks.map(item => <option key={item.id} value={String(item.id)}>{item.label}</option>)}
            </select>
          </label>
          <div className="admin-filter-stat">
            <span>Usuarios activos</span>
            <b>{users.length}</b>
          </div>
        </div>
        <div className="filter-period-note">📅 Período analizado: <b>{periodLabel}</b> · {dates.length} día{dates.length === 1 ? '' : 's'} considerado{dates.length === 1 ? '' : 's'}</div>
      </section>

      {selectedUser && progress && goals ? (
        <>
          <section className="admin-user-heading">
            <div>
              <span className="pill">USUARIO SELECCIONADO</span>
              <h2>{selectedUser.name}</h2>
              <p>{selectedUser.username} · avance según sus metas · {periodLabel}</p>
            </div>
            <div className="admin-overall-score"><b>{progress.overall}%</b><span>Cumplimiento general</span></div>
          </section>

          <div className="admin-habit-grid">
            <AdminHabit icon="🏋️" title="Ejercicio" value={progress.exercise} detail={`${progress.metrics.exerciseDone} realizados · meta ${progress.metrics.exerciseTarget.toFixed(1)}`} />
            <AdminHabit icon="📚" title="Lectura" value={progress.reading} detail={`${progress.metrics.pagesRead} / ${progress.metrics.pagesTarget} páginas`} />
            <AdminHabit icon="😴" title="Sueño" value={progress.sleep} detail={`${progress.metrics.sleepHours.toFixed(1)} / ${progress.metrics.sleepTarget.toFixed(1)} horas`} />
            <AdminHabit icon="💧" title="Hidratación" value={progress.hydration} detail={`${progress.metrics.waterMl.toLocaleString('es-CL')} / ${progress.metrics.waterTarget.toLocaleString('es-CL')} ml`} />
            <AdminHabit icon="🥗" title="Alimentación" value={progress.food} detail={progress.food === null ? 'Meta desactivada por el usuario' : `${progress.metrics.foodDays} / ${progress.metrics.foodTarget} días registrados`} />
          </div>

          <section className="card admin-goal-summary">
            <div className="row-between section-heading"><div><h2>Metas definidas por el usuario</h2><p>La edición de estas metas corresponde al propio usuario desde Progreso → Administrar metas.</p></div><span className="pill">SOLO LECTURA</span></div>
            <div className="goal-summary-grid">
              <div><span>🏋️ Ejercicio</span><b>{goals.exerciseDays} días/semana</b></div>
              <div><span>📚 Lectura</span><b>{goals.readingPages} pág/día</b></div>
              <div><span>😴 Sueño</span><b>{goals.sleepHours} h/día</b></div>
              <div><span>💧 Hidratación</span><b>{goals.hydrationMl.toLocaleString('es-CL')} ml/día</b></div>
              <div><span>🥗 Alimentación</span><b>{goals.foodTracking ? 'Registro activo' : 'Sin meta'}</b></div>
            </div>
          </section>
        </>
      ) : <section className="card empty">No existen usuarios activos para revisar.</section>}

      <section className="card admin-users-table">
        <div className="row-between section-heading">
          <div><h2>Resumen de usuarios</h2><p>Comparación del cumplimiento durante {periodLabel.toLowerCase()}.</p></div>
          <span className="pill">{dates.length} DÍAS</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Usuario</th><th>General</th><th>Ejercicio</th><th>Lectura</th><th>Sueño</th><th>Agua</th><th>Alimentación</th></tr></thead>
            <tbody>
              {allRows.map(({ user, progress: item }) => (
                <tr key={user.username} className={selectedUser?.username === user.username ? 'selected-row' : ''} onClick={() => setSelected(user.username)}>
                  <td><b>{user.name}</b><small>{user.username}</small></td>
                  <td><strong>{item.overall}%</strong></td>
                  <td>{item.exercise}%</td>
                  <td>{item.reading}%</td>
                  <td>{item.sleep}%</td>
                  <td>{item.hydration}%</td>
                  <td>{item.food === null ? '—' : `${item.food}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function AdminHabit({ icon, title, value, detail }: { icon: string; title: string; value: number | null; detail: string }) {
  return (
    <article className="card admin-habit-card">
      <div className="admin-habit-top"><span className="admin-habit-icon">{icon}</span><strong>{value === null ? '—' : `${value}%`}</strong></div>
      <h3>{title}</h3>
      <p>{detail}</p>
      <ProgressBar value={value ?? 0} />
    </article>
  );
}
