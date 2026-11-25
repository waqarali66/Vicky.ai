import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../../helpers/getSetServerSession";
import { schema } from "./create_POST.schema";
import superjson from "superjson";
export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    if (user.role !== "admin" || user.email.toLowerCase() !== "waqar.aliakbar920@gmail.com") return new Response(superjson.stringify({ message: "Access denied" }), { status: 403 });
    const input = schema.parse(superjson.parse(await request.text()));
    const [project] = await db.insertInto("filmProjects").values({ ownerUserId: user.id, title: input.title, productionType: input.productionType, synopsis: input.synopsis, status: "New project", progress: 0 }).returning(["id", "title", "productionType", "status", "progress", "synopsis", "updatedAt"]).execute();
    return new Response(superjson.stringify({ project: { ...project, id: String(project.id), updatedAt: project.updatedAt.toISOString() } }), { headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof NotAuthenticatedError) return new Response(superjson.stringify({ message: "Not authenticated" }), { status: 401 });
    if (error instanceof Error && error.name === "ZodError") return new Response(superjson.stringify({ message: "Please check the project details and try again." }), { status: 400 });
    console.error("Project create error:", error);
    return new Response(superjson.stringify({ message: "Could not create project" }), { status: 500 });
  }
}