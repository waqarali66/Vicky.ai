import superjson from "superjson";

// Vicky is a private, single-owner studio. Public registration is disabled.
export async function handle(_request: Request) {
  return new Response(
    superjson.stringify({ message: "Registration is disabled for this private studio." }),
    { status: 403, headers: { "Content-Type": "application/json" } }
  );
}
