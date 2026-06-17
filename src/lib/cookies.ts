export function readCookie(header: string | null, name: string) {
  if (!header) return null;

  const value = header
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return value ? decodeURIComponent(value.split('=').slice(1).join('=')) : null;
}
