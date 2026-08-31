# Rutinary 1.2.0

Web-app de hábitos construida con Next.js + React + TypeScript y preparada para desplegarse en Vercel.

## Accesos iniciales

### Administrador
- Usuario: `Diego123`
- Clave: `Diego123`

El acceso de administrador está separado del acceso de usuario. El administrador dispone de:

- **Dashboard de usuarios** con filtro por usuario, año, mes y semana.
- Porcentaje de avance general y por Ejercicio, Lectura, Sueño, Hidratación y Alimentación según las metas personales.
- **Usuarios y administradores**, desde donde puede crear, modificar, activar, desactivar y eliminar cuentas de ambos roles.

### Usuarios
- Diego: `Usuariodiego123` / `Usuariodiego123`
- Leslie: `Usuarioleslie123` / `Usuarioleslie123`

Los usuarios acceden a Mi día, Ejercicio, Lectura, Sueño, Hidratación, Alimentación y Progreso. Sus metas se administran desde **Progreso → Administrar metas**.

## Mejoras incorporadas en 1.2.0

- Login con selección clara entre **Usuario** y **Administrador**.
- Gestión administrativa de usuarios y administradores.
- Dashboard administrativo filtrable por año, mes y semana.
- Plan semanal de ejercicios de lunes a domingo con rutinas diferentes y alternancia de tren inferior, superior y zona central.
- Lectura con historial de anotaciones separado por cada libro y biblioteca de lecturas completadas.
- Sueño con bloque destacado de consejos para un descanso reparador y ejercicio guiado de respiración 4–6 con temporizador de 2 minutos.
- Hidratación con detalle de tomas, resumen semanal, mensual e historial filtrable por año y mes.

## Ejecutar localmente

```bash
npm install
npm run dev
```

Para validar producción:

```bash
npm run typecheck
npm run build
```

## Vercel

El proyecto puede subirse directamente a GitHub y desplegarse en Vercel. Node.js está definido como 22.x.

## Importante sobre esta versión

Esta versión sigue utilizando `localStorage`. Esto permite probar toda la experiencia en un mismo navegador, pero los datos todavía **no se sincronizan entre dispositivos**.

Para que un administrador pueda ver desde su computador lo que cada usuario registra desde su propio teléfono o computador, la siguiente etapa debe conectar autenticación y registros a una base compartida como Supabase. La interfaz y la separación de roles ya quedan preparadas para esa migración.
