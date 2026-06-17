import { createHmac, timingSafeEqual } from 'node:crypto';

const ADMIN_COOKIE = 'jsb-admin';
const CSRF_COOKIE = 'jsb-csrf';
const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 12;

function getSecret() {
  return process.env.ADMIN_COOKIE_SECRET || 'dev-admin-secret';
}

function getPassword() {
  return process.env.ADMIN_PASSWORD || 'admin1234';
}

function sign(payload: string) {
  return createHmac('sha256', getSecret()).update(payload).digest('hex');
}

function parseToken(token: string | undefined) {
  if (!token) return null;
  const [tsRaw, sig] = token.split('.');
  const ts = Number(tsRaw);
  if (!Number.isFinite(ts) || !sig) return null;
  return { ts, sig };
}

export function createAdminSession(password: string) {
  if (password !== getPassword()) {
    return null;
  }

  const ts = Date.now().toString();
  const sig = sign(`${password}:${ts}`);
  return `${ts}.${sig}`;
}

export function verifyAdminSession(token: string | undefined) {
  const parsed = parseToken(token);
  if (!parsed) return false;
  if (Date.now() - parsed.ts > ADMIN_SESSION_TTL_MS) return false;

  const expected = sign(`${getPassword()}:${parsed.ts}`);
  const a = Buffer.from(parsed.sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function getAdminCookieName() {
  return ADMIN_COOKIE;
}

export function getCsrfCookieName() {
  return CSRF_COOKIE;
}

export function serializeCookie(name: string, value: string, maxAgeSeconds: number) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSeconds}`;
}
