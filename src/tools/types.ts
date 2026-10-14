import z from "zod";

export interface AiTool<INPUT = any, OUTPUT = any> {
  title: string;
  description: string;
  inputSchema: z.ZodType<INPUT>;
  execute: (arg: INPUT) => Promise<OUTPUT>;
}
