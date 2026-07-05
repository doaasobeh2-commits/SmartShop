import type { SessionUser } from "../state/localStore";
import { ADMIN_EMAIL } from "./adminAccess";

export function userFromLoginEmail(email: string): SessionUser {
  const normalized = email.trim().toLowerCase();

  if (normalized === ADMIN_EMAIL) {
    return {
      firstName: "Fadi",
      lastName: "Sobehau",
      email: normalized,
    };
  }

  if (normalized === "maria@beispiel.de") {
    return {
      firstName: "Maria",
      lastName: "Müller",
      email: normalized,
    };
  }

  const localPart = normalized.split("@")[0] ?? "nutzer";
  const firstName = localPart.charAt(0).toUpperCase() + localPart.slice(1);

  return {
    firstName,
    lastName: "",
    email: normalized,
  };
}
