import { createBooking } from '@lib/db';
import { readCookie } from '@lib/cookies';
import { isSameOrigin, sanitizeText, validateBookingPayload, verifyTurnstileToken } from '@lib/security';

export async function handleBooking(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
  }

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

  const csrfCookie = readCookie(request.headers.get('cookie'), 'jsb-csrf');
  const parsed = await validateBookingPayload({
    ...body,
    name: typeof body?.name === 'string' ? sanitizeText(body.name) : body?.name,
    phone: typeof body?.phone === 'string' ? sanitizeText(body.phone) : body?.phone,
    service: typeof body?.service === 'string' ? sanitizeText(body.service) : body?.service,
    barber: typeof body?.barber === 'string' ? sanitizeText(body.barber) : body?.barber,
    date: typeof body?.date === 'string' ? sanitizeText(body.date) : body?.date,
    time: typeof body?.time === 'string' ? sanitizeText(body.time) : body?.time,
    notes: typeof body?.notes === 'string' ? sanitizeText(body.notes) : '',
    turnstileToken:
      typeof body?.['cf-turnstile-response'] === 'string'
        ? sanitizeText(body['cf-turnstile-response'])
        : typeof body?.turnstileToken === 'string'
          ? sanitizeText(body.turnstileToken)
          : '',
    csrfToken: typeof body?.csrfToken === 'string' ? body.csrfToken : '',
  });

  if (!parsed.success) {
    const payload = {
      ok: false,
      errors: parsed.error.issues.reduce<Record<string, string[]>>((acc, issue) => {
        const field = issue.path[0];
        if (typeof field === 'string') {
          acc[field] ??= [];
          acc[field].push(issue.message);
        }
        return acc;
      }, {}),
    };
    return isJson
      ? Response.json(payload, { status: 400 })
      : Response.redirect(new URL('/gracias?status=invalid', request.url), 303);
  }

  if (!csrfCookie || csrfCookie !== parsed.data.csrfToken) {
    return new Response('Forbidden', { status: 403 });
  }

  const turnstileOk = await verifyTurnstileToken(parsed.data.turnstileToken);
  if (!turnstileOk) {
    return isJson
      ? Response.json({ ok: false, errors: { turnstileToken: ['Completa la verificacion'] } }, { status: 400 })
      : Response.redirect(new URL('/gracias?status=invalid', request.url), 303);
  }

  const record = await createBooking({
    name: parsed.data.name,
    phone: parsed.data.phone,
    service: parsed.data.service,
    barber: parsed.data.barber,
    date: parsed.data.date,
    time: parsed.data.time,
    notes: parsed.data.notes,
  });

  if (!record) {
    return isJson
      ? Response.json({ ok: false, errors: { time: ['Ese hueco ya esta ocupado para esa persona'] } }, { status: 409 })
      : Response.redirect(new URL('/gracias?status=invalid', request.url), 303);
  }

  if (isJson) {
    return Response.json({ ok: true, booking: record }, { status: 201 });
  }

  return Response.redirect(new URL('/gracias?status=success', request.url), 303);
}
