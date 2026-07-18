import {
  assertMockAuthAllowed,
  createAuthVerifierFromConfig,
  loadAuthVerifierConfig,
  type AuthContextVerifier,
} from "@recipe-ai/food-core/auth";

export type FoodApiConfig = {
  port: number;
  nodeEnv: string;
  authVerifier: AuthContextVerifier;
};

export function loadFoodApiConfig(env: NodeJS.ProcessEnv = process.env): FoodApiConfig {
  const authConfig = loadAuthVerifierConfig(env);
  assertMockAuthAllowed(authConfig);

  const port = Number.parseInt(env.PORT ?? "8788", 10);
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error("PORT must be a positive integer");
  }

  return {
    port,
    nodeEnv: authConfig.nodeEnv,
    authVerifier: createAuthVerifierFromConfig(authConfig),
  };
}
