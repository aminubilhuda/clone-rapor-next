import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id_user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const endpoint = body?.endpoint;

  if (endpoint) {
    await pool.query("DELETE FROM push_subscriptions WHERE user_id = ? AND endpoint = ?", [
      session.user.id_user,
      endpoint,
    ]);
  } else {
    await pool.query("DELETE FROM push_subscriptions WHERE user_id = ?", [session.user.id_user]);
  }

  return NextResponse.json({ success: true });
}
