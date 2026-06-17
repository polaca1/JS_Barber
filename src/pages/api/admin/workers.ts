import { addWorker, getAllWorkers } from '@lib/db';
import { getAdminCookieName, getCsrfCookieName, verifyAdminSession } from '@lib/auth';
import { readCookie } from '@lib/cookies';
import { isSameOrigin, sanitizeText, workerCreateSchema } from '@lib/security';

export const prerender = false;

export const GET = async ({ request }: { request: Request }) => {
  const session = readCookie(request.headers.get('cookie'), getAdminCookieName()) ?? undefined;
  if (!verifyAdminSession(session)) {
    return new Response('Unauthorized', { status: 401 });
  }

  return Response.json({ ok: true, workers: await getAllWorkers() });
};

export const POST = async ({ request }: { request: Request }) => {
  if (!isSameOrigin(request)) {
    return new Response('Forbidden', { status: 403 });
  }

  const session = readCookie(request.headers.get('cookie'), getAdminCookieName()) ?? undefined;
  if (!verifyAdminSession(session)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const csrfCookie = readCookie(request.headers.get('cookie'), getCsrfCookieName());
  const body = await request.json().catch(() => null);
  const parsed = workerCreateSchema.safeParse({
    name: typeof body?.name === 'string' ? sanitizeText(body.name) : '',
    role: typeof body?.role === 'string' ? sanitizeText(body.role) : 'Barbero',
    csrfToken: typeof body?.csrfToken === 'string' ? body.csrfToken : '',
  });

  if (!parsed.success || !csrfCookie || csrfCookie !== parsed.data.csrfToken) {
    return Response.json({ ok: false }, { status: 403 });
  }

  const worker = await addWorker({
    name: parsed.data.name,
    role: parsed.data.role,
  });

  if (!worker) {
    return Response.json({ ok: false, error: 'duplicate' }, { status: 409 });
  }

  return Response.json({ ok: true, worker }, { status: 201 });
};
