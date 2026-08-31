import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ritmo | Hábitos personales',
  description: 'Web-app de seguimiento diario de ejercicio, lectura, sueño, hidratación y alimentación.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
