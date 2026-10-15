import { cityLocation } from '../data/cities';
import { SEED_USERS } from '../data/seed';
import { shortName } from '../utils/format';
import type { GeoLocation, PublicCandidate, RegisterInput, Role, StoredUser, User } from '../types';

// Temporary client-side persistence until a real backend exists.
// Passwords are stored in plain text here — do NOT ship this to production.
const USERS_KEY = 'cargolink.users';
const SESSION_KEY = 'cargolink.session';

function readUsers(): StoredUser[] {
  let stored: StoredUser[] = [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    stored = raw ? JSON.parse(raw) : [];
  } catch {
    // fall through with no stored users
  }
  const missingSeeds = SEED_USERS.filter((seed) => !stored.some((u) => u.id === seed.id));
  return [...missingSeeds, ...stored.map(migrateLocation)];
}

/** Early accounts stored the city as plain text; convert it to a GeoLocation. */
function migrateLocation(u: StoredUser): StoredUser {
  const loc: unknown = u.location;
  if (typeof loc !== 'string') return u;
  return { ...u, location: cityLocation(loc) };
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

/** Round to ~10 km so the public list can't pinpoint where someone lives. */
function coarsen(loc: GeoLocation): GeoLocation {
  const round = (n: number) => Math.round(n * 10) / 10;
  return { ...loc, lat: round(loc.lat), lng: round(loc.lng) };
}

export function listCandidates(): PublicCandidate[] {
  return readUsers()
    .filter((u) => u.role === 'applicant')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((u) => ({
      id: u.id,
      displayName: shortName(u.name),
      desiredPosition: u.desiredPosition,
      location: u.location && coarsen(u.location),
      experienceYears: u.experienceYears,
      licenses: u.licenses ?? [],
      about: u.about,
      joinedAt: u.createdAt,
    }));
}
