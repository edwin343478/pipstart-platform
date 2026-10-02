import { NextResponse } from "next/server";

import { getCurrentUser } from "../../../lib/auth/session";

// Only this small, private response depends on cookies. The public lesson HTML
// can be shared across visitors without including anyone's account information.
export const dynamic = "force-dynamic";

const headers = {
  "Cache-Control": "private, no-store, max-age=0",
  Vary: "Cookie",
};

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ authenticated: Boolean(user) }, { headers });
  } catch {
    return NextResponse.json(
      { authenticated: false },
      { status: 503, headers },
    );
  }
}
