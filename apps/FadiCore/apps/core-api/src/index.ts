import { buildApp } from "./app.js";
import { env, isDevTokenExposureEnabled } from "./config.js";
import { assertProductionSecurityConfig } from "./lib/productionSecurity.js";

async function main() {
  // Fail closed before binding a port. Operator-facing only — never HTTP.
  assertProductionSecurityConfig(env, isDevTokenExposureEnabled);

  const app = await buildApp();

  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
    app.log.info(`Fadi Core API listening on :${env.PORT}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

main().catch((error) => {
  // Startup failures (including production security asserts) stay on stderr.
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
