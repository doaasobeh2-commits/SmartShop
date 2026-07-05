export const ADMIN_EMAIL = "fadisobehau@gmail.com";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }
  return normalizeEmail(email) === ADMIN_EMAIL;
}

export function normalizeSessionUser<T extends { email: string }>(user: T): T {
  return {
    ...user,
    email: normalizeEmail(user.email),
  };
}
