import { removeWorker } from '@lib/db';
import { getAdminCookieName, getCsrfCookieName, verifyAdminSession } from '@lib/auth';
import { bookingCancelSchema, isSameOrigin } from '@lib/security';
import { readCookie } from '@lib/cookies';

export const prerender = false;

export const POST = async ({ request, params }: { request: Request; params: { id: string } }) => {
  if (!isSameOrigin(request)) {
    return new Response('Forbidden', { status: 403 });
  }

  const session = readCookie(request.headers.get('cookie'), getAdminCookieName()) ?? undefined;
  if (!verifyAdminSession(session)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const csrfCookie = readCookie(request.headers.get('cookie'), getCsrfCookieName());
  const body = await request.json().catch(() => null);
  const parsed = bookingCancelSchema.safeParse({
    csrfToken: typeof body?.csrfToken === 'string' ? body.csrfToken : '',
  });

  if (!parsed.success || !csrfCookie || csrfCookie !== parsed.data.csrfToken) {
    return new Response('Forbidden', { status: 403 });
  }

  const worker = await removeWorker(params.id);
  if (!worker) {
    return new Response('Not Found', { status: 404 });
  }

  return Response.json({ ok: true, worker });
};
