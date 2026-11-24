import { getAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function handle(request: Request) {
  const auth = getAuth();
  if (!auth) {
    return Response.json(
      { message: "Accounts are not available right now. Please try again later." },
      { status: 503 },
    );
  }
  return auth.handler(request);
}

export { handle as GET, handle as POST };
