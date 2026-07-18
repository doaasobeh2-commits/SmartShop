import type { AuthContextVerifier, RequestLike } from "./types";

/**
 * Non-functional placeholder until FadiCore Phase 5b dual-auth / app identity.
 * Does not forward cookies or call FadiCore. Must not be used as a production auth path.
 */
export class StubFadiCoreSessionVerifier implements AuthContextVerifier {
  async verify(_request: RequestLike) {
    return {
      ok: false as const,
      code: "NOT_IMPLEMENTED" as const,
      message:
        "FadiCore session verification is not implemented. " +
        "Blocked on FadiCore Phase 5b app identity / dual-auth contract.",
    };
  }
}
