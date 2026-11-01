import { del, get, list, put } from "@vercel/blob";
import type { Collection, RecordCollection } from "./collection";

/**
 * Vercel Blob(비공개) 기반 컬렉션 — 컬렉션 하나를 JSON 파일 하나로 저장.
 * 인스턴스 메모리 캐시 + TTL 로 읽기 비용을 줄이고, 쓰기는 전체 파일을 덮어쓴다(데이터 규모 수천 행 수준을 가정).
 */
const PREFIX = process.env.BLOB_PREFIX ?? "ai-gl";
const TTL_MS = 5_000;
const pathOf = (name: string) => `${PREFIX}/${name}.json`;

export async function blobReadJson<T>(name: string): Promise<T | null> {
  const res = await get(pathOf(name), { access: "private", useCache: false });
  if (!res || res.statusCode !== 200) return null;
  const text = await new Response(res.stream).text();
  return JSON.parse(text) as T;
}
export async function blobWriteJson(name: string, value: unknown): Promise<void> {
  await put(pathOf(name), JSON.stringify(value), { access: "private", contentType: "application/json", addRandomSuffix: false, allowOverwrite: true });
}

export class BlobCollection<T extends { id: string }> implements Collection<T> {
  private cache: Map<string, T> | null = null;
  private loadedAt = 0;
  private writing: Promise<void> = Promise.resolve();
  constructor(private name: string) {}
  private async load(force = false) {
    if (this.cache && !force && Date.now() - this.loadedAt < TTL_MS) return this.cache;
    const arr = (await blobReadJson<T[]>(this.name)) ?? [];
    this.cache = new Map(arr.map((x) => [x.id, x]));
    this.loadedAt = Date.now();
    return this.cache;
  }
  private persist(mutate: (m: Map<string, T>) => void) {
    // 쓰기 직전에 최신본을 다시 읽어 병합 → 다른 인스턴스의 변경을 덮어쓰지 않도록 최소한의 보호
    this.writing = this.writing.then(async () => {
      const m = await this.load(true);
      mutate(m);
      await blobWriteJson(this.name, [...m.values()]);
      this.loadedAt = Date.now();
    });
    return this.writing;
  }
  async list() { return [...(await this.load()).values()]; }
  async get(id: string) { return (await this.load()).get(id) ?? null; }
  async upsert(item: T) { await this.persist((m) => m.set(item.id, item)); return item; }
  async upsertMany(items: T[]) { await this.persist((m) => items.forEach((it) => m.set(it.id, it))); return items.length; }
  async remove(id: string) { await this.persist((m) => m.delete(id)); }
  async replaceAll(items: T[]) { await this.persist((m) => { m.clear(); items.forEach((it) => m.set(it.id, it)); }); }
}

/**
 * 건당 Blob 하나로 저장하는 컬렉션 — 공개 폼처럼 여러 인스턴스가 동시에 쓰는 데이터용.
 * BlobCollection 은 전체 파일을 덮어쓰므로 동시 접수 시 먼저 쓴 건이 사라질 수 있다. 여기서는 건끼리 파일이 달라 서로 덮어쓰지 않는다.
 */
export class BlobRecordCollection<T extends { id: string }> implements RecordCollection<T> {
  private cache: T[] | null = null;
  private loadedAt = 0;
  constructor(private name: string) {}
  private get prefix() { return `${PREFIX}/${this.name}/`; }
  private pathOf(id: string) { return `${this.prefix}${encodeURIComponent(id)}.json`; }
  private async read(pathname: string): Promise<T | null> {
    const res = await get(pathname, { access: "private", useCache: false }); // 없으면 null, 그 밖의 오류는 던진다 → 목록에서 건이 조용히 빠지지 않는다
    if (!res || res.statusCode !== 200) return null;
    return JSON.parse(await new Response(res.stream).text()) as T;
  }
  private write(item: T, allowOverwrite: boolean) {
    this.cache = null;
    return put(this.pathOf(item.id), JSON.stringify(item), { access: "private", contentType: "application/json", addRandomSuffix: false, allowOverwrite });
  }
  async list() {
    if (this.cache && Date.now() - this.loadedAt < TTL_MS) return [...this.cache];
    const paths: string[] = [];
    let cursor: string | undefined;
    do {
      const page = await list({ prefix: this.prefix, cursor, limit: 1000 });
      paths.push(...page.blobs.map((b) => b.pathname));
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    const items: T[] = [];
    for (let i = 0; i < paths.length; i += 20) items.push(...(await Promise.all(paths.slice(i, i + 20).map((p) => this.read(p)))).filter((x): x is Awaited<T> => !!x));
    this.cache = items;
    this.loadedAt = Date.now();
    return [...items];
  }
  get(id: string) { return this.read(this.pathOf(id)); }
  async upsert(item: T) { await this.write(item, true); return item; }
  async upsertMany(items: T[]) { await Promise.all(items.map((it) => this.write(it, true))); return items.length; }
  async remove(id: string) { this.cache = null; await del(this.pathOf(id)); }
  async replaceAll(items: T[]) {
    const keep = new Set(items.map((it) => it.id));
    await Promise.all((await this.list()).filter((it) => !keep.has(it.id)).map((it) => this.remove(it.id)));
    await this.upsertMany(items);
  }
  async createIfAbsent(item: T) {
    try { await this.write(item, false); return true; }
    catch (e) {
      // SDK 에 전용 오류 타입이 없어 문구로 판별하고, 문구가 달라져도 실제로 있으면 중복으로 본다
      if (e instanceof Error && /already exists/i.test(e.message)) return false;
      if (await this.get(item.id).catch(() => null)) return false;
      throw e;
    }
  }
}
