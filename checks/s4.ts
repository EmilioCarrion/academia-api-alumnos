// Comprobación de la práctica de la sesión 4.
// Uso, con la API arrancada (npm run dev) y el seed ejecutado:  npx tsx checks/s4.ts
import { call, ensureApiUp, expectStatus, finish, ko, ok, section } from './lib.js';

await ensureApiUp();
const login = async (email: string) => {
  const res = await call('POST', '/auth/login', { body: { email, password: 'Passw0rd!' } });
  if (res.status === 429) { console.error('El limitador de login te ha bloqueado (429): reinicia la API (Ctrl+C y npm run dev) y vuelve a ejecutar.'); process.exit(1); }
  return res.body?.token as string;
};
const sub = (token: string) => JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()).sub;
const email = `alumno${Date.now()}@academia.dev`;

section('Sesión 4 · registro y login');
const reg = await expectStatus('register → 201', 201, 'POST', '/auth/register', { body: { email, password: 'supersecreta', name: 'Alumno' } });
reg.body?.password === undefined ? ok('la respuesta no incluye el hash') : ko('la respuesta incluye el hash');
await expectStatus('register repetido → 409', 409, 'POST', '/auth/register', { body: { email, password: 'supersecreta', name: 'Alumno' } });
await expectStatus('login contraseña mala → 401', 401, 'POST', '/auth/login', { body: { email, password: 'incorrecta' } });
await expectStatus('login email inexistente → 401', 401, 'POST', '/auth/login', { body: { email: 'nadie@academia.dev', password: 'incorrecta' } });
await expectStatus('login correcto (email en mayúsculas) → 200', 200, 'POST', '/auth/login', { body: { email: email.toUpperCase(), password: 'supersecreta' } });

const tExists = (await call('POST', '/auth/login', { body: { email, password: 'incorrecta' } })).ms;
const tMissing = (await call('POST', '/auth/login', { body: { email: 'nadie@academia.dev', password: 'incorrecta' } })).ms;
const ratio = Math.max(tExists, tMissing) / Math.min(tExists, tMissing);
ratio < 2 ? ok(`login tarda lo mismo exista o no el email (${tExists.toFixed(0)} ms vs ${tMissing.toFixed(0)} ms)`)
          : ko(`el tiempo de login delata si el email existe (${tExists.toFixed(0)} ms vs ${tMissing.toFixed(0)} ms)`);

const [marta, pablo, admin, luis] = await Promise.all(['marta', 'pablo', 'admin', 'luis'].map((u) => login(`${u}@academia.dev`)));
if (!marta || !luis) { console.error('No se pudo hacer login con los usuarios del seed: ejecuta npm run seed.'); process.exit(1); }

section('Sesión 4 · autenticación y autorización');
const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
const none = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub: '1', role: 'ADMIN' })}.`;
await expectStatus('POST /courses sin token → 401', 401, 'POST', '/courses', { body: { title: 'Sin token', price: 10 } });
await expectStatus('POST /courses token basura → 401', 401, 'POST', '/courses', { token: 'basura', body: { title: 'Basura', price: 10 } });
await expectStatus('POST /courses token alg=none → 401', 401, 'POST', '/courses', { token: none, body: { title: 'None', price: 10 } });
await expectStatus('POST /courses como STUDENT → 403', 403, 'POST', '/courses', { token: luis, body: { title: 'Alumno', price: 10 } });
const created = await expectStatus('POST /courses como INSTRUCTOR → 201', 201, 'POST', '/courses', { token: marta, body: { title: 'Curso de Marta', price: 10, published: true } });
const id = created.body?.id;
String(created.body?.instructorId) === sub(marta) ? ok('instructorId lo pone el servidor (el del token)') : ko(`instructorId no es el del token (${created.body?.instructorId})`);
await expectStatus('PATCH curso ajeno (Pablo) → 403', 403, 'PATCH', `/courses/${id}`, { token: pablo, body: { price: 1 } });
await expectStatus('PATCH curso propio (Marta) → 200', 200, 'PATCH', `/courses/${id}`, { token: marta, body: { price: 12 } });
await expectStatus('PATCH como ADMIN → 200', 200, 'PATCH', `/courses/${id}`, { token: admin, body: { price: 15 } });
await expectStatus('inscribirse como STUDENT → 201', 201, 'POST', `/courses/${id}/enrollments`, { token: luis });
await expectStatus('inscribirse como INSTRUCTOR → 403', 403, 'POST', `/courses/${id}/enrollments`, { token: pablo });
await expectStatus('DELETE curso ajeno (Pablo) → 403', 403, 'DELETE', `/courses/${id}`, { token: pablo });

finish();
