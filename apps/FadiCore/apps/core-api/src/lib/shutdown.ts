/**
 * Single-flight graceful shutdown for the Core API process.
 * Safe to call from SIGTERM/SIGINT; ignores duplicate signals.
 */

export type GracefulShutdownLogger = {
  info: (obj: unknown, msg?: string) => void;
  error: (obj: unknown, msg?: string) => void;
};

export type RegisterGracefulShutdownOptions = {
  /** Close HTTP server, DB pool, etc. */
  close: () => Promise<void>;
  log?: GracefulShutdownLogger;
  signals?: NodeJS.Signals[];
  /** Injected for tests. Defaults to process.exit. */
  exit?: (code: number) => void;
  /** Injected for tests. Defaults to process. */
  processRef?: NodeJS.Process;
};

/**
 * Registers signal handlers. Returns an unsubscribe function.
 */
export function registerGracefulShutdown(
  options: RegisterGracefulShutdownOptions,
): () => void {
  const {
    close,
    log,
    signals = ["SIGTERM", "SIGINT"],
    exit = (code) => process.exit(code),
    processRef = process,
  } = options;

  let shuttingDown = false;

  const onSignal = (signal: NodeJS.Signals) => {
    if (shuttingDown) return;
    shuttingDown = true;
    log?.info({ signal }, "shutdown_signal_received");

    void (async () => {
      try {
        await close();
        log?.info({ signal }, "shutdown_complete");
        exit(0);
      } catch (error) {
        log?.error({ err: error, signal }, "shutdown_failed");
        exit(1);
      }
    })();
  };

  for (const signal of signals) {
    processRef.on(signal, onSignal);
  }

  return () => {
    for (const signal of signals) {
      processRef.off(signal, onSignal);
    }
  };
}
