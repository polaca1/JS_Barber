import { getDashboardData } from '@lib/db';
import { getAdminCookieName, verifyAdminSession } from '@lib/auth';
import { readCookie } from '@lib/cookies';

export const prerender = false;

export const GET = async ({ request }: { request: Request }) => {
  const session = readCookie(request.headers.get('cookie'), getAdminCookieName()) ?? undefined;
  if (!verifyAdminSession(session)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const data = await getDashboardData();
  return Response.json({
    ok: true,
    data: {
      bookings: data.bookings,
      workers: data.workers,
      totalBookings: data.totalBookings,
      pendingBookings: data.pendingBookings.length,
      confirmedBookings: data.confirmedBookings.length,
      cancelledBookings: data.cancelledBookings.length,
    },
  });
};
