import { requireTuAdmin } from '@/lib/actions/auth-guard';
import { NextRequest } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UPDATE_COOLDOWN_MS = 5 * 60 * 1000;
let lastUpdateAt = 0;

function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return false;

  try {
    const originHost = new URL(origin).host;
    const requestHost =
      req.headers.get('x-forwarded-host') || req.headers.get('host') || req.nextUrl.host;
    return originHost === requestHost;
  } catch {
    return false;
  }
}

export async function GET() {
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { Allow: 'POST' },
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireTuAdmin();
  if (auth.error || !auth.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  if (!isSameOrigin(req)) {
    return new Response(JSON.stringify({ error: 'Permintaan lintas situs ditolak' }), { status: 403 });
  }

  const elapsed = Date.now() - lastUpdateAt;
  if (elapsed < UPDATE_COOLDOWN_MS) {
    const retryAfter = Math.ceil((UPDATE_COOLDOWN_MS - elapsed) / 1000);
    return new Response(
      JSON.stringify({ error: `Update baru saja dijalankan. Coba lagi dalam ${retryAfter} detik.` }),
      { status: 429 }
    );
  }
  lastUpdateAt = Date.now();

  const script = path.join(process.cwd(), 'deploy.sh');

  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder();
      const send = (obj: unknown) => controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));

      const child = spawn('bash', [script], {
        detached: true,
        env: process.env,
      });
      child.unref();

      child.stdout.on('data', (d: Buffer) => {
        d.toString().split('\n').filter(Boolean).forEach((line) => send({ line, type: 'stdout' }));
      });
      child.stderr.on('data', (d: Buffer) => {
        d.toString().split('\n').filter(Boolean).forEach((line) => send({ line, type: 'stderr' }));
      });
      child.on('exit', (code) => {
        send({ done: true, code: code ?? 0 });
        controller.close();
      });
      child.on('error', (err) => {
        send({ line: `!! spawn error: ${err.message}`, type: 'stderr' });
        send({ done: true, code: 1 });
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
