import { MockAuthContextVerifier } from "./MockAuthContextVerifier";
import { StubFadiCoreSessionVerifier } from "./StubFadiCoreSessionVerifier";
import {
  MockAuthProductionError,
  type AuthContextVerifier,
  type AuthVerifierConfig,
  type AuthVerifierMode,
} from "./types";

export function assertMockAuthAllowed(config: AuthVerifierConfig): void {
  const isProduction = config.nodeEnv === "production";
  const mockRequested =
    config.authMode === "mock" || config.mockAuthEnabled === true;

  if (isProduction && mockRequested) {
    throw new MockAuthProductionError();
  }
}

export function createAuthVerifierFromConfig(
  config: AuthVerifierConfig,
): AuthContextVerifier {
  assertMockAuthAllowed(config);

  if (config.authMode === "mock") {
    return new MockAuthContextVerifier();
  }

  return new StubFadiCoreSessionVerifier();
}

export function parseAuthVerifierMode(value: string | undefined): AuthVerifierMode {
  if (value === "mock" || value === "fadicore-stub") {
    return value;
  }
  return "fadicore-stub";
}

export function loadAuthVerifierConfig(
  env: NodeJS.ProcessEnv = process.env,
): AuthVerifierConfig {
  const nodeEnv = env.NODE_ENV ?? "development";
  const mockAuthEnabled =
    env.MOCK_AUTH === "true" || env.FOOD_API_MOCK_AUTH === "true";
  const authMode = mockAuthEnabled
    ? "mock"
    : parseAuthVerifierMode(env.FOOD_API_AUTH_MODE);

  return { nodeEnv, authMode, mockAuthEnabled };
}
