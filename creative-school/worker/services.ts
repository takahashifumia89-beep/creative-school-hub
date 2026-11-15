import { z } from "zod";
import {
  offerSchema,
  orderSchema,
  orderStatuses,
  canTransitionOrder,
} from "../src/platform/services";
type Actor = { id: string };
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
const fail = (error: string, status = 400) => reply({ error }, status);
export async function serviceRoute(
  db: D1Database,
  path: string,
  method: string,
  b: Record<string, unknown>,
  user: Actor | null,
): Promise<Response | null> {
  if (
    !path.startsWith("/api/services") &&
    !path.startsWith("/api/service-orders")
  )
    return null;
  if (path === "/api/services" && method === "GET") {
    const r = await db
      .prepare(
        "SELECT s.*,p.display_name seller_name FROM service_offers s JOIN profiles p ON p.user_id=s.seller_id WHERE s.active=1 ORDER BY s.updated_at DESC LIMIT 200",
      )
      .all();
    return reply(r.results);
  }
  if (!user) return fail("UNAUTHORIZED", 401);
  const uid = user.id,
    now = new Date().toISOString();
  if (path === "/api/services/mine" && method === "GET") {
    const r = await db
      .prepare(
        "SELECT s.*,p.display_name seller_name FROM service_offers s JOIN profiles p ON p.user_id=s.seller_id WHERE seller_id=? ORDER BY updated_at DESC LIMIT 30",
      )
      .bind(uid)
      .all();
    return reply(r.results);
  }
  if (path === "/api/services" && method === "POST") {
    const p = offerSchema.safeParse(b);
    if (!p.success) return fail("SERVICE_INVALID");
    const count = await db
      .prepare("SELECT COUNT(*) n FROM service_offers WHERE seller_id=?")
      .bind(uid)
      .first<{ n: number }>();
    if ((count?.n ?? 0) >= 20) return fail("SERVICE_QUOTA", 429);
    const d = p.data,
      id = crypto.randomUUID();
    await db
      .prepare(
        "INSERT INTO service_offers(id,seller_id,title,description,category,price,days,revisions,deliverables,active,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
      )
      .bind(
        id,
        uid,
        d.title,
        d.description,
        d.category,
        d.price,
        d.days,
        d.revisions,
        d.deliverables,
        +d.active,
        now,
        now,
      )
      .run();
    return reply({ id }, 201);
  }
  const offer = path.match(/^\/api\/services\/([\w-]+)$/);
  if (offer && method === "PATCH") {
    const p = offerSchema.safeParse(b),
      version = z.number().int().positive().safeParse(b.version);
    if (!p.success || !version.success) return fail("SERVICE_INVALID");
    const d = p.data;
    const result = await db
      .prepare(
        "UPDATE service_offers SET title=?,description=?,category=?,price=?,days=?,revisions=?,deliverables=?,active=?,version=version+1,updated_at=? WHERE id=? AND seller_id=? AND version=?",
      )
      .bind(
        d.title,
        d.description,
        d.category,
        d.price,
        d.days,
        d.revisions,
        d.deliverables,
        +d.active,
        now,
        offer[1],
        uid,
        version.data,
      )
      .run();
    return result.meta.changes ? reply({ ok: true }) : fail("CONFLICT", 409);
  }
  const orderSelect =
    "SELECT o.*,b.display_name buyer_name,s.display_name seller_name FROM service_orders o JOIN profiles b ON b.user_id=o.buyer_id JOIN profiles s ON s.user_id=o.seller_id";
  if (path === "/api/service-orders" && method === "GET") {
    const r = await db
      .prepare(
        orderSelect +
          " WHERE o.buyer_id=? OR o.seller_id=? ORDER BY o.updated_at DESC LIMIT 200",
      )
      .bind(uid, uid)
      .all();
    return reply(r.results);
  }
  if (path === "/api/service-orders" && method === "POST") {
    const p = orderSchema.safeParse(b);
    if (!p.success) return fail("SERVICE_INVALID");
    const d = p.data;
    const existing = await db
      .prepare("SELECT id FROM service_orders WHERE id=? AND buyer_id=?")
      .bind(d.clientId, uid)
      .first();
    if (existing) return reply(existing);
    const s = await db
      .prepare("SELECT * FROM service_offers WHERE id=? AND active=1")
      .bind(d.offerId)
      .first<Record<string, unknown>>();
    if (!s) return fail("NOT_FOUND", 404);
    if (s.version !== d.offerVersion) return fail("CONFLICT", 409);
    if (s.seller_id === uid) return fail("SERVICE_SELF");
    const count = await db
      .prepare(
        "SELECT COUNT(*) n FROM service_orders WHERE buyer_id=? AND status IN ('pending','accepted','in_progress','delivered')",
      )
      .bind(uid)
      .first<{ n: number }>();
    if ((count?.n ?? 0) >= 30) return fail("SERVICE_QUOTA", 429);
    await db
      .prepare(
        "INSERT OR IGNORE INTO service_orders(id,offer_id,buyer_id,seller_id,title,price,days,revisions,deliverables,brief,contact,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
      )
      .bind(
        d.clientId,
        d.offerId,
        uid,
        s.seller_id,
        s.title,
        s.price,
        s.days,
        s.revisions,
        s.deliverables,
        d.brief,
        d.contact,
        now,
        now,
      )
      .run();
    const saved = await db
      .prepare("SELECT id FROM service_orders WHERE id=? AND buyer_id=?")
      .bind(d.clientId, uid)
      .first();
    return saved ? reply(saved, 201) : fail("CONFLICT", 409);
  }
  const order = path.match(/^\/api\/service-orders\/([\w-]+)$/);
  if (order && method === "PATCH") {
    const p = z
      .object({
        status: z.enum(orderStatuses),
        version: z.number().int().positive(),
        deliveryNote: z.string().trim().max(2000).default(""),
      })
      .safeParse(b);
    if (!p.success) return fail("SERVICE_INVALID");
    const row = await db
      .prepare(
        "SELECT * FROM service_orders WHERE id=? AND (buyer_id=? OR seller_id=?)",
      )
      .bind(order[1], uid, uid)
      .first<Record<string, unknown>>();
    if (!row) return fail("NOT_FOUND", 404);
    if (
      !canTransitionOrder(
        String(row.status),
        p.data.status,
        row.seller_id === uid,
      )
    )
      return fail("FORBIDDEN", 403);
    if (p.data.status === "delivered" && p.data.deliveryNote.length < 10)
      return fail("SERVICE_INVALID");
    const r = await db
      .prepare(
        "UPDATE service_orders SET status=?,delivery_note=CASE WHEN ?='delivered' THEN ? ELSE delivery_note END,version=version+1,updated_at=? WHERE id=? AND version=?",
      )
      .bind(
        p.data.status,
        p.data.status,
        p.data.deliveryNote,
        now,
        order[1],
        p.data.version,
      )
      .run();
    return r.meta.changes ? reply({ ok: true }) : fail("CONFLICT", 409);
  }
  return fail("NOT_FOUND", 404);
}
