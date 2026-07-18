import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createFoodApiApp } from "./app";
import { loadFoodApiConfig } from "./config";
import { MockAuthProductionError } from "@recipe-ai/food-core/auth";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serviceRoot = path.resolve(__dirname, "..");

describe("loadFoodApiConfig", () => {
  it("throws MockAuthProductionError when production + mock auth", () => {
    assert.throws(
      () =>
        loadFoodApiConfig({
          NODE_ENV: "production",
          MOCK_AUTH: "true",
          PORT: "8788",
        }),
      MockAuthProductionError,
    );
  });

  it("loads fadicore-stub verifier in production without mock flags", () => {
    const config = loadFoodApiConfig({
      NODE_ENV: "production",
      PORT: "8788",
    });
    assert.equal(config.nodeEnv, "production");
    assert.ok(config.authVerifier);
  });
});

describe("GET /health", () => {
  it("returns 200 ok", async () => {
    const config = loadFoodApiConfig({
      NODE_ENV: "test",
      FOOD_API_AUTH_MODE: "mock",
      MOCK_AUTH: "true",
      PORT: "8788",
    });
    const server = createFoodApiApp(config);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const address = server.address();
    assert.ok(address && typeof address === "object");
    const port = address.port;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/health`);
      assert.equal(res.status, 200);
      const body = (await res.json()) as { status: string; service: string };
      assert.equal(body.status, "ok");
      assert.equal(body.service, "shareyum-food-api");
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close((err?: Error) => (err ? reject(err) : resolve())),
      );
    }
  });
});

describe("production boot with mock auth", () => {
  it("process exits non-zero when NODE_ENV=production and MOCK_AUTH=true", async () => {
    const result = await new Promise<{ code: number | null; stderr: string }>(
      (resolve) => {
        const child = spawn(
          process.execPath,
          ["--import", "tsx", "src/index.ts"],
          {
            cwd: serviceRoot,
            env: {
              ...process.env,
              NODE_ENV: "production",
              MOCK_AUTH: "true",
              PORT: "8799",
            },
            stdio: ["ignore", "ignore", "pipe"],
          },
        );
        let stderr = "";
        child.stderr?.on("data", (chunk: Buffer) => {
          stderr += chunk.toString();
        });
        child.on("close", (code) => resolve({ code, stderr }));
      },
    );

    assert.notEqual(result.code, 0);
    assert.match(result.stderr + result.code, /Mock auth|production/i);
  });
});
