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

const USERS = 'ritmo_users';
const SESSION = 'ritmo_session';

export const defaultGoals: Goals = {
  exerciseDays: 4,
  readingPages: 20,
  sleepHours: 7.5,
  hydrationMl: 2600,
  foodTracking: true
};

export function seedUsers() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(USERS)) {
    const seed: User[] = [
      { username: 'Diego.123', password: 'Diego.123', name: 'Diego', role: 'admin', active: true }
    ];
    localStorage.setItem(USERS, JSON.stringify(seed));
  }
}

export function getUsers(): User[] {
  if (typeof window === 'undefined') return [];
  seedUsers();
  return JSON.parse(localStorage.getItem(USERS) || '[]');
}

export function saveUsers(users: User[]) {
  localStorage.setItem(USERS, JSON.stringify(users));
}

export function login(username: string, password: string) {
  const user = getUsers().find(u => u.username === username && u.password === password && u.active);
  if (!user) return false;
  localStorage.setItem(SESSION, JSON.stringify(user));
  ensureUserDefaults(user.username);
  return true;
}

export function logout() {
  localStorage.removeItem(SESSION);
}

export function currentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SESSION);
  return raw ? JSON.parse(raw) : null;
}

export function ensureUserDefaults(username: string) {
  if (!localStorage.getItem(`ritmo_goals_${username}`)) {
    localStorage.setItem(`ritmo_goals_${username}`, JSON.stringify(defaultGoals));
  }
}

export function getGoals(username: string): Goals {
  ensureUserDefaults(username);
  return JSON.parse(localStorage.getItem(`ritmo_goals_${username}`) || JSON.stringify(defaultGoals));
}

export function setGoals(username: string, goals: Goals) {
  localStorage.setItem(`ritmo_goals_${username}`, JSON.stringify(goals));
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}

export function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}
