import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../../helpers/getSetServerSession";
import superjson from "superjson";
export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    if (user.role !== "admin" || user.email.toLowerCase() !== "waqar.aliakbar920@gmail.com") return new Response(superjson.stringify({ message: "Access denied" }), { status: 403 });
    const rows = await db.selectFrom("filmProjects").select(["id", "title", "productionType", "status", "progress", "synopsis", "updatedAt"]).where("ownerUserId", "=", String(user.id)).orderBy("updatedAt", "desc").execute();
    return new Response(superjson.stringify({ projects: rows.map(p => ({ ...p, id: String(p.id), updatedAt: p.updatedAt.toISOString() })) }), { headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof NotAuthenticatedError) return new Response(superjson.stringify({ message: "Not authenticated" }), { status: 401 });
    console.error("Project list error:", error);
    return new Response(superjson.stringify({ message: "Could not load projects" }), { status: 500 });
  }
}