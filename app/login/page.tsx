'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { currentUser, getUsers, login, saveUsers, seedUsers } from '@/lib/storage';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    seedUsers();
    const active = currentUser();
    if (active) router.replace(active.role === 'admin' ? '/admin' : '/');
  }, [router]);

  function submit(e: FormEvent) {
    e.preventDefault();
    setMessage('');

    if (mode === 'login') {
      if (!login(username.trim(), password)) {
        setMessage('Usuario o contraseña incorrectos.');
        return;
      }
      const user = currentUser();
      router.replace(user?.role === 'admin' ? '/admin' : '/');
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
    setMessage('Cuenta creada. Ya puedes ingresar.');
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
          <div className="segmented">
            <button type="button" className={mode === 'login' ? 'selected' : ''} onClick={() => { setMode('login'); setMessage(''); }}>Ingresar</button>
            <button type="button" className={mode === 'register' ? 'selected' : ''} onClick={() => { setMode('register'); setMessage(''); }}>Crear cuenta</button>
          </div>
          <h2>{mode === 'login' ? 'Bienvenido de vuelta' : 'Comienza hoy'}</h2>
          {mode === 'login' && <p className="auth-helper">El sistema te llevará automáticamente al panel correspondiente a tu rol.</p>}
          {mode === 'register' && <label>Nombre<input value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" /></label>}
          <label>Usuario<input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" /></label>
          <label>Contraseña<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
          {message && <div className={success ? 'notice success' : 'notice error'}>{message}</div>}
          <button className="primary full">{mode === 'login' ? 'Ingresar' : 'Crear mi cuenta'}</button>
          {mode === 'login' && (
            <div className="demo-box access-list">
              <b>Accesos iniciales</b>
              <span><strong>Administrador:</strong> Diego123 / Diego123</span>
              <span><strong>Usuario Diego:</strong> Usuariodiego123 / Usuariodiego123</span>
              <span><strong>Usuario Leslie:</strong> Usuarioleslie123 / Usuarioleslie123</span>
            </div>
          )}
        </form>
      </section>
    </div>
  );
}
