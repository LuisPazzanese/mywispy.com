// /play solve endpoint.
//
// POST /solve { flag, comment? }
//   - validates the flag (must be "flagship")
//   - increments a global counter in KV
//   - stores a solver record at solver:<n>
//   - emails Luis via Resend
//   - returns { count }

interface Env {
  SOLVERS: KVNamespace;
  RESEND_API_KEY: string;
  NOTIFY_EMAIL: string;
  ALLOWED_ORIGIN: string;
}

interface SolveRequest {
  flag?: string;
  comment?: string;
}

interface SolverRecord {
  n: number;
  ts: string;
  comment: string;
  ua: string;
  ipHash: string;
}

const FLAG = 'flagship';
const RATE_LIMIT_PER_HOUR = 3;
const COMMENT_MAX = 500;

function corsHeaders(origin: string): HeadersInit {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sendEmail(env: Env, record: SolverRecord): Promise<void> {
  const text = [
    'Someone just completed the wispy/play CTF.',
    '',
    `Number:     #${record.n}`,
    `When:       ${record.ts}`,
    `Comment:    ${record.comment || '(none)'}`,
    `User agent: ${record.ua}`,
    `IP hash:    ${record.ipHash}`,
  ].join('\n');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'wispy <noreply@mywispy.com>',
      to: env.NOTIFY_EMAIL,
      subject: `new wispy/play solver — #${record.n}`,
      text,
    }),
  });
  if (!res.ok) {
    console.error('resend failed', res.status, await res.text());
  }
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const origin = env.ALLOWED_ORIGIN || 'https://mywispy.com';
    const headers = corsHeaders(origin);

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    const url = new URL(req.url);
    if (url.pathname !== '/solve' || req.method !== 'POST') {
      return new Response('not found', { status: 404, headers });
    }

    let body: SolveRequest;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'bad json' }, { status: 400, headers });
    }

    if (body.flag !== FLAG) {
      return Response.json({ error: 'wrong flag' }, { status: 400, headers });
    }

    const ip = req.headers.get('cf-connecting-ip') ?? 'unknown';
    const ipHash = (await sha256Hex(ip)).slice(0, 12);

    const rlKey = `rl:${ipHash}`;
    const rlCount = parseInt((await env.SOLVERS.get(rlKey)) ?? '0', 10);
    if (rlCount >= RATE_LIMIT_PER_HOUR) {
      return Response.json({ error: 'rate limited' }, { status: 429, headers });
    }
    await env.SOLVERS.put(rlKey, String(rlCount + 1), { expirationTtl: 3600 });

    const count = parseInt((await env.SOLVERS.get('count')) ?? '0', 10) + 1;
    await env.SOLVERS.put('count', String(count));

    const record: SolverRecord = {
      n: count,
      ts: new Date().toISOString(),
      comment: (body.comment ?? '').slice(0, COMMENT_MAX),
      ua: (req.headers.get('user-agent') ?? '').slice(0, 200),
      ipHash,
    };
    await env.SOLVERS.put(`solver:${count}`, JSON.stringify(record));

    ctx.waitUntil(sendEmail(env, record));

    return Response.json({ count }, { headers });
  },
};
