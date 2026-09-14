import { fail, handle, json, parseBody } from "@/lib/api";
import { getSettings, saveSettings } from "@/lib/masters/service";
import { settingsSchema } from "@/lib/schemas";

export const GET = handle(async () => json(await getSettings()));
export const PUT = handle(async (req: Request) => {
  const r = await parseBody(req, settingsSchema);
  if ("error" in r) return r.error;
  if (!Object.keys(r.data).length) return fail("empty");
  return json(await saveSettings(r.data));
});
