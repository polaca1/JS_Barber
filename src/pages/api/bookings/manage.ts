import { cancelCustomerBooking, getCustomerBookings, updateCustomerBooking } from '@lib/db';
import { readCookie } from '@lib/cookies';
import {
  customerBookingCancelSchema,
  customerBookingUpdateSchema,
  customerLookupSchema,
  sanitizeText,
  verifyTurnstileToken,
} from '@lib/security';

export const prerender = false;

function getErrorPayload(field: string, message: string) {
  return { ok: false, errors: { [field]: [message] } };
}

export const POST = async ({ request }: { request: Request }) => {
  const csrfCookie = readCookie(request.headers.get('cookie'), 'jsb-csrf');
  const body = await request.json().catch(() => null);
  const action = typeof body?.action === 'string' ? body.action : '';

  if (action === 'lookup') {
    const parsed = customerLookupSchema.safeParse({
      name: typeof body?.name === 'string' ? sanitizeText(body.name) : '',
      phone: typeof body?.phone === 'string' ? sanitizeText(body.phone) : '',
      csrfToken: typeof body?.csrfToken === 'string' ? body.csrfToken : '',
    });

    if (!parsed.success || !csrfCookie || csrfCookie !== parsed.data.csrfToken) {
      return Response.json({ ok: false, errors: { form: ['No se ha podido validar la consulta'] } }, { status: 400 });
    }

    const bookings = await getCustomerBookings({
      name: parsed.data.name,
      phone: parsed.data.phone,
    });

    return Response.json({ ok: true, bookings }, { status: 200 });
  }

  if (action === 'update') {
    const parsed = await customerBookingUpdateSchema.safeParseAsync({
      bookingId: typeof body?.bookingId === 'string' ? body.bookingId : '',
      name: typeof body?.name === 'string' ? sanitizeText(body.name) : '',
      phone: typeof body?.phone === 'string' ? sanitizeText(body.phone) : '',
      service: typeof body?.service === 'string' ? sanitizeText(body.service) : '',
      barber: typeof body?.barber === 'string' ? sanitizeText(body.barber) : '',
      date: typeof body?.date === 'string' ? sanitizeText(body.date) : '',
      time: typeof body?.time === 'string' ? sanitizeText(body.time) : '',
      notes: typeof body?.notes === 'string' ? sanitizeText(body.notes) : '',
      turnstileToken:
        typeof body?.['cf-turnstile-response'] === 'string'
          ? sanitizeText(body['cf-turnstile-response'])
          : typeof body?.turnstileToken === 'string'
            ? sanitizeText(body.turnstileToken)
            : '',
      csrfToken: typeof body?.csrfToken === 'string' ? body.csrfToken : '',
    });

    if (!parsed.success || !csrfCookie || csrfCookie !== parsed.data.csrfToken) {
      return Response.json({ ok: false, errors: { form: ['No se ha podido validar la cita'] } }, { status: 400 });
    }

    const turnstileOk = await verifyTurnstileToken(parsed.data.turnstileToken);
    if (!turnstileOk) {
      return Response.json(getErrorPayload('turnstileToken', 'Completa la verificacion'), { status: 400 });
    }

    const booking = await updateCustomerBooking(
      parsed.data.bookingId,
      {
        name: parsed.data.name,
        phone: parsed.data.phone,
      },
      {
        service: parsed.data.service,
        barber: parsed.data.barber,
        date: parsed.data.date,
        time: parsed.data.time,
        notes: parsed.data.notes,
      },
    );

    if (!booking) {
      return Response.json(getErrorPayload('time', 'Ese hueco ya esta ocupado o no hemos encontrado esa cita'), { status: 409 });
    }

    const bookings = await getCustomerBookings({
      name: parsed.data.name,
      phone: parsed.data.phone,
    });
    return Response.json({ ok: true, booking, bookings }, { status: 200 });
  }

  if (action === 'cancel') {
    const parsed = customerBookingCancelSchema.safeParse({
      bookingId: typeof body?.bookingId === 'string' ? body.bookingId : '',
      name: typeof body?.name === 'string' ? sanitizeText(body.name) : '',
      phone: typeof body?.phone === 'string' ? sanitizeText(body.phone) : '',
      csrfToken: typeof body?.csrfToken === 'string' ? body.csrfToken : '',
    });

    if (!parsed.success || !csrfCookie || csrfCookie !== parsed.data.csrfToken) {
      return Response.json({ ok: false, errors: { form: ['No se ha podido validar la baja de la cita'] } }, { status: 400 });
    }

    const booking = await cancelCustomerBooking(parsed.data.bookingId, {
      name: parsed.data.name,
      phone: parsed.data.phone,
    });

    if (!booking) {
      return Response.json(getErrorPayload('form', 'No hemos encontrado esa cita para cancelarla'), { status: 404 });
    }

    const bookings = await getCustomerBookings({
      name: parsed.data.name,
      phone: parsed.data.phone,
    });
    return Response.json({ ok: true, booking, bookings }, { status: 200 });
  }

  return new Response('Bad Request', { status: 400 });
};
