import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sub = await req.json();
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  const userId = (session.user as any).id_user ?? null;
  const idSiswa = (session.user as any).id_siswa ?? null;
  const jabatan = (session.user as any).jabatan ?? 0;

  await pool.query(
    `INSERT INTO push_subscriptions (user_id, jabatan, id_siswa, endpoint, p256dh, auth)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE p256dh = VALUES(p256dh), auth = VALUES(auth), user_id = VALUES(user_id), jabatan = VALUES(jabatan), id_siswa = VALUES(id_siswa)`,
    [userId, jabatan, idSiswa, sub.endpoint, sub.keys.p256dh, sub.keys.auth]
  );

  return NextResponse.json({ success: true });
}
