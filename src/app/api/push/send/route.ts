import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";
import webpush from "@/lib/push/webpush.server";

type PushPayload = {
  title?: string;
  body: string;
  url?: string;
};

export async function POST(req: NextRequest) {
  const session = await auth();
  // Only TU admin (jabatan 2) may broadcast notifications.
  if (!session?.user || session.user.jabatan !== 2) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, subscriptions, title, body, url } = await req.json();

  let rows: any[] = [];
  if (Array.isArray(subscriptions) && subscriptions.length > 0) {
    rows = subscriptions;
  } else if (userId) {
    const [r]: any = await pool.query(
      "SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = ?",
      [userId]
    );
    rows = r;
  } else {
    const [r]: any = await pool.query("SELECT endpoint, p256dh, auth FROM push_subscriptions");
    rows = r;
  }

  if (rows.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const payload: PushPayload = { title, body, url };
  const seen = new Set<string>();
  let sent = 0;

  await Promise.all(
    rows.map(async (sub) => {
      if (seen.has(sub.endpoint)) return;
      seen.add(sub.endpoint);
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload)
        );
        sent++;
      } catch (err: any) {
        // 404/410 = subscription expired; clean it up.
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await pool
            .query("DELETE FROM push_subscriptions WHERE endpoint = ?", [sub.endpoint])
            .catch(() => {});
        }
      }
    })
  );

  return NextResponse.json({ sent });
}
