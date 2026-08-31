'use client';

export type User = {
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
  active: boolean;
};

export type Goals = {
  exerciseDays: number;
  readingPages: number;
  sleepHours: number;
  hydrationMl: number;
  foodTracking: boolean;
};

export type HabitProgress = {
  days: number;
  overall: number;
  exercise: number;
  reading: number;
  sleep: number;
  hydration: number;
  food: number | null;
  metrics: {
    exerciseDone: number;
    exerciseTarget: number;
    pagesRead: number;
    pagesTarget: number;
    sleepHours: number;
    sleepTarget: number;
    waterMl: number;
    waterTarget: number;
    foodDays: number;
    foodTarget: number;
  };
};

const USERS = 'ritmo_users';
const SESSION = 'ritmo_session';
const DATA_VERSION = 'ritmo_data_version';
const CURRENT_VERSION = '1.2.0';

export const defaultGoals: Goals = {
  exerciseDays: 4,
  readingPages: 20,
  sleepHours: 7.5,
  hydrationMl: 2600,
  foodTracking: true,
};

const initialUsers: User[] = [
  { username: 'Diego123', password: 'Diego123', name: 'Diego', role: 'admin', active: true },
  { username: 'Usuariodiego123', password: 'Usuariodiego123', name: 'Diego', role: 'user', active: true },
  { username: 'Usuarioleslie123', password: 'Usuarioleslie123', name: 'Leslie', role: 'user', active: true },
];

function safeUsers(raw: string | null): User[] {
  try {
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Crea los accesos iniciales una sola vez y migra versiones anteriores.
 * Después de la migración, el administrador puede modificar/eliminar cuentas
 * sin que vuelvan a aparecer automáticamente.
 */
export function seedUsers() {
  if (typeof window === 'undefined') return;
  const version = localStorage.getItem(DATA_VERSION);
  const existing = safeUsers(localStorage.getItem(USERS));

  if (version === CURRENT_VERSION && existing.length > 0) return;

  const cleaned = existing.filter(user => user?.username && user.username !== 'Diego.123');
  const merged = [...cleaned];
  for (const required of initialUsers) {
    if (!merged.some(user => user.username.toLowerCase() === required.username.toLowerCase())) {
      merged.push(required);
    }
  }

  localStorage.setItem(USERS, JSON.stringify(merged.length ? merged : initialUsers));
  localStorage.setItem(DATA_VERSION, CURRENT_VERSION);

  const rawSession = localStorage.getItem(SESSION);
  if (rawSession) {
    try {
      const session = JSON.parse(rawSession) as User;
      if (session.username === 'Diego.123') localStorage.removeItem(SESSION);
    } catch {
      localStorage.removeItem(SESSION);
    }
  }
}

export function getUsers(): User[] {
  if (typeof window === 'undefined') return [];
  seedUsers();
  return safeUsers(localStorage.getItem(USERS));
}

export function saveUsers(users: User[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS, JSON.stringify(users));
}

export function login(username: string, password: string, expectedRole?: User['role']) {
  const user = getUsers().find(
    item => item.username === username && item.password === password && item.active && (!expectedRole || item.role === expectedRole),
  );
  if (!user) return false;
  localStorage.setItem(SESSION, JSON.stringify(user));
  if (user.role === 'user') ensureUserDefaults(user.username);
  return true;
}

export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION);
}

export function currentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SESSION);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as User;
    const live = getUsers().find(user => user.username === session.username && user.active);
    if (!live) {
      localStorage.removeItem(SESSION);
      return null;
    }
    return live;
  } catch {
    localStorage.removeItem(SESSION);
    return null;
  }
}

function migrateUsernameData(oldUsername: string, newUsername: string) {
  if (typeof window === 'undefined' || oldUsername === newUsername) return;
  const keys = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i)).filter(Boolean) as string[];
  for (const key of keys) {
    if (key === USERS || key === SESSION || !key.includes(oldUsername)) continue;
    const value = localStorage.getItem(key);
    if (value === null) continue;
    const newKey = key.replace(oldUsername, newUsername);
    if (!localStorage.getItem(newKey)) localStorage.setItem(newKey, value);
    localStorage.removeItem(key);
  }
}

export function updateUser(originalUsername: string, updated: User) {
  if (typeof window === 'undefined') return { ok: false, message: 'No disponible.' };
  const sessionBefore = currentUser();
  const users = getUsers();
  if (users.some(user => user.username.toLowerCase() === updated.username.toLowerCase() && user.username !== originalUsername)) {
    return { ok: false, message: 'Ese nombre de usuario ya existe.' };
  }

  const next = users.map(user => user.username === originalUsername ? updated : user);
  if (!next.some(user => user.role === 'admin' && user.active)) {
    return { ok: false, message: 'Debe existir al menos un administrador activo.' };
  }

  migrateUsernameData(originalUsername, updated.username);
  saveUsers(next);

  if (sessionBefore?.username === originalUsername) {
    localStorage.setItem(SESSION, JSON.stringify(updated));
  }
  if (updated.role === 'user') ensureUserDefaults(updated.username);
  return { ok: true, message: 'Cuenta actualizada.' };
}

export function deleteUser(username: string) {
  if (typeof window === 'undefined') return { ok: false, message: 'No disponible.' };
  const users = getUsers();
  const target = users.find(user => user.username === username);
  if (!target) return { ok: false, message: 'Cuenta no encontrada.' };
  const session = currentUser();
  if (session?.username === username) return { ok: false, message: 'No puedes eliminar la cuenta con la que estás conectado.' };

  const next = users.filter(user => user.username !== username);
  if (!next.some(user => user.role === 'admin' && user.active)) {
    return { ok: false, message: 'Debe existir al menos un administrador activo.' };
  }
  saveUsers(next);
  const keys = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i)).filter(Boolean) as string[];
  for (const key of keys) {
    if (key === USERS || key === SESSION || !key.includes(username)) continue;
    localStorage.removeItem(key);
  }
  return { ok: true, message: 'Cuenta eliminada.' };
}

export function ensureUserDefaults(username: string) {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(`ritmo_goals_${username}`)) {
    localStorage.setItem(`ritmo_goals_${username}`, JSON.stringify(defaultGoals));
  }
}

export function getGoals(username: string): Goals {
  ensureUserDefaults(username);
  return readJson<Goals>(`ritmo_goals_${username}`, defaultGoals);
}

export function setGoals(username: string, goals: Goals) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`ritmo_goals_${username}`, JSON.stringify(goals));
}

export function dateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayKey() {
  return dateKey();
}

export function recentDateKeys(days: number) {
  return [...Array(days)].map((_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - (days - 1 - index));
    return dateKey(date);
  });
}

export function monthDateKeys(year: number, month: number) {
  const count = new Date(year, month, 0).getDate();
  return Array.from({ length: count }, (_, i) => dateKey(new Date(year, month - 1, i + 1, 12)));
}

export type MonthWeek = { id: number; label: string; dates: string[] };

export function monthWeeks(year: number, month: number): MonthWeek[] {
  const days = monthDateKeys(year, month);
  const weeks: string[][] = [];
  let current: string[] = [];

  for (const key of days) {
    const day = new Date(`${key}T12:00:00`).getDay();
    if (current.length && day === 1) {
      weeks.push(current);
      current = [];
    }
    current.push(key);
  }
  if (current.length) weeks.push(current);

  return weeks.map((dates, index) => {
    const first = Number(dates[0].slice(-2));
    const last = Number(dates[dates.length - 1].slice(-2));
    return { id: index + 1, label: `Semana ${index + 1} · ${first}–${last}`, dates };
  });
}

export function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

function capPercent(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.min(100, Math.round(value));
}

export function getHabitProgressForDates(username: string, dates: string[]): HabitProgress {
  const goals = getGoals(username);
  const readings = readJson<any[]>(`ritmo_readings_${username}`, []);
  const days = dates.length;

  if (days === 0) {
    return {
      days: 0, overall: 0, exercise: 0, reading: 0, sleep: 0, hydration: 0, food: goals.foodTracking ? 0 : null,
      metrics: { exerciseDone: 0, exerciseTarget: 0, pagesRead: 0, pagesTarget: 0, sleepHours: 0, sleepTarget: 0, waterMl: 0, waterTarget: 0, foodDays: 0, foodTarget: 0 },
    };
  }

  let exerciseDone = 0;
  let pagesRead = 0;
  let sleepHours = 0;
  let waterMl = 0;
  let foodDays = 0;

  for (const date of dates) {
    const exercise = readJson<any>(`ritmo_exercise_${username}_${date}`, { completed: false });
    const sleep = readJson<any>(`ritmo_sleep_${username}_${date}`, { hours: 0 });
    const foods = readJson<any[]>(`ritmo_food_${username}_${date}`, []);

    if (exercise.completed) exerciseDone += 1;
    sleepHours += Number(sleep.hours || 0);
    waterMl += Number(readJson<number>(`ritmo_water_${username}_${date}`, 0) || 0);
    if (foods.length > 0) foodDays += 1;

    pagesRead += readings.reduce((sum, reading) => {
      const log = readJson<any>(`ritmo_readlog_${username}_${reading.id}_${date}`, { pages: 0 });
      return sum + Number(log.pages || 0);
    }, 0);
  }

  const exerciseTarget = Math.max(1, (goals.exerciseDays * days) / 7);
  const pagesTarget = Math.max(1, goals.readingPages * days);
  const sleepTarget = Math.max(1, goals.sleepHours * days);
  const waterTarget = Math.max(1, goals.hydrationMl * days);
  const foodTarget = goals.foodTracking ? days : 0;

  const exercise = capPercent((exerciseDone / exerciseTarget) * 100);
  const reading = capPercent((pagesRead / pagesTarget) * 100);
  const sleep = capPercent((sleepHours / sleepTarget) * 100);
  const hydration = capPercent((waterMl / waterTarget) * 100);
  const food = goals.foodTracking ? capPercent((foodDays / foodTarget) * 100) : null;
  const active = [exercise, reading, sleep, hydration, ...(food === null ? [] : [food])];
  const overall = Math.round(active.reduce((sum, value) => sum + value, 0) / active.length);

  return {
    days,
    overall,
    exercise,
    reading,
    sleep,
    hydration,
    food,
    metrics: {
      exerciseDone,
      exerciseTarget,
      pagesRead,
      pagesTarget,
      sleepHours,
      sleepTarget,
      waterMl,
      waterTarget,
      foodDays,
      foodTarget,
    },
  };
}

export function getHabitProgress(username: string, days = 7): HabitProgress {
  return getHabitProgressForDates(username, recentDateKeys(days));
}
