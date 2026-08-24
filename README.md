# RITMO Hábitos V1.0.1

Web-app de hábitos personales creada con Next.js 15, React 19 y TypeScript.

## Acceso inicial

- Usuario: `Diego.123`
- Contraseña: `Diego.123`
- Rol: Administrador

> Esta V1 utiliza `localStorage` para permitir pruebas inmediatas sin backend. Los datos son locales al navegador/dispositivo. Para producción multiusuario real, la siguiente etapa es conectar Supabase Auth + base de datos + RLS.

## Ejecutar localmente

Requiere Node.js 22.x.

```bash
npm install
npm run dev
```

Abrir: http://localhost:3000

## Verificar producción

```bash
npm run typecheck
npm run build
```

## Despliegue en Vercel

1. Subir el contenido de esta carpeta a la raíz del repositorio.
2. Importar el repositorio en Vercel.
3. Framework Preset: Next.js (detección automática).
4. Build Command: `npm run build` o dejar Auto.
5. No requiere variables de entorno en esta V1.

## Cambios de esta corrección

- Next.js actualizado a 15.5.23.
- Node.js fijado a 22.x para despliegues reproducibles.
- Script de instalación de `sharp` aprobado explícitamente para npm.
- Corregidos warnings CSS `align-items: end`.
- Fechas diarias calculadas en hora local, no UTC.
- Lectura diaria acumula correctamente múltiples avances del mismo día.
- Dashboard suma páginas leídas entre todas las lecturas del día.
- Progreso semanal incorpora lectura y usa los 5 hábitos.
- Se protege la cuenta administradora inicial de una desactivación o cambio de rol accidental.
