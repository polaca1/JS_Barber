export const site = {
  name: 'J. Sanchez Barber Shop',
  shortName: 'J. Sanchez',
  address: 'Calle de los Porches, 6, 06195, Badajoz',
  phoneDisplay: '654 07 81 22',
  phoneDigits: '34654078122',
  instagramHandle: '@sanchejuan',
  instagramUrl: 'https://www.instagram.com/sanchejuan/',
  whatsappUrl:
    import.meta.env.PUBLIC_WHATSAPP_URL ||
    'https://wa.me/34654078122?text=Hola%20quiero%20reservar%20una%20cita%20en%20J.%20Sanchez%20Barber%20Shop',
  googleMapsUrl:
    'https://www.google.com/maps/place/J.Sanchez+Barbeshop/@38.8843942,-6.8610809,17z/data=!3m1!4b1!4m6!3m5!1s0xd16ef0070624603:0x9fc817f4fb68aa5f!8m2!3d38.8843942!4d-6.8610809!16s%2Fg%2F11wfjy39cs?entry=ttu',
  googleMapsEmbedUrl: 'https://www.google.com/maps?q=38.8843942,-6.8610809&z=17&output=embed',
};

export const barberOptions = [
  { value: 'toni-sanchez', label: 'Toni Sanchez' },
  { value: 'juan-antonio-sanchez', label: 'Juan Antonio Sanchez' },
] as const;

export const barbers = ['toni-sanchez', 'juan-antonio-sanchez'] as const;

export const barberProfiles = [
  {
    value: 'toni-sanchez',
    name: 'Toni Sanchez',
    role: 'Barbero',
    note: 'Cortes definidos, degradados y acabados precisos.',
  },
  {
    value: 'juan-antonio-sanchez',
    name: 'Juan Antonio Sanchez',
    role: 'Barbero',
    note: 'Textura, limpieza de lineas y trato cercano.',
  },
] as const;

export const getBarberLabel = (value: (typeof barbers)[number]) =>
  barberOptions.find((barber) => barber.value === value)?.label ?? value;

export const services = [
  { name: 'Corte', price: '11,00 EUR', duration: '30 min' },
  { name: 'Corte + Barba', price: '13,00 EUR', duration: '30 min' },
  { name: 'Corte nino (hasta 5 anos)', price: '8,00 EUR', duration: '30 min' },
  { name: 'Corte jubilado', price: '8,00 EUR', duration: '30 min' },
  { name: 'Rapado y barba', price: '10,00 EUR', duration: '30 min' },
  { name: 'Mechas', price: '20,00 EUR', duration: '45 min' },
  { name: 'Decoloracion (blanco) + corte', price: '50,00 EUR', duration: '75 min' },
  { name: 'Cuello+patillas+barba', price: '10,00 EUR', duration: '30 min' },
] as const;

export const serviceNames = [
  'Corte',
  'Corte + Barba',
  'Corte nino (hasta 5 anos)',
  'Corte jubilado',
  'Rapado y barba',
  'Mechas',
  'Decoloracion (blanco) + corte',
  'Cuello+patillas+barba',
] as const;

export const brandBanner = '/media/branding/logo.jpg';

export const heroImages = [
  {
    src: '/media/haircuts/ad3e0aecd85c475694f888928251b5-jsanchez-barbershop-inspiration-a5c458f8da4341c1a49bceb8e4c2ac-booksy.jpeg',
    alt: 'Interior en blanco y negro de J. Sanchez Barbershop',
  },
  {
    src: '/media/haircuts/8ea1b3a7fb304504991f8250f02a99-jsanchez-barbershop-inspiration-b786d329bf4342468f889d2586b624-booksy.jpeg',
    alt: 'Perfil lateral de un corte degradado realizado en la barberia',
  },
  {
    src: '/media/haircuts/ad3e0aecd85c475694f888928251b5-jsanchez-barbershop-inspiration-a5c458f8da4341c1a49bceb8e4c2ac-booksy.jpeg',
    alt: 'Corte con textura y acabado limpio en la barberia',
  },
] as const;

export const galleryImages = [
  {
    src: '/media/gallery/fade-01.jpeg',
    title: 'Fade limpio',
    alt: 'Corte degradado con transicion suave',
  },
  {
    src: '/media/gallery/fade-02.jpeg',
    title: 'Perfil definido',
    alt: 'Perfil lateral con acabado preciso',
  },
  {
    src: '/media/gallery/fade-03.jpeg',
    title: 'Textura corta',
    alt: 'Corte corto con textura natural',
  },
  {
    src: '/media/gallery/fade-04.jpeg',
    title: 'Barba cuidada',
    alt: 'Barba perfilada y limpia',
  },
  {
    src: '/media/gallery/fade-05.jpeg',
    title: 'Trabajo en detalle',
    alt: 'Detalle de un degradado trabajado',
  },
  {
    src: '/media/gallery/fade-06.jpeg',
    title: 'Acabado final',
    alt: 'Acabado final de corte en barberia',
  },
] as const;
