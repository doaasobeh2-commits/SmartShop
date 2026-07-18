export type VerifiedAuthContext = {
  userId: string;
  householdId: string | null;
  memberId: string | null;
  recipeEnrolled: boolean;
};

export type AuthFailureCode = "UNAUTHENTICATED" | "NOT_IMPLEMENTED" | "FORBIDDEN";

export type AuthVerificationFailure = {
  ok: false;
  code: AuthFailureCode;
  message: string;
};

export type AuthVerificationSuccess = {
  ok: true;
  context: VerifiedAuthContext;
};

export type AuthVerificationResult =
  | AuthVerificationSuccess
  | AuthVerificationFailure;

/** Minimal request shape for auth verification (no framework coupling). */
export type RequestLike = {
  headers: Record<string, string | string[] | undefined>;
};

export interface AuthContextVerifier {
  verify(request: RequestLike): Promise<AuthVerificationResult>;
}

export type AuthVerifierMode = "mock" | "fadicore-stub";

export type AuthVerifierConfig = {
  nodeEnv: string;
  authMode: AuthVerifierMode;
  /** Explicit opt-in for mock auth in non-production environments. */
  mockAuthEnabled: boolean;
};

export class MockAuthProductionError extends Error {
  constructor() {
    super(
      "Mock auth cannot be enabled when NODE_ENV=production. " +
        "Use FadiCore Phase 5b app identity when available.",
    );
    this.name = "MockAuthProductionError";
  }
}
