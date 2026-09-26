import tailwindcss from '@tailwindcss/vite';
import type { UserConfig } from 'vite';

export default {
  plugins: [tailwindcss()],
  base: './',
} satisfies UserConfig;
