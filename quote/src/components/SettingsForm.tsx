"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SectionDef } from "@/lib/cms/schema";
import { FieldGrid } from "./CmsForm";

export default function SettingsForm({ sections, value: initial }: { sections: SectionDef[]; value: Record<string, unknown> }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [msg, setMsg] = useState("");
  async function save() {
    const patch: Record<string, unknown> = {};
    for (const s of sections) for (const f of s.fields) patch[f.name] = f.type === "number" ? (value[f.name] === "" || value[f.name] == null ? "" : Number(value[f.name])) : f.type === "boolean" ? (value[f.name] === true || value[f.name] === 1 || value[f.name] === "1" ? 1 : 0) : value[f.name] ?? "";
    const res = await fetch("/api/cms/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    setMsg(res.ok ? "저장됨" : `저장 실패 ${res.status}`); router.refresh();
  }
  return (
    <div className="space-y-4">
      <FieldGrid sections={sections} value={value} onChange={(k, v) => setValue((s) => ({ ...s, [k]: v }))} />
      <div className="flex items-center gap-2"><button className="admin-btn admin-btn--primary" onClick={save}><i className="ri-save-3-line" /> 저장</button><span className="text-sm text-[var(--admin-text-muted)]">{msg}</span></div>
    </div>
  );
}
