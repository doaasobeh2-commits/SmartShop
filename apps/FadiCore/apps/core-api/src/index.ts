import { buildApp } from "./app.js";
import { env } from "./config.js";

async function main() {
  const app = await buildApp();

  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
    app.log.info(`Fadi Core API listening on :${env.PORT}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

main();
