import {
  IconEdit,
  Theme,
  ViewButton,
  ViewInputNumber,
  ViewLabel,
  ViewPanel,
  ViewSpinner,
  ViewSwitch,
} from "@tolokoban/ui";
import React from "react";
import { Api } from "../api";
import Answer from "../components/Answer";
import Prompt from "../components/Prompt";
import * as styles from "./page.module.css";
import { makeGoto } from "./routes";
import { State } from "../state";
import { PromptResponse } from "../api/prompt";
import Tools from "../components/Tools";
import { AgentOptions } from "../api/types";
import Md from "../components/Md";

const $ = Theme.classNames;

export default function App() {
  const [addHistory, setAddhistory] = React.useState(false);
  const [history, setHistory] = React.useState<AgentOptions["history"]>([]);
  const [tools, setTools] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [prompt, setPrompt] = React.useState<string | undefined>(undefined);
  const [answer, setAnswer] = React.useState<PromptResponse | undefined>(undefined);
  const provider = State.ai.getProviderInfo();
  const isMistral = provider?.id === "mistral";
  const [temperature, setTemperature] = React.useState(isMistral ? 0.7 : 1);

  if (!provider) {
    return (
      <ViewPanel display="grid" placeItems="center">
        <p>You need a Key to interact with AI agents.</p>
        <ViewButton onClick={makeGoto("/keys")}>Manage API Keys</ViewButton>
      </ViewPanel>
    );
  }

  const handleSend = async (prompt: string) => {
    setLoading(true);
    setAnswer(undefined);
    setPrompt(undefined);
    setHistory((arr) => [
      ...arr,
      {
        role: "user",
        content: prompt,
      },
    ]);
    const response = await Api.prompt(prompt, {
      provider: provider.id,
      model: provider.model,
      key: State.ai.providers.keys.value[provider.id] ?? "",
      history: addHistory ? history : [],
      useTools: tools,
      temperature,
    });
    setLoading(false);
    setHistory((arr) => {
      const newHistory = arr.slice();
      const lastUser = newHistory.pop();
      if (lastUser) {
        lastUser.tokens = response.input?.tokens ?? 0;
        newHistory.push(lastUser);
      }
      newHistory.push({
        role: "assistant",
        content: response.output?.content ?? "",
        tokens: response.output?.tokens ?? 0,
      });
      return newHistory;
    });
    setAnswer(response);
    console.log("🐞 [page@50] response =", response); // @FIXME: Remove this line written on 2026-10-14 at 13:38
  };

  return (
    <div className={styles.root}>
      <h1>
        <img src={provider.logo} />
        <strong>{provider.label}</strong>
        <small>{provider.model}</small>
        <ViewButton onClick={makeGoto("/keys")} icon={IconEdit} variant="text" color="primary-5">
          Manage AI Providers
        </ViewButton>
      </h1>
      {history.map((item, index) => (
        <div key={index} className={$.join(styles.history, styles[item.role])}>
          <Md>{item.content}</Md>
          <div className={styles.tokens}>{item.tokens ?? "..."}</div>
        </div>
      ))}
      <Tools />
      {prompt && <blockquote>{prompt}</blockquote>}
      {loading && <ViewSpinner>Waiting for response...</ViewSpinner>}
      {!loading && answer && <Answer value={answer} />}
      {!loading && (
        <div>
          <ViewPanel display="flex" gap="L" alignItems="center" margin="M">
            <ViewSwitch value={addHistory} onChange={setAddhistory}>
              Use history
            </ViewSwitch>
            <ViewSwitch value={tools} onChange={setTools}>
              Use tools
            </ViewSwitch>
            <ViewInputNumber
              min={0}
              max={isMistral ? 1 : 2}
              value={temperature}
              onChange={setTemperature}
              label="Temperature"
            />
          </ViewPanel>
          <ViewLabel value="What do you need?" fullwidth box="none" padding="M">
            <Prompt onSend={handleSend} />
          </ViewLabel>
        </div>
      )}
      <hr />
    </div>
  );
}
