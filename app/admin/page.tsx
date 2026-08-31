'use client';

import { useMemo, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import ProgressBar from '@/components/ProgressBar';
import { getGoals, getHabitProgress, getUsers } from '@/lib/storage';

export default function AdminPage() {
  return <AuthGuard adminOnly><AppShell><AdminDashboard /></AppShell></AuthGuard>;
}

function AdminDashboard() {
  const users = useMemo(() => getUsers().filter(user => user.role === 'user' && user.active), []);
  const [selected, setSelected] = useState(users[0]?.username || '');
  const [days, setDays] = useState(7);
  const selectedUser = users.find(user => user.username === selected) || users[0];
  const progress = selectedUser ? getHabitProgress(selectedUser.username, days) : null;
  const goals = selectedUser ? getGoals(selectedUser.username) : null;
  const allRows = users.map(user => ({ user, progress: getHabitProgress(user.username, days) }));

  return (
    <>
      <PageHeader
        eyebrow="ADMINISTRACIÓN"
        title="Dashboard de usuarios"
        text="Revisa el avance de cada persona en relación con las metas que cada usuario definió para sí mismo."
      />

      <section className="card admin-filter-card">
        <div className="admin-filter-grid">
          <label>
            Usuario a revisar
            <select value={selectedUser?.username || ''} onChange={e => setSelected(e.target.value)}>
              {users.map(user => <option key={user.username} value={user.username}>{user.name} · {user.username}</option>)}
            </select>
          </label>
          <label>
            Período
            <select value={days} onChange={e => setDays(Number(e.target.value))}>
              <option value={7}>Últimos 7 días</option>
              <option value={30}>Últimos 30 días</option>
            </select>
          </label>
          <div className="admin-filter-stat">
            <span>Usuarios activos</span>
            <b>{users.length}</b>
          </div>
        </div>
      </section>

      {selectedUser && progress && goals ? (
        <>
          <section className="admin-user-heading">
            <div>
              <span className="pill">USUARIO SELECCIONADO</span>
              <h2>{selectedUser.name}</h2>
              <p>{selectedUser.username} · avance calculado según sus metas personales</p>
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
            <div className="row-between section-heading"><div><h2>Metas definidas por el usuario</h2><p>El administrador puede revisar las metas, pero su edición corresponde al propio usuario.</p></div><span className="pill">SOLO LECTURA</span></div>
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
          <div><h2>Resumen de usuarios</h2><p>Selecciona un usuario para ver el detalle superior.</p></div>
          <span className="pill">{days} DÍAS</span>
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
