import { handleBooking } from '@api/booking';

export const prerender = false;

export const POST = async ({ request }: { request: Request }) => {
  return handleBooking(request);
};
