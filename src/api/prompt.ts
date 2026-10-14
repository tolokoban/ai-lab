import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { APICallError, type LanguageModel, RetryError, tool, ToolLoopAgent } from "ai";

import { State } from "../state";
import type { AgentOptions } from "./types";
import { toolCurrentGeolocation } from "../tools/current-geolocation";
import { toolDistance } from "../tools/distance";
import { toolDateTime } from "../tools/date-time";
import { toolSearchLocation, toolSearchLocationReverse } from "../tools/search-location";

export type PromptResponse =
  | {
      input: { content: string; tokens: number };
      output: { content: string; tokens: number };
      error?: undefined;
    }
  | { error: Error; input?: undefined; output?: undefined };

export async function prompt(input: string, options: AgentOptions): Promise<PromptResponse> {
  try {
    console.log("🐞 [prompt@23] input =", input); // @FIXME: Remove this line written on 2026-10-14 at 14:23
    console.log("🐞 [prompt@24] options.history =", options.history); // @FIXME: Remove this line written on 2026-10-14 at 14:24
    State.tools.value = [];
    const agent = getAgent(options);
    const response = await agent.generate({
      messages: [
        ...options.history,
        {
          role: "user",
          content: input,
        },
      ],
    });
    //       prompt: `You are TrailPassion the AI assistant of \`https:trail-passion.net\`.
    // When you need to display a map for a specific latitude/longitude,
    // please write this text (after replacing the attributes with the location)
    // without any styling:
    // <TpMap lat="12.345" lng="6.789" />

    // Do not embed it with backticks, and write it alone on its own line.

    // Here is the user prompt:
    //       ${input}`,
    //     });
    console.log("🐞 [prompt@29] response =", response); // @FIXME: Remove this line written on 2026-07-14 at 11:47
    const { text, usage } = response;
    return {
      input: {
        tokens: usage.inputTokens ?? 0,
        content: input,
      },
      output: {
        tokens: usage.outputTokens ?? 0,
        content: text,
      },
    };
  } catch (error) {
    console.error(error);
    if (error instanceof APICallError) {
      // Network issues, rate limits, invalid API key, etc.
      // error.message, error.statusCode, error.responseBody
    } else if (error instanceof RetryError) {
      // All retry attempts exhausted
      // error.lastError has the underlying cause
    }
    return { error: ensureError(error) };
  }
}

function getAgent(options: AgentOptions) {
  const model = getGenerativeAI(options);
  const agent = new ToolLoopAgent({
    model,
    temperature: options.temperature,
    tools: options.useTools
      ? {
          currentGeolocation: tool(toolCurrentGeolocation),
          distance: tool(toolDistance),
          dateTime: tool(toolDateTime),
          searchLocation: tool(toolSearchLocation),
          searchLocationReverse: tool(toolSearchLocationReverse),
        }
      : {},
  });
  return agent;
}

function getGenerativeAI(options: AgentOptions): LanguageModel {
  const { provider, model, key: apiKey } = options;
  switch (provider) {
    case "google":
      return createGoogleGenerativeAI({ apiKey })(model);
    case "mistral":
      return createMistral({ apiKey })(model);
    case "deepseek":
      return createDeepSeek({ apiKey })(model);
    default:
      throw new Error(`Don't know this provider: "${provider}"!`);
  }
}

function ensureError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (typeof error === "string") return new Error(error);
  return new Error(JSON.stringify(error));
}
