import { handle, json } from "@/lib/api";
import { getSiteSettings, saveSiteSettings } from "@/lib/cms/service";

export const GET = handle(async () => json(await getSiteSettings()));
export const PUT = handle(async (req: Request) => json(await saveSiteSettings((await req.json()) as Record<string, unknown>)));
