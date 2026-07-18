import type { ServerResponse } from "node:http";
import { sendJson } from "../http";

export function handleHealth(_req: unknown, res: ServerResponse): void {
  sendJson(res, 200, { status: "ok", service: "shareyum-food-api" });
}
