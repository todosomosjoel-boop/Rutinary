'use client';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUsers, login, saveUsers, seedUsers } from '@/lib/storage';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [username, setUsername] = useState('Diego.123');
  const [password, setPassword] = useState('Diego.123');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  useEffect(() => seedUsers(), []);

  function submit(e: FormEvent) {
    e.preventDefault(); setError('');
    if (mode === 'login') {
      if (!login(username, password)) return setError('Usuario o contraseña incorrectos.');
      router.replace('/');
    } else {
      const users = getUsers();
      if (!name.trim() || !username.trim() || !password.trim()) return setError('Completa todos los campos.');
      if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) return setError('Ese usuario ya existe.');
      users.push({ username, password, name, role: 'user', active: true }); saveUsers(users);
      setMode('login'); setError('Cuenta creada. Ya puedes ingresar.');
    }
  }

  return <div className="login-page">
    <section className="login-hero">
      <div className="brand big"><div className="brand-dot" />RITMO</div>
      <h1>Construye una rutina que sí puedas sostener.</h1>
      <p>Ejercicio, lectura, sueño, hidratación y alimentación en un solo lugar.</p>
      <div className="hero-grid"><div>🏋️<b>Muévete</b></div><div>📚<b>Aprende</b></div><div>😴<b>Descansa</b></div><div>💧<b>Hidrátate</b></div></div>
    </section>
    <section className="login-panel">
      <form className="auth-card" onSubmit={submit}>
        <div className="segmented"><button type="button" className={mode==='login'?'selected':''} onClick={()=>setMode('login')}>Ingresar</button><button type="button" className={mode==='register'?'selected':''} onClick={()=>setMode('register')}>Crear cuenta</button></div>
        <h2>{mode==='login' ? 'Bienvenido de vuelta' : 'Comienza hoy'}</h2>
        {mode==='register' && <label>Nombre<input value={name} onChange={e=>setName(e.target.value)} placeholder="Tu nombre" /></label>}
        <label>Usuario<input value={username} onChange={e=>setUsername(e.target.value)} /></label>
        <label>Contraseña<input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></label>
        {error && <div className={error.startsWith('Cuenta') ? 'notice success' : 'notice error'}>{error}</div>}
        <button className="primary full">{mode==='login' ? 'Entrar a mi día' : 'Crear mi cuenta'}</button>
        {mode==='login' && <div className="demo-box"><b>Acceso inicial</b><span>Usuario: Diego.123</span><span>Clave: Diego.123</span></div>}
      </form>
    </section>
  </div>
}
