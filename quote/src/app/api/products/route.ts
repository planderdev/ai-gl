import { handle, json, parseBody } from "@/lib/api";
import { createProduct, products } from "@/lib/products/service";
import { productSchema } from "@/lib/schemas";
import type { Product } from "@/types";

export const GET = handle(async () => json({ items: (await products().list()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) }));
export const POST = handle(async (req: Request) => {
  const r = await parseBody(req, productSchema);
  if ("error" in r) return r.error;
  const p = await createProduct(r.data as Omit<Product, "id" | "createdAt" | "updatedAt">);
  return json(p, { status: 201 });
});
