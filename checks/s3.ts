// Comprobación de la práctica de la sesión 3 (válido hasta la rama s3-end).
// Uso, con la API arrancada en otra terminal (npm run dev):  npx tsx checks/s3.ts
import { prisma } from '../src/db.js';
import { ensureApiUp, expectStatus, finish, section } from './lib.js';

await ensureApiUp();
const instructor = await prisma.user.findFirst({ where: { role: 'INSTRUCTOR' } });
if (!instructor) { console.error('No hay ningún INSTRUCTOR en la DB: ejecuta antes el seed (npm run seed).'); process.exit(1); }

section('Sesión 3 · CRUD de courses');
await expectStatus('GET  /courses', 200, 'GET', '/courses');
await expectStatus('GET  /courses?page=abc → 400', 400, 'GET', '/courses?page=abc');
await expectStatus('GET  /courses?pageSize=500 → 400', 400, 'GET', '/courses?pageSize=500');
await expectStatus('POST precio negativo → 400', 400, 'POST', '/courses', { body: { title: 'ab', price: -5 } });
await expectStatus('POST JSON mal formado → 400', 400, 'POST', '/courses', { raw: '{"title":' });
const created = await expectStatus('POST válido → 201', 201, 'POST', '/courses', { body: { title: 'Curso de prueba', price: 19.99, published: true, instructorId: instructor.id } });
const id = created.body?.id;
await expectStatus(`GET  /courses/${id} → 200`, 200, 'GET', `/courses/${id}`);
await expectStatus('GET  /courses/abc → 400', 400, 'GET', '/courses/abc');
await expectStatus('GET  /courses/99999 → 404', 404, 'GET', '/courses/99999');
await expectStatus(`PATCH /courses/${id} → 200`, 200, 'PATCH', `/courses/${id}`, { body: { price: 24.99 } });
await expectStatus('PATCH /courses/99999 → 404', 404, 'PATCH', '/courses/99999', { body: { price: 24.99 } });
await expectStatus('POST inscripción → 201', 201, 'POST', `/courses/${id}/enrollments`, { body: { userId: instructor.id } });
await expectStatus('POST inscripción repetida → 409', 409, 'POST', `/courses/${id}/enrollments`, { body: { userId: instructor.id } });
await expectStatus(`GET  /users/${instructor.id}/enrollments → 200`, 200, 'GET', `/users/${instructor.id}/enrollments`);
await expectStatus('DELETE curso con inscripciones → 409', 409, 'DELETE', `/courses/${id}`);
// limpieza para poder borrarlo; sin id, `courseId: undefined` no filtraría y borraría TODAS las inscripciones
if (typeof id === 'number') await prisma.enrollment.deleteMany({ where: { courseId: id } });
await expectStatus(`DELETE /courses/${id} → 204`, 204, 'DELETE', `/courses/${id}`);
await expectStatus('DELETE otra vez → 404', 404, 'DELETE', `/courses/${id}`);


await prisma.$disconnect();
finish();
