import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import Fastify from "fastify";
import {
  rateLimitErrorBody,
  replyDatabaseUnavailable,
} from "./handledErrors.js";

const srcRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function listTsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...listTsFiles(full));
      continue;
    }
    if (name.endsWith(".ts") && !name.endsWith(".test.ts")) {
      out.push(full);
    }
  }
  return out;
}

describe("handledErrors", () => {
  it("returns opaque database_unavailable without human message", async () => {
    const app = Fastify({ logger: false });
    app.get("/db", async (request, reply) => {
      return replyDatabaseUnavailable(
        reply,
        request,
        new Error('connect ECONNREFUSED 127.0.0.1:5432 postgres://user:secret@host/db'),
      );
    });

    const res = await app.inject({ method: "GET", url: "/db" });
    assert.equal(res.statusCode, 503);
    assert.deepEqual(res.json(), { error: "database_unavailable" });
    assert.equal(res.body.includes("message"), false);
    assert.equal(res.body.includes("PostgreSQL"), false);
    assert.equal(res.body.includes("ECONNREFUSED"), false);
    assert.equal(res.body.includes("127.0.0.1"), false);
    assert.equal(res.body.includes("postgres://"), false);
    assert.equal(res.body.includes("secret"), false);
    assert.equal(res.body.includes("stack"), false);

    await app.close();
  });

  it("rate-limit body has no human message", () => {
    assert.deepEqual(rateLimitErrorBody(), {
      statusCode: 429,
      error: "too_many_requests",
    });
  });

  it("source tree has no client-facing PostgreSQL/infra prose in route sends", () => {
    const banned = [
      /Cannot reach PostgreSQL/i,
      /Start apps\/FadiCore\/docker/i,
      /Owner admin role required/i,
      /Too many login attempts/i,
      /Too many auth attempts/i,
      /Too many invitation accept attempts/i,
      /Too many claim accept attempts/i,
    ];

    const files = listTsFiles(srcRoot).filter((f) =>
      /[\\/](modules|middleware)[\\/]/.test(f),
    );

    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const pattern of banned) {
        assert.equal(
          pattern.test(text),
          false,
          `${path.relative(srcRoot, file)} still matches ${pattern}`,
        );
      }
    }
  });
});
