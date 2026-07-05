const STORAGE_KEY = "smartshop.registeredUsers";

export type RegisteredUserRecord = {
  email: string;
  firstName: string;
  lastName: string;
};

function readUsers(): RegisteredUserRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw) as RegisteredUserRecord[];
  } catch {
    return [];
  }
}

function writeUsers(users: RegisteredUserRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function isEmailRegistered(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return readUsers().some((user) => user.email === normalized);
}

export function saveRegisteredUser(user: RegisteredUserRecord): void {
  const normalized = user.email.trim().toLowerCase();
  const users = readUsers().filter((entry) => entry.email !== normalized);
  users.push({
    email: normalized,
    firstName: user.firstName.trim(),
    lastName: user.lastName.trim(),
  });
  writeUsers(users);
}

export function loadRegisteredUser(email: string): RegisteredUserRecord | null {
  const normalized = email.trim().toLowerCase();
  return readUsers().find((user) => user.email === normalized) ?? null;
}
