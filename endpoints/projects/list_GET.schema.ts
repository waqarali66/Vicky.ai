import { z } from "zod";
import superjson from "superjson";
export const schema = z.object({});
export type OutputType = { projects: { id: string; title: string; productionType: string; status: string; progress: number; synopsis: string; updatedAt: string }[] };
export const getProjects = async (init?: RequestInit): Promise<OutputType> => {
  const result = await fetch("/_api/projects/list", { method: "GET", ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) }, credentials: "include" });
  if (!result.ok) throw new Error("Could not load your projects. Please sign in again.");
  return superjson.parse<OutputType>(await result.text());
};