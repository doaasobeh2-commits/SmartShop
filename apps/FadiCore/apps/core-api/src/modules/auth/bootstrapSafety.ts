/** Example/default passwords that must never be used for seeding. */
export const UNSAFE_BOOTSTRAP_PASSWORDS = [
  "ChangeMe_Owner_2026!",
  "changeme",
  "password",
  "admin",
  "admin123",
] as const;

export function isUnsafeBootstrapPassword(password: string): boolean {
  const normalized = password.trim();
  return UNSAFE_BOOTSTRAP_PASSWORDS.some(
    (unsafe) => unsafe.toLowerCase() === normalized.toLowerCase(),
  );
}

export function assertSafeBootstrapPassword(password: string): void {
  if (!password || password.trim().length < 12) {
    throw new Error(
      "ADMIN_BOOTSTRAP_PASSWORD must be set in .env and be at least 12 characters.",
    );
  }

  if (isUnsafeBootstrapPassword(password)) {
    throw new Error(
      [
        "Refusing to seed: ADMIN_BOOTSTRAP_PASSWORD is still an example/default value.",
        "Copy apps/core-api/.env.example to .env and set a unique local password",
        "in ADMIN_BOOTSTRAP_PASSWORD before running npm run db:seed.",
        "Never commit real secrets.",
      ].join(" "),
    );
  }
}
