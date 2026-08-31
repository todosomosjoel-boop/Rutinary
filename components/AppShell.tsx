'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { currentUser, logout } from '@/lib/storage';

type NavItem = readonly [string, string, string];

const userItems: readonly NavItem[] = [
  ['/', '☀️', 'Mi día'],
  ['/ejercicio', '🏋️', 'Ejercicio'],
  ['/lectura', '📚', 'Lectura'],
  ['/sueno', '😴', 'Sueño'],
  ['/hidratacion', '💧', 'Hidratación'],
  ['/alimentacion', '🥗', 'Alimentación'],
  ['/progreso', '📈', 'Progreso'],
];

const adminItems: readonly NavItem[] = [
  ['/admin', '📊', 'Dashboard usuarios'],
  ['/admin/cuentas', '👥', 'Usuarios y administradores'],
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const user = typeof window !== 'undefined' ? currentUser() : null;
  const items = user?.role === 'admin' ? adminItems : userItems;

  function isActive(href: string) {
    return href === '/admin' ? path === href : path === href || path.startsWith(`${href}/`);
  }

  function signOut() {
    logout();
    router.replace('/login');
  }

  return (
    <div className={`app-layout ${user?.role === 'admin' ? 'admin-layout' : ''}`}>
      <aside className="sidebar">
        <div className="brand"><div className="brand-dot" />RITMO</div>
        <div className="tagline">
          {user?.role === 'admin' ? 'Panel de administración.' : 'Pequeños hábitos. Días mejores.'}
        </div>
        <nav>
          {items.map(([href, icon, label]) => (
            <Link key={href} href={href} className={`nav-item ${isActive(href) ? 'active' : ''}`}>
              <span>{icon}</span><span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="mini-profile">
            <div className="avatar">{user?.name?.[0] || 'U'}</div>
            <div><b>{user?.name}</b><small>{user?.role === 'admin' ? 'Administrador' : 'Usuario'}</small></div>
          </div>
          <button className="ghost danger" onClick={signOut}>Cerrar sesión</button>
        </div>
      </aside>

      <header className="mobile-topbar">
        <div>
          <div className="brand"><div className="brand-dot" />RITMO</div>
          <small>{user?.role === 'admin' ? 'Administrador' : user?.name}</small>
        </div>
        <button className="mobile-logout" onClick={signOut} aria-label="Cerrar sesión">Salir</button>
      </header>

      <main className="main-content">{children}</main>

      {user?.role === 'user' ? (
        <nav className="mobile-nav" aria-label="Navegación móvil">
          {userItems.map(([href, icon, label]) => (
            <Link key={href} href={href} className={path === href ? 'active' : ''} aria-label={label} title={label}>
              <span>{icon}</span>
            </Link>
          ))}
        </nav>
      ) : (
        <nav className="mobile-nav admin-mobile-nav" aria-label="Navegación administrador">
          <Link href="/admin" className={path === '/admin' ? 'active' : ''}><span>📊</span><small>Dashboard</small></Link>
          <Link href="/admin/cuentas" className={path.startsWith('/admin/cuentas') ? 'active' : ''}><span>👥</span><small>Cuentas</small></Link>
          <button onClick={signOut}><span>↪️</span><small>Salir</small></button>
        </nav>
      )}
    </div>
  );
}
