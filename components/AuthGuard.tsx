'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { currentUser, seedUsers } from '@/lib/storage';

type Props = {
  children: React.ReactNode;
  adminOnly?: boolean;
  userOnly?: boolean;
};

export default function AuthGuard({ children, adminOnly = false, userOnly = false }: Props) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedUsers();
    const user = currentUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    if (adminOnly && user.role !== 'admin') {
      router.replace('/');
      return;
    }
    if (userOnly && user.role !== 'user') {
      router.replace('/admin');
      return;
    }
    setReady(true);
  }, [router, adminOnly, userOnly]);

  if (!ready) return <div className="screen-center">Cargando…</div>;
  return <>{children}</>;
}
