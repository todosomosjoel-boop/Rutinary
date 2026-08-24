# RITMO — V1

Web-app personal de hábitos construida con Next.js + TypeScript.

## Incluye
- Login y creación de usuarios.
- Usuario administrador inicial: `Diego.123` / `Diego.123`.
- Dashboard "Mi día".
- Ejercicio diario multiarticular de 30–45 min.
- Lecturas con avance por página y síntesis diaria de hasta 500 caracteres.
- Registro de sueño y recomendaciones generales.
- Hidratación con registro rápido en bloques de 200 ml.
- Alimentación con calorías, proteína y fibra.
- Biblioteca inicial de ideas nutritivas.
- Metas personales.
- Progreso semanal.
- Panel administrador y gestión básica de usuarios.
- Diseño responsive para escritorio y móvil.

## Ejecutar
1. Instala Node.js 20 o superior.
2. Abre una terminal en esta carpeta.
3. Ejecuta `npm install`.
4. Ejecuta `npm run dev`.
5. Abre `http://localhost:3000`.

## Importante
Esta V1 usa `localStorage` para demostrar toda la lógica sin backend. Las credenciales se almacenan localmente solo con fines de prototipo.

Para producción, el siguiente paso recomendado es conectar Supabase Auth + PostgreSQL y aplicar RLS para separar los datos de cada usuario. La interfaz ya está organizada para migrar esa capa sin rehacer la experiencia visual.
