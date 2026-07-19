import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id_user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sub = await req.json();
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  await pool.query(
    `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE p256dh = VALUES(p256dh), auth = VALUES(auth), user_id = VALUES(user_id)`,
    [session.user.id_user, sub.endpoint, sub.keys.p256dh, sub.keys.auth]
  );

  return NextResponse.json({ success: true });
}
