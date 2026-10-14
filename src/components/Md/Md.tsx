import { Theme } from "@tolokoban/ui";

import Styles from "./Md.module.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import SyntaxHighlighter from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const $ = Theme.classNames;

export interface MdProps {
  className?: string;
  children?: string;
}

export default function Md({ className, children }: MdProps) {
  return (
    <div className={$.join(className, Styles.md)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          tpmap({ lat, lng }: { lat: string; lng: string }) {
            const x = parseFloat(lng);
            const y = parseFloat(lat);
            return (
              <iframe
                src={`http://localhost:60000/app/?n=${y + 0.1}&s=${y - 0.1}&e=${x + 0.1}&w=${x - 0.1}`}
                width={640}
                height={480}
              ></iframe>
            );
          },
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
              <SyntaxHighlighter style={oneDark} language={match[1]}>
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
