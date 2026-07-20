/** Internal admin catalog workspace — not part of consumer FlowScreen stack. */

export function isAdminRecipesRoute(pathname: string): boolean {
  return pathname.startsWith("/admin/recipes");
}

export type AdminRoute =
  | { screen: "list" }
  | { screen: "detail"; recipeId: string };

export function parseAdminRoute(pathname: string): AdminRoute | null {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  if (normalized === "/admin/recipes") return { screen: "list" };
  const match = normalized.match(/^\/admin\/recipes\/([^/]+)$/);
  if (match?.[1]) {
    return { screen: "detail", recipeId: decodeURIComponent(match[1]) };
  }
  return null;
}

export function adminListPath(): string {
  return "/admin/recipes";
}

export function adminDetailPath(recipeId: string): string {
  return `/admin/recipes/${encodeURIComponent(recipeId)}`;
}
