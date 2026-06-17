import { z } from 'zod';
import { isActiveWorker } from '@lib/db';
import { serviceNames } from '@lib/site';

const uuidSchema = z.string().regex(
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  'CSRF invalido',
);

function madridIsoDate(date: Date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(date);
}

const nameSchema = z
  .string()
  .trim()
  .min(2, 'El nombre es demasiado corto')
  .max(80, 'El nombre es demasiado largo')
  .regex(/^[\p{L}\p{M}0-9' -]+$/u, 'El nombre contiene caracteres no permitidos');

const phoneSchema = z
  .string()
  .trim()
  .min(8, 'El telefono es demasiado corto')
  .max(20, 'El telefono es demasiado largo')
  .regex(/^[+0-9()\s-]+$/, 'El telefono contiene caracteres no permitidos');

const serviceSchema = z.enum(serviceNames);

const barberSchema = z
  .string()
  .trim()
  .min(1, 'Selecciona un profesional')
  .refine(async (value) => isActiveWorker(value), 'La persona seleccionada ya no esta disponible');

const dateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha no tiene un formato valido')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00`);
    const today = madridIsoDate();
    return Number.isFinite(date.getTime()) && value >= today && date.getDay() !== 0;
  }, 'La fecha no puede ser anterior a hoy ni caer en domingo');

const timeSchema = z.string().trim().regex(/^\d{2}:\d{2}$/, 'La hora no tiene un formato valido');

const notesSchema = z.string().trim().max(500).optional().default('');

const captchaSchema = z.string().trim().min(1, 'Completa la verificacion');

export const bookingSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  service: serviceSchema,
  barber: barberSchema,
  date: dateSchema,
  time: timeSchema,
  notes: notesSchema,
  turnstileToken: captchaSchema,
  csrfToken: uuidSchema,
});

export const customerLookupSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  csrfToken: uuidSchema,
});

export const customerBookingUpdateSchema = z.object({
  bookingId: uuidSchema,
  name: nameSchema,
  phone: phoneSchema,
  service: serviceSchema,
  barber: barberSchema,
  date: dateSchema,
  time: timeSchema,
  notes: notesSchema,
  turnstileToken: captchaSchema,
  csrfToken: uuidSchema,
});

export const customerBookingCancelSchema = z.object({
  bookingId: uuidSchema,
  name: nameSchema,
  phone: phoneSchema,
  csrfToken: uuidSchema,
});

export const adminLoginSchema = z.object({
  password: z.string().trim().min(1).max(128),
  csrfToken: uuidSchema,
});

export const bookingCancelSchema = z.object({
  csrfToken: uuidSchema,
});

export const workerCreateSchema = z.object({
  name: nameSchema,
  role: z
    .string()
    .trim()
    .min(2, 'El rol es demasiado corto')
    .max(60, 'El rol es demasiado largo')
    .optional()
    .default('Barbero'),
  csrfToken: uuidSchema,
});

export function sanitizeText(input: string) {
  return input.replace(/[<>`]/g, '').trim();
}

export async function validateBookingPayload(payload: unknown) {
  return bookingSchema.safeParseAsync(payload);
}

export async function verifyTurnstileToken(token: string, remoteip?: string) {
  if (!token) {
    return false;
  }

  const secret = process.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';
  const body = new URLSearchParams({
    secret,
    response: token,
  });

  if (remoteip) {
    body.set('remoteip', remoteip);
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = await response.json().catch(() => null);
    return Boolean(data?.success);
  } catch {
    return false;
  }
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const url = new URL(request.url);

  if (origin) {
    return origin === url.origin;
  }

  if (referer) {
    try {
      return new URL(referer).origin === url.origin;
    } catch {
      return false;
    }
  }

  return false;
}
