import type { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/health", async () => {
    return {
      status: "ok",
      service: "fadi-core-api",
      phase: 3,
      timestamp: new Date().toISOString(),
    };
  });
}
