/** Metadata only. Raw project documents and service briefs never enter this index. */
export async function workspaceIndex(
  db: D1Database,
  uid: string | null,
  includeServices = false,
) {
  const services = includeServices
    ? await db
        .prepare(
          "SELECT s.id,s.title,substr(s.description,1,220) description,s.category,s.price,s.days,p.display_name seller_name FROM service_offers s JOIN profiles p ON p.user_id=s.seller_id WHERE s.active=1 ORDER BY s.updated_at DESC LIMIT 200",
        )
        .all()
    : { results: [] };
  if (!uid)
    return {
      userId: null,
      profile: null,
      projects: [],
      services: services.results,
      done: [],
      incomingRequests: 0,
    };
  const [projects, profile, progress, incoming] = await Promise.all([
    db
      .prepare(
        "SELECT id,owner_id,title,description,status,visibility,cover_url,category,kind,version,created_at,updated_at FROM projects WHERE owner_id=? ORDER BY updated_at DESC,id LIMIT 500",
      )
      .bind(uid)
      .all(),
    db
      .prepare(
        "SELECT display_name displayName,bio FROM profiles WHERE user_id=?",
      )
      .bind(uid)
      .first(),
    db
      .prepare(
        "SELECT lesson_id FROM lesson_progress WHERE user_id=? ORDER BY completed_at DESC",
      )
      .bind(uid)
      .all<{ lesson_id: string }>(),
    db
      .prepare(
        "SELECT COUNT(*) n FROM service_orders WHERE seller_id=? AND status='pending'",
      )
      .bind(uid)
      .first<{ n: number }>(),
  ]);
  return {
    userId: uid,
    profile,
    projects: projects.results,
    services: services.results,
    done: progress.results.map((p) => p.lesson_id),
    incomingRequests: incoming?.n ?? 0,
  };
}
