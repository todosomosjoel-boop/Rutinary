'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { currentUser, seedUsers } from '@/lib/storage';

export default function AuthGuard({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedUsers();
    const user = currentUser();
    if (!user) return router.replace('/login');
    if (adminOnly && user.role !== 'admin') return router.replace('/');
    setReady(true);
  }, [router, adminOnly]);

  if (!ready) return <div className="screen-center">Cargando…</div>;
  return <>{children}</>;
}
