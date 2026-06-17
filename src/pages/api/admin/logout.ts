import { getAdminCookieName, getCsrfCookieName, serializeCookie, verifyAdminSession } from '@lib/auth';
import { readCookie } from '@lib/cookies';

export const prerender = false;

export const POST = async ({ request }: { request: Request }) => {
  const csrfCookie = readCookie(request.headers.get('cookie'), getCsrfCookieName());
  const contentType = request.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const isUrlEncoded = contentType.includes('application/x-www-form-urlencoded');
  const csrfToken = isJson
    ? (await request.json().catch(() => null))?.csrfToken
    : isUrlEncoded
      ? new URLSearchParams(await request.text()).get('csrfToken')
      : (await request.formData().catch(() => null))?.get('csrfToken');

  if (typeof csrfToken !== 'string' || !csrfCookie || csrfCookie !== csrfToken) {
    return new Response('Forbidden', { status: 403 });
  }

  const session = readCookie(request.headers.get('cookie'), getAdminCookieName()) ?? undefined;
  if (!verifyAdminSession(session)) {
    return Response.redirect(new URL('/admin', request.url), 303);
  }

  return new Response(null, {
    status: 303,
    headers: {
      Location: new URL('/admin', request.url).toString(),
      'Set-Cookie': serializeCookie(getAdminCookieName(), '', 0),
    },
  });
};
