/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#050505',
        paper: '#f6f6f5',
        smoke: '#b3b3b3',
        charcoal: '#181818',
        accent: '#d9d9d9',
      },
      boxShadow: {
        soft: '0 20px 60px rgba(0, 0, 0, 0.22)',
      },
      backgroundImage: {
        'grid-fade':
          'radial-gradient(circle at top, rgba(255,255,255,0.08), transparent 30%), linear-gradient(180deg, #0f0f0f 0%, #050505 100%)',
      },
    },
  },
  plugins: [],
};
