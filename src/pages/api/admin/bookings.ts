import { getDashboardData } from '@lib/db';
import { getAdminCookieName, verifyAdminSession } from '@lib/auth';
import { readCookie } from '@lib/cookies';

export const prerender = false;

export const GET = async ({ request }: { request: Request }) => {
  const session = readCookie(request.headers.get('cookie'), getAdminCookieName()) ?? undefined;
  if (!verifyAdminSession(session)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const dashboard = await getDashboardData();
  return Response.json({ ok: true, data: dashboard });
};
