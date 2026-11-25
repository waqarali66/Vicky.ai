import { z } from "zod";
import superjson from "superjson";
export const schema = z.object({ title: z.string().trim().min(1).max(160), productionType: z.string().trim().min(1).max(60), synopsis: z.string().trim().max(12000).default("") });
export type OutputType = { project: { id: string; title: string; productionType: string; status: string; progress: number; synopsis: string; updatedAt: string } };
export const postCreateProject = async (body: z.infer<typeof schema>, init?: RequestInit): Promise<OutputType> => {
  const result = await fetch("/_api/projects/create", { method: "POST", body: superjson.stringify(schema.parse(body)), ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) }, credentials: "include" });
  if (!result.ok) { const data = superjson.parse<{ message?: string }>(await result.text()); throw new Error(data.message || "Could not create project"); }
  return superjson.parse<OutputType>(await result.text());
};