import type { GolfCourse, Hotel, Settings, VehicleRule } from "@/types";
import { collection, nowIso, readDoc, writeDoc } from "@/lib/store/collection";
import { JP_HOLIDAYS_DEFAULT } from "./holidays";

export const hotels = () => collection<Hotel>("hotels");
export const golfCourses = () => collection<GolfCourse>("golf-courses");
export const vehicleRules = () => collection<VehicleRule>("vehicle-rules");

const DEFAULT_SETTINGS: Settings = { exchangeRate: 9.2, margins: [0.15, 0.2], holidays: JP_HOLIDAYS_DEFAULT, updatedAt: "" };
export const getSettings = () => readDoc<Settings>("settings", DEFAULT_SETTINGS);
export const saveSettings = async (patch: Partial<Settings>) => writeDoc("settings", { ...(await getSettings()), ...patch, updatedAt: nowIso() });
