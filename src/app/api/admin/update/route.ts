import { requireTuAdmin } from '@/lib/actions/auth-guard';
import { NextRequest } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await requireTuAdmin();
  if (auth.error || !auth.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const script = path.join(process.cwd(), 'deploy.sh');

  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder();
      const send = (obj: unknown) => controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));

      // ponytail: detached + unref agar deploy.sh lanjut meski pm2 reload membunuh process ini
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
