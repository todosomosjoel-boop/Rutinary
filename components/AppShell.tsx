'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { currentUser, logout } from '@/lib/storage';

const items = [
  ['/', '☀️', 'Mi día'],
  ['/ejercicio', '🏋️', 'Ejercicio'],
  ['/lectura', '📚', 'Lectura'],
  ['/sueno', '😴', 'Sueño'],
  ['/hidratacion', '💧', 'Hidratación'],
  ['/alimentacion', '🥗', 'Alimentación'],
  ['/progreso', '📈', 'Progreso'],
  ['/metas', '🎯', 'Mis metas'],
] as const;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const user = typeof window !== 'undefined' ? currentUser() : null;

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand"><div className="brand-dot" />RITMO</div>
        <div className="tagline">Pequeños hábitos. Días mejores.</div>
        <nav>
          {items.map(([href, icon, label]) => (
            <Link key={href} href={href} className={`nav-item ${path === href ? 'active' : ''}`}>
              <span>{icon}</span><span>{label}</span>
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link href="/admin" className={`nav-item ${path === '/admin' ? 'active' : ''}`}><span>⚙️</span><span>Administrador</span></Link>
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="mini-profile"><div className="avatar">{user?.name?.[0] || 'U'}</div><div><b>{user?.name}</b><small>{user?.role === 'admin' ? 'Administrador' : 'Usuario'}</small></div></div>
          <button className="ghost danger" onClick={() => { logout(); router.replace('/login'); }}>Cerrar sesión</button>
        </div>
      </aside>
      <main className="main-content">{children}</main>
      <nav className="mobile-nav">
        {items.slice(0, 5).map(([href, icon]) => <Link key={href} href={href} className={path === href ? 'active' : ''}>{icon}</Link>)}
      </nav>
    </div>
  );
}
