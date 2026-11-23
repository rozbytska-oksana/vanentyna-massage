/** Шлях до того самого кадру в іншому форматі (AVIF/WebP генерує `npm run images`). */
export const withImageExtension = (path: string, extension: 'avif' | 'webp'): string =>
  path.replace(/\.(jpe?g|png|webp)$/i, `.${extension}`);
