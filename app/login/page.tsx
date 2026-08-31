'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { currentUser, getUsers, login, saveUsers, seedUsers, type User } from '@/lib/storage';

type AccessRole = User['role'];
type Mode = 'login' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const [accessRole, setAccessRole] = useState<AccessRole>('user');
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    seedUsers();
    const active = currentUser();
    if (active) router.replace(active.role === 'admin' ? '/admin' : '/');
  }, [router]);

  function changeRole(role: AccessRole) {
    setAccessRole(role);
    setMode('login');
    setUsername('');
    setPassword('');
    setMessage('');
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    setMessage('');

    if (mode === 'login') {
      if (!login(username.trim(), password, accessRole)) {
        setMessage(accessRole === 'admin'
          ? 'Credenciales de administrador incorrectas.'
          : 'Usuario o contraseña incorrectos.');
        return;
      }
      router.replace(accessRole === 'admin' ? '/admin' : '/');
      return;
    }

    const users = getUsers();
    if (!name.trim() || !username.trim() || !password.trim()) {
      setMessage('Completa todos los campos.');
      return;
    }
    if (users.some(user => user.username.toLowerCase() === username.trim().toLowerCase())) {
      setMessage('Ese usuario ya existe.');
      return;
    }

    users.push({
      username: username.trim(),
      password,
      name: name.trim(),
      role: 'user',
      active: true,
    });
    saveUsers(users);
    setMode('login');
    setPassword('');
    setMessage('Cuenta creada. Ya puedes ingresar como usuario.');
  }

  const success = message.startsWith('Cuenta creada');

  return (
    <div className="login-page">
      <section className="login-hero">
        <div className="brand big"><div className="brand-dot" />RITMO</div>
        <h1>Construye una rutina que sí puedas sostener.</h1>
        <p>Ejercicio, lectura, sueño, hidratación y alimentación en un solo lugar.</p>
        <div className="hero-grid">
          <div>🏋️<b>Muévete</b></div><div>📚<b>Aprende</b></div><div>😴<b>Descansa</b></div><div>💧<b>Hidrátate</b></div>
        </div>
      </section>

      <section className="login-panel">
        <form className="auth-card" onSubmit={submit}>
          <div className="access-role-heading">
            <span>TIPO DE ACCESO</span>
            <h2>¿Cómo quieres ingresar?</h2>
          </div>

          <div className="role-access-grid">
            <button type="button" className={accessRole === 'user' ? 'selected' : ''} onClick={() => changeRole('user')}>
              <span className="role-access-icon">👤</span>
              <b>Usuario</b>
              <small>Hábitos, metas y progreso personal</small>
            </button>
            <button type="button" className={accessRole === 'admin' ? 'selected' : ''} onClick={() => changeRole('admin')}>
              <span className="role-access-icon">⚙️</span>
              <b>Administrador</b>
              <small>Seguimiento y gestión de cuentas</small>
            </button>
          </div>

          {accessRole === 'user' && (
            <div className="segmented">
              <button type="button" className={mode === 'login' ? 'selected' : ''} onClick={() => { setMode('login'); setMessage(''); }}>Ingresar</button>
              <button type="button" className={mode === 'register' ? 'selected' : ''} onClick={() => { setMode('register'); setMessage(''); }}>Crear cuenta</button>
            </div>
          )}

          <div className="auth-title-block">
            <h2>{mode === 'register' ? 'Crear cuenta de usuario' : accessRole === 'admin' ? 'Acceso administrador' : 'Bienvenido de vuelta'}</h2>
            <p className="auth-helper">
              {mode === 'register'
                ? 'Las cuentas creadas desde aquí son perfiles de usuario. Los administradores se crean desde el panel administrativo.'
                : accessRole === 'admin'
                  ? 'Este acceso es exclusivo para la administración de la plataforma.'
                  : 'Ingresa a tu espacio personal de hábitos y metas.'}
            </p>
          </div>

          {mode === 'register' && <label>Nombre<input value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" /></label>}
          <label>Usuario<input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" /></label>
          <label>Contraseña<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>

          {message && <div className={success ? 'notice success' : 'notice error'}>{message}</div>}
          <button className="primary full">{mode === 'register' ? 'Crear mi cuenta' : accessRole === 'admin' ? 'Ingresar como administrador' : 'Ingresar'}</button>

          {mode === 'login' && accessRole === 'admin' && (
            <div className="demo-box access-list"><b>Acceso administrador inicial</b><span>Diego123 / Diego123</span></div>
          )}
          {mode === 'login' && accessRole === 'user' && (
            <div className="demo-box access-list">
              <b>Usuarios iniciales</b>
              <span><strong>Diego:</strong> Usuariodiego123 / Usuariodiego123</span>
              <span><strong>Leslie:</strong> Usuarioleslie123 / Usuarioleslie123</span>
            </div>
          )}
        </form>
      </section>
    </div>
  );
}
