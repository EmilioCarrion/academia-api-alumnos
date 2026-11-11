// Utilidades de los scripts de comprobación. Funcionan en macOS, Linux y Windows.
export const API = process.env.API ?? 'http://localhost:3000/api/v1';

let pass = 0;
let fail = 0;

export const ok = (msg: string) => { pass++; console.log(`  ✓ ${msg}`); };
export const ko = (msg: string) => { fail++; console.log(`  ✗ ${msg}`); };
export const section = (title: string) => console.log(`\n${title}`);

export type Res = { status: number; body: any; headers: Headers; ms: number };

export async function call(method: string, path: string, opts: { body?: unknown; raw?: string; token?: string; headers?: Record<string, string> } = {}): Promise<Res> {
  const headers: Record<string, string> = { ...opts.headers };
  if (opts.body !== undefined || opts.raw !== undefined) headers['Content-Type'] = 'application/json';
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  const t0 = performance.now();
  const res = await fetch(`${API}${path}`, { method, headers, body: opts.raw ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined) });
  const text = await res.text();
  let body: any = text;
  try { body = JSON.parse(text); } catch { /* no es JSON */ }
  return { status: res.status, body, headers: res.headers, ms: performance.now() - t0 };
}

export async function expectStatus(desc: string, want: number, method: string, path: string, opts?: Parameters<typeof call>[2]) {
  const res = await call(method, path, opts);
  if (res.status === want) ok(`${desc} (${res.status})`);
  else ko(`${desc}: esperaba ${want}, llegó ${res.status} → ${JSON.stringify(res.body).slice(0, 160)}`);
  return res;
}

export async function ensureApiUp() {
  try { await fetch(`${API}/courses`); }
  catch { console.error(`No hay API en ${API}. Arráncala en otra terminal con: npm run dev`); process.exit(1); }
}

export function finish() {
  console.log(`\n${pass} ok, ${fail} fallos`);
  process.exit(fail === 0 ? 0 : 1);
}
