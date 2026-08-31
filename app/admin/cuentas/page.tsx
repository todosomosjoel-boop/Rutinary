'use client';

import { FormEvent, useMemo, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import { currentUser, deleteUser, getUsers, saveUsers, updateUser, type User } from '@/lib/storage';

type AccountForm = {
  name: string;
  username: string;
  password: string;
  role: User['role'];
  active: boolean;
};

const emptyForm: AccountForm = { name: '', username: '', password: '', role: 'user', active: true };

export default function AccountsPage() {
  return <AuthGuard adminOnly><AppShell><Accounts /></AppShell></AuthGuard>;
}

function Accounts() {
  const me = currentUser()!;
  const [users, setUsers] = useState<User[]>(() => getUsers());
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<AccountForm>(emptyForm);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'user' | 'admin'>('all');

  const visible = useMemo(
    () => users.filter(user => filter === 'all' || user.role === filter),
    [users, filter],
  );

  const counts = useMemo(() => ({
    total: users.length,
    users: users.filter(user => user.role === 'user').length,
    admins: users.filter(user => user.role === 'admin').length,
    active: users.filter(user => user.active).length,
  }), [users]);

  function reset() {
    setEditing(null);
    setForm(emptyForm);
    setMessage('');
  }

  function edit(user: User) {
    setEditing(user.username);
    setForm({ ...user });
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    setMessage('');
    const next: User = {
      name: form.name.trim(),
      username: form.username.trim(),
      password: form.password,
      role: form.role,
      active: form.active,
    };

    if (!next.name || !next.username || !next.password) {
      setMessage('Completa nombre, usuario y contraseña.');
      return;
    }

    if (editing) {
      const original = users.find(user => user.username === editing);
      if (!original) return;
      if (editing === me.username) {
        next.role = 'admin';
        next.active = true;
      }
      const result = updateUser(editing, next);
      setMessage(result.message);
      if (!result.ok) return;
      setUsers(getUsers());
      setEditing(null);
      setForm(emptyForm);
      return;
    }

    if (users.some(user => user.username.toLowerCase() === next.username.toLowerCase())) {
      setMessage('Ese nombre de usuario ya existe.');
      return;
    }
    saveUsers([...users, next]);
    setUsers(getUsers());
    setForm(emptyForm);
    setMessage('Cuenta creada correctamente.');
  }

  function remove(user: User) {
    if (!window.confirm(`¿Eliminar la cuenta ${user.username}?`)) return;
    const result = deleteUser(user.username);
    setMessage(result.message);
    if (result.ok) {
      setUsers(getUsers());
      if (editing === user.username) reset();
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="ADMINISTRACIÓN"
        title="Usuarios y administradores"
        text="Crea, modifica, activa o elimina las cuentas que pueden ingresar a la plataforma."
      />

      <div className="account-kpis">
        <div><span>Total de cuentas</span><b>{counts.total}</b></div>
        <div><span>Usuarios</span><b>{counts.users}</b></div>
        <div><span>Administradores</span><b>{counts.admins}</b></div>
        <div><span>Activas</span><b>{counts.active}</b></div>
      </div>

      <div className="account-layout">
        <section className="card account-form-card">
          <div className="row-between section-heading">
            <div>
              <span className="pill">{editing ? 'EDITANDO CUENTA' : 'NUEVA CUENTA'}</span>
              <h2>{editing ? form.name || form.username : 'Agregar persona'}</h2>
              <p>Define si tendrá acceso como usuario o como administrador.</p>
            </div>
            {editing && <button className="ghost" onClick={reset}>Cancelar</button>}
          </div>

          <form className="account-form" onSubmit={submit}>
            <label>Nombre
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nombre de la persona" />
            </label>
            <label>Usuario
              <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Nombre de acceso" autoComplete="off" />
            </label>
            <label>Contraseña
              <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Contraseña" autoComplete="new-password" />
            </label>
            <div className="split">
              <label>Tipo de cuenta
                <select value={form.role} disabled={editing === me.username} onChange={e => setForm({ ...form, role: e.target.value as User['role'] })}>
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </label>
              <label>Estado
                <select value={form.active ? 'active' : 'inactive'} disabled={editing === me.username} onChange={e => setForm({ ...form, active: e.target.value === 'active' })}>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </label>
            </div>
            {editing === me.username && <p className="muted self-account-note">Tu propia cuenta debe permanecer como administrador activo mientras estás conectado.</p>}
            {message && <div className={`notice ${message.includes('correct') || message.includes('actualizada') || message.includes('eliminada') ? 'success' : 'error'}`}>{message}</div>}
            <button className="primary full">{editing ? 'Guardar cambios' : 'Crear cuenta'}</button>
          </form>
        </section>

        <section className="card account-list-card">
          <div className="row-between section-heading account-list-heading">
            <div><h2>Cuentas registradas</h2><p>Los usuarios y administradores se gestionan por separado mediante su rol.</p></div>
            <select className="compact-select" value={filter} onChange={e => setFilter(e.target.value as typeof filter)}>
              <option value="all">Todas</option>
              <option value="user">Usuarios</option>
              <option value="admin">Administradores</option>
            </select>
          </div>

          <div className="accounts-list">
            {visible.map(user => (
              <article className="account-row" key={user.username}>
                <div className={`account-avatar ${user.role}`}>{user.role === 'admin' ? '⚙️' : '👤'}</div>
                <div className="account-copy">
                  <div className="account-name-line">
                    <b>{user.name}</b>
                    <span className={`role-badge ${user.role}`}>{user.role === 'admin' ? 'Administrador' : 'Usuario'}</span>
                    <span className={`status ${user.active ? 'ok' : 'off'}`}>{user.active ? 'Activo' : 'Inactivo'}</span>
                  </div>
                  <small>{user.username}{user.username === me.username ? ' · Tu cuenta' : ''}</small>
                </div>
                <div className="account-actions">
                  <button className="ghost" onClick={() => edit(user)}>Modificar</button>
                  <button className="ghost danger-text" disabled={user.username === me.username} onClick={() => remove(user)}>Eliminar</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
