export type AssistantMessageRole = "user" | "ai";

export type AssistantMessage = {
  role: AssistantMessageRole;
  text: string;
};
