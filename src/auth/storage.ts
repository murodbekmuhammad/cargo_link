import type { RegisterInput, Role, StoredUser, User } from '../types';

// Temporary client-side persistence until a real backend exists.
// Passwords are stored in plain text here — do NOT ship this to production.
const USERS_KEY = 'cargolink.users';
const SESSION_KEY = 'cargolink.session';

const SEED_ADMIN: StoredUser = {
  id: 'admin-1',
  role: 'admin',
  email: 'admin@cargolink.com',
  password: 'admin123',
  name: 'Platform Admin',
  createdAt: new Date(0).toISOString(),
};

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const users: StoredUser[] = raw ? JSON.parse(raw) : [];
    if (!users.some((u) => u.role === 'admin')) users.unshift(SEED_ADMIN);
    return users;
  } catch {
    return [SEED_ADMIN];
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function toPublic(stored: StoredUser): User {
  const user: Partial<StoredUser> = { ...stored };
  delete user.password;
  return user as User;
}

export function getSession(): User | null {
  try {
    const id = localStorage.getItem(SESSION_KEY);
    const user = id ? readUsers().find((u) => u.id === id) : undefined;
    return user ? toPublic(user) : null;
  } catch {
    return null;
  }
}

export function login(role: Role, email: string, password: string): User {
  const normalized = email.trim().toLowerCase();
  const user = readUsers().find((u) => u.email === normalized && u.role === role);
  if (!user || user.password !== password) {
    throw new Error('Invalid email or password for this role.');
  }
  localStorage.setItem(SESSION_KEY, user.id);
  return toPublic(user);
}

export function register(input: RegisterInput): User {
  const users = readUsers();
  const email = input.email.trim().toLowerCase();
  if (users.some((u) => u.email === email)) {
    throw new Error('An account with this email already exists.');
  }
  const user: StoredUser = {
    ...input,
    email,
    name: input.name.trim(),
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  writeUsers([...users, user]);
  localStorage.setItem(SESSION_KEY, user.id);
  return toPublic(user);
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function listUsers(): User[] {
  return readUsers().map(toPublic);
}
