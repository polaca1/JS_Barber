import { createAdminSession, getAdminCookieName, getCsrfCookieName, serializeCookie } from '@lib/auth';
import { adminLoginSchema, isSameOrigin, sanitizeText } from '@lib/security';
import { readCookie } from '@lib/cookies';

export const prerender = false;

export const POST = async ({ request }: { request: Request }) => {
  if (!isSameOrigin(request)) {
    return new Response('Forbidden', { status: 403 });
  }

  const contentType = request.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const isUrlEncoded = contentType.includes('application/x-www-form-urlencoded');
  const isMultipart = contentType.includes('multipart/form-data');

  if (!isJson && !isUrlEncoded && !isMultipart) {
    return new Response('Unsupported Media Type', { status: 415 });
  }

  const body = isJson
    ? await request.json().catch(() => null)
    : isUrlEncoded
      ? Object.fromEntries(new URLSearchParams(await request.text()).entries())
      : Object.fromEntries((await request.formData()).entries());

  const csrfCookie = readCookie(request.headers.get('cookie'), getCsrfCookieName());
  const parsed = adminLoginSchema.safeParse({
    password: typeof body?.password === 'string' ? sanitizeText(body.password) : '',
    csrfToken: typeof body?.csrfToken === 'string' ? body.csrfToken : '',
  });

  if (!parsed.success || !csrfCookie || csrfCookie !== parsed.data.csrfToken) {
    return isJson
      ? Response.json({ ok: false }, { status: 401 })
      : Response.redirect(new URL('/admin?error=1', request.url), 303);
  }

  const token = createAdminSession(parsed.data.password);
  if (!token) {
    return isJson
      ? Response.json({ ok: false }, { status: 401 })
      : Response.redirect(new URL('/admin?error=1', request.url), 303);
  }

  const response = isJson
    ? Response.json({ ok: true }, { status: 200 })
    : new Response(null, {
        status: 303,
        headers: {
          Location: new URL('/admin', request.url).toString(),
          'Set-Cookie': serializeCookie(getAdminCookieName(), token, 60 * 60 * 12),
        },
      });

  if (isJson) {
    response.headers.set('Set-Cookie', serializeCookie(getAdminCookieName(), token, 60 * 60 * 12));
  }

  return response;
};
