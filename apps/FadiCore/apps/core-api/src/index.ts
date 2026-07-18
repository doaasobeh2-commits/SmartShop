import { buildApp } from "./app.js";
import { closeDb } from "./db/client.js";
import { env, isDevTokenExposureEnabled } from "./config.js";
import { assertProductionSecurityConfig } from "./lib/productionSecurity.js";
import { registerGracefulShutdown } from "./lib/shutdown.js";

async function main() {
  // Fail closed before binding a port. Operator-facing only — never HTTP.
  assertProductionSecurityConfig(env, isDevTokenExposureEnabled);

  const app = await buildApp();

  registerGracefulShutdown({
    log: app.log,
    close: async () => {
      await app.close();
      await closeDb();
    },
  });

  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
    app.log.info(`Fadi Core API listening on :${env.PORT}`);
  } catch (error) {
    app.log.error(error);
    try {
      await closeDb();
    } catch {
      // ignore secondary close errors during failed bind
    }
    process.exit(1);
  }
}

main().catch((error) => {
  // Startup failures (including production security asserts) stay on stderr.
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
