import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { describe, it } from "node:test";
import { registerGracefulShutdown } from "./shutdown.js";

describe("registerGracefulShutdown", () => {
  it("runs close once and exits 0 on SIGTERM", async () => {
    const processRef = new EventEmitter() as NodeJS.Process;
    let closeCalls = 0;
    let exitCode: number | undefined;

    registerGracefulShutdown({
      processRef,
      signals: ["SIGTERM"],
      close: async () => {
        closeCalls += 1;
      },
      exit: (code) => {
        exitCode = code;
      },
    });

    processRef.emit("SIGTERM");
    await new Promise((r) => setTimeout(r, 20));

    assert.equal(closeCalls, 1);
    assert.equal(exitCode, 0);

    processRef.emit("SIGTERM");
    await new Promise((r) => setTimeout(r, 20));
    assert.equal(closeCalls, 1);
  });

  it("exits 1 when close throws", async () => {
    const processRef = new EventEmitter() as NodeJS.Process;
    let exitCode: number | undefined;

    registerGracefulShutdown({
      processRef,
      signals: ["SIGINT"],
      close: async () => {
        throw new Error("close failed");
      },
      exit: (code) => {
        exitCode = code;
      },
    });

    processRef.emit("SIGINT");
    await new Promise((r) => setTimeout(r, 20));
    assert.equal(exitCode, 1);
  });
});
