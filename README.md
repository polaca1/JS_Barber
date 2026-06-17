# J. Sánchez Barber Shop

Aplicación web en Astro + Tailwind para la barbería de Calle de los Porches, 6, 06195, Badajoz.

## Rutas

- `/` Landing con fotos reales, servicios y contacto
- `/reservas` Página separada para clientes que quieren pedir cita
- `/admin` Panel privado con contraseña, calendario y cancelación de reservas

## Estructura

- `src/components`: componentes UI
- `src/pages`: landing, reservas, admin y endpoints
- `src/lib`: datos, seguridad y lógica compartida
- `src/styles`: estilos globales

## Variables de entorno

Copia `.env.example` a `.env` y ajusta:

- `PUBLIC_WHATSAPP_URL`
- `ADMIN_PASSWORD`
- `ADMIN_COOKIE_SECRET`

## Desarrollo local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Despliegue en Vercel

1. Sube el proyecto a GitHub.
2. Importa el repositorio en Vercel.
3. Configura estas variables de entorno:
   - `PUBLIC_WHATSAPP_URL`
   - `ADMIN_PASSWORD`
   - `ADMIN_COOKIE_SECRET`
4. Build command: `npm run build`
5. Output directory: `dist`
6. Despliega.

## Seguridad

- Validación estricta con Zod en `/api/bookings`
- CSRF con cookie httpOnly + campo oculto
- Control de origen en endpoints mutables
- Sanitización de texto antes de guardar
- Admin con cookie firmada y expiración
- Cabeceras de seguridad en `vercel.json`
