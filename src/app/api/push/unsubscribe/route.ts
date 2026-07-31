import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const endpoint = body?.endpoint;

  const userId = (session.user as any).id_user ?? null;
  const idSiswa = (session.user as any).id_siswa ?? null;

  if (endpoint) {
    if (userId) {
      await pool.query("DELETE FROM push_subscriptions WHERE user_id = ? AND endpoint = ?", [userId, endpoint]);
    } else if (idSiswa) {
      await pool.query("DELETE FROM push_subscriptions WHERE id_siswa = ? AND endpoint = ?", [idSiswa, endpoint]);
    }
  } else {
    if (userId) {
      await pool.query("DELETE FROM push_subscriptions WHERE user_id = ?", [userId]);
    } else if (idSiswa) {
      await pool.query("DELETE FROM push_subscriptions WHERE id_siswa = ?", [idSiswa]);
    }
  }

  return NextResponse.json({ success: true });
}
