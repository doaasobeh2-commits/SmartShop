const API_URL = (
  typeof import.meta !== "undefined" && import.meta.env
    ? (import.meta.env.VITE_FADI_CORE_API_URL as string | undefined)
    : undefined
)?.replace(/\/$/, "");

export function getApiBaseUrl(): string {
  if (!API_URL) {
    throw new Error(
      "VITE_FADI_CORE_API_URL is not set. Copy .env.example to .env and point it at the Fadi Core API.",
    );
  }
  return API_URL;
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(
      typeof body === "object" &&
        body &&
        "error" in body &&
        typeof (body as { error: unknown }).error === "string"
        ? (body as { error: string }).error
        : `Request failed (${status})`,
    );
    this.status = status;
    this.body = body;
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const base = getApiBaseUrl();
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${base}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, body);
  }

  return body as T;
}
