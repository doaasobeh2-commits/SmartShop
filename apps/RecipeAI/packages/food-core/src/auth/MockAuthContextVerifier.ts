import type {
  AuthContextVerifier,
  AuthVerificationResult,
  RequestLike,
  VerifiedAuthContext,
} from "./types";

export type MockAuthContextVerifierOptions = {
  context?: VerifiedAuthContext;
  failure?: AuthVerificationResult;
};

/**
 * Development and test only. Never construct in production —
 * use createAuthVerifierFromConfig which enforces fail-closed startup.
 */
export class MockAuthContextVerifier implements AuthContextVerifier {
  private readonly context: VerifiedAuthContext;
  private readonly failure: AuthVerificationResult | null;

  constructor(options: MockAuthContextVerifierOptions = {}) {
    this.context =
      options.context ??
      ({
        userId: "mock-user",
        householdId: "mock-household",
        memberId: "mock-member",
        recipeEnrolled: true,
      } satisfies VerifiedAuthContext);
    this.failure = options.failure ?? null;
  }

  async verify(_request: RequestLike): Promise<AuthVerificationResult> {
    if (this.failure && !this.failure.ok) {
      return this.failure;
    }
    return { ok: true, context: this.context };
  }
}
