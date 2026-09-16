import { promises as fs } from "node:fs";
import path from "node:path";
import { resolveDataDir } from "./data-dir";
import { BlobCollection, blobReadJson, blobWriteJson } from "./blob-collection";

/** Vercel Blob 토큰이 있으면 Blob, 아니면 로컬 JSON 파일 */
export const isBlobEnabled = () => !!process.env.BLOB_READ_WRITE_TOKEN;

/** 파일 기반 컬렉션(id 키). 인터페이스를 유지한 채 Supabase 구현으로 교체 가능. */
export interface Collection<T extends { id: string }> {
  list(): Promise<T[]>;
  get(id: string): Promise<T | null>;
  upsert(item: T): Promise<T>;
  upsertMany(items: T[]): Promise<number>;
  remove(id: string): Promise<void>;
  replaceAll(items: T[]): Promise<void>;
}

class FileCollection<T extends { id: string }> implements Collection<T> {
  private cache: Map<string, T> | null = null;
  private writing: Promise<void> = Promise.resolve();
  constructor(private file: string) {}
  private async load() {
    if (this.cache) return this.cache;
    try {
      const arr = JSON.parse(await fs.readFile(this.file, "utf8")) as T[];
      this.cache = new Map(arr.map((x) => [x.id, x]));
    } catch {
      this.cache = new Map();
    }
    return this.cache;
  }
  private persist() {
    this.writing = this.writing.then(async () => {
      const m = await this.load();
      await fs.mkdir(path.dirname(this.file), { recursive: true });
      const tmp = `${this.file}.tmp`;
      await fs.writeFile(tmp, JSON.stringify([...m.values()], null, 2), "utf8");
      await fs.rename(tmp, this.file);
    });
    return this.writing;
  }
  async list() { return [...(await this.load()).values()]; }
  async get(id: string) { return (await this.load()).get(id) ?? null; }
  async upsert(item: T) { (await this.load()).set(item.id, item); await this.persist(); return item; }
  async upsertMany(items: T[]) { const m = await this.load(); for (const it of items) m.set(it.id, it); await this.persist(); return items.length; }
  async remove(id: string) { (await this.load()).delete(id); await this.persist(); }
  async replaceAll(items: T[]) { this.cache = new Map(items.map((x) => [x.id, x])); await this.persist(); }
}

const g = globalThis as unknown as { __aiglCollections?: Map<string, Collection<{ id: string }>> };
export function collection<T extends { id: string }>(name: string): Collection<T> {
  g.__aiglCollections ??= new Map();
  if (!g.__aiglCollections.has(name)) g.__aiglCollections.set(name, isBlobEnabled() ? new BlobCollection<T>(name) : new FileCollection<T>(path.join(resolveDataDir(), `${name}.json`)));
  return g.__aiglCollections.get(name) as unknown as Collection<T>;
}

/** 단일 문서(설정 등) */
export async function readDoc<T>(name: string, fallback: T): Promise<T> {
  if (isBlobEnabled()) { try { return { ...fallback, ...((await blobReadJson<T>(name)) ?? {}) }; } catch { return fallback; } }
  try { return { ...fallback, ...(JSON.parse(await fs.readFile(path.join(resolveDataDir(), `${name}.json`), "utf8")) as T) }; }
  catch { return fallback; }
}
export async function writeDoc<T>(name: string, doc: T): Promise<T> {
  if (isBlobEnabled()) { await blobWriteJson(name, doc); return doc; }
  const file = path.join(resolveDataDir(), `${name}.json`);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(doc, null, 2), "utf8");
  return doc;
}

export const newId = (prefix: string) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
export const nowIso = () => new Date().toISOString();
