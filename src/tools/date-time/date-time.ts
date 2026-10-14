import z from "zod";
import { toolWrap } from "../wrap";

export const toolDateTime = toolWrap({
  title: "Get current date and time",
  description: `Return the current date and time of the user's device, as an object with:
- \`iso\`: ISO 8601 string in UTC (e.g. "2026-07-14T09:47:00.000Z"),
- \`local\`: human readable local date and time,
- \`timeZone\`: IANA time zone name of the device (e.g. "Europe/Zurich"),
- \`utcOffsetMinutes\`: offset of the local time from UTC, in minutes,
- \`timestamp\`: number of milliseconds since 1970-01-01T00:00:00Z.`,
  inputSchema: z.object({}),
  execute: async (): Promise<{
    iso: string;
    local: string;
    timeZone: string;
    utcOffsetMinutes: number;
    timestamp: number;
  }> => {
    const now = new Date();
    return {
      iso: now.toISOString(),
      local: now.toLocaleString(undefined, {
        dateStyle: "full",
        timeStyle: "long",
      }),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      utcOffsetMinutes: -now.getTimezoneOffset(),
      timestamp: now.getTime(),
    };
  },
});
