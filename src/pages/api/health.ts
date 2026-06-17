export const prerender = false;

export const GET = async () => {
  return Response.json({ ok: true, status: 'healthy' });
};
