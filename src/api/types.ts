export type AgentOptions = {
  provider: string;
  model: string;
  key: string;
  temperature?: number;
  history: Array<{
    role: "user" | "assistant";
    content: string;
    tokens?: number;
  }>;
  useTools: boolean;
};
