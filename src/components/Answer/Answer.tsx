import { Theme, ViewPanel } from "@tolokoban/ui";

import { PromptResponse } from "../../api/prompt";

import * as Styles from "./Answer.module.css";
import Md from "../Md";

const $ = Theme.classNames;

export interface AnswerProps {
  className?: string;
  value?: PromptResponse | null;
}

export default function Answer({ className, value }: AnswerProps) {
  if (!value) return;

  if (value.error) {
    return (
      <ViewPanel className={Styles.error} color="error" padding="M" margin="M">
        {value.error.message}
      </ViewPanel>
    );
  }

  return (
    <>
      <div className={$.join(className, Styles.answer)}>
        <Md>{value.output.content}</Md>
      </div>
      {value.input && value.output && (
        <div className={Styles.tokens}>
          Consumed tokens: {value.input.tokens} (IN) + {value.output.tokens} (OUT) ={" "}
          <strong>{value.input.tokens + value.output.tokens}</strong>
        </div>
      )}
    </>
  );
}
