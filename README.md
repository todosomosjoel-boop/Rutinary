# Rutinary 1.1.0

Web-app de hábitos construida con Next.js + React + TypeScript.

## Accesos iniciales

### Administrador
- Usuario: `Diego123`
- Clave: `Diego123`

El administrador accede exclusivamente al **Dashboard de usuarios**, donde puede filtrar por usuario y revisar el porcentaje de avance de Ejercicio, Lectura, Sueño, Hidratación y Alimentación según las metas personales de cada usuario.

### Usuarios
- Usuario: `Usuariodiego123`
- Clave: `Usuariodiego123`

- Usuario: `Usuarioleslie123`
- Clave: `Usuarioleslie123`

Los usuarios acceden a Mi día, Ejercicio, Lectura, Sueño, Hidratación, Alimentación y Progreso. Sus metas se administran desde **Progreso → Administrar metas**.

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

Esta versión sigue utilizando `localStorage` para los registros. Por lo tanto, sirve para probar toda la experiencia multiusuario en un mismo navegador, pero un administrador no puede ver desde su equipo los registros realizados por otra persona en otro dispositivo/navegador.

Para que el dashboard administrador consolide usuarios reales desde distintos dispositivos, la siguiente etapa debe conectar autenticación y registros a una base compartida como Supabase. La interfaz y la separación de roles de esta versión ya quedan preparadas para esa migración.
