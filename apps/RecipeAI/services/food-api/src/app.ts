import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { FoodApiConfig } from "./config";
import { sendJson } from "./http";
import { handleHealth } from "./routes/health";

export function createFoodApiApp(config: FoodApiConfig) {
  return createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url ?? "/";
    const method = req.method ?? "GET";

    if (method === "GET" && (url === "/health" || url === "/health/")) {
      handleHealth(req, res);
      return;
    }

    sendJson(res, 404, { error: "NOT_FOUND", message: "Route not found" });
  });
}

export function startFoodApiServer(config: FoodApiConfig) {
  const server = createFoodApiApp(config);
  server.listen(config.port, () => {
    console.log(
      `[shareyum-food-api] listening on http://localhost:${config.port} (${config.nodeEnv})`,
    );
  });
  return server;
}
