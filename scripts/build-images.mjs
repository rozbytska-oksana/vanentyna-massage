// Генерує AVIF і WebP для зображень сайту з майстрів у assets-originals.
// JPEG-похідні в public лишаються запасним варіантом і цим скриптом не змінюються.
// Запуск: npm run images  (лише частина: npm run images -- certificates)
import { mkdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const root = new URL('..', import.meta.url).pathname;
const publicImages = join(root, 'public/images');

const quality = {
  hero: { avif: 60, webp: 84 },
  service: { avif: 55, webp: 80 },
};

const serviceWidths = [480, 960, 1448];
const serviceJobs = [
  ['acupuncture-room-ai-v2.png', 'acupuncture-room-v2'],
  ['anticellulite-lymphatic-room-ai-v2.png', 'anticellulite-lymphatic-room-v2'],
  ['back-closeup-male-ai-v3.png', 'back-closeup-male-v3'],
  ['children-still-life-ai-v3.png', 'children-still-life-v3'],
  ['face-room-ai-v2.png', 'face-room-v2'],
  ['full-body-massage-ai-v3.png', 'full-body-massage-v3'],
  ['neck-massage-overhead-ai-v3.png', 'neck-massage-overhead-v3'],
].map(([master, prefix]) => ({
  master: `assets-originals/services/${master}`,
  quality: quality.service,
  variants: serviceWidths.map((width) => ({ name: `services/${prefix}-${width}`, width })),
}));

// Сертифікати: вписуємо в квадрат за більшою стороною, щоб портретний документ не розтягувався.
const certificateJobs = [
  '2026-06-27-probody-forum-lviv',
  '2026-03-15-manual-practices-acupuncture',
  '2025-06-14-anticellulite-masterclass',
  '2025-03-29-visceral-therapy-masterclass',
  '2023-03-18-expert-x-facial-massage-ua',
  '2023-03-18-expert-x-facial-massage-en',
  '2022-10-30-shliakh-do-uspikhu-master-masazhu',
].map((slug) => ({
  master: `assets-originals/certificates/${slug}-ai-restored.png`,
  // Вища якість, щоб дрібний текст документів лишався читабельним у збільшенні.
  quality: { avif: 68, webp: 88 },
  variants: [480, 960, 1448].map((box) => ({ name: `certificates/${slug}-${box}`, box })),
}));

/** @type {{ master: string; quality: { avif: number; webp: number }; flop?: boolean;
 *  variants: { name: string; width?: number; box?: number; crop?: sharp.Region;
 *  skipWebp?: boolean; jpegQuality?: number }[] }[]} */
const jobs = [
  {
    master: 'assets-originals/studio/studio-hero-clarity-ai-v1.png',
    quality: quality.hero,
    variants: [
      // Зображення для соцмереж і месенджерів (og:image): кабінет із банера, 1200×630, лише JPEG,
      // бо WebP/AVIF підтримують не всі сервіси прев’ю. Кроп 1672×878 по центру висоти.
      {
        name: 'og-cabinet',
        crop: { left: 0, top: 31, width: 1672, height: 878 },
        width: 1200,
        jpegQuality: 86,
      },
      { name: 'studio-hero-clarity-v1-1672', width: 1672 },
      { name: 'studio-hero-clarity-v1-1280', width: 1280 },
      // Вертикальний mobile-crop; координати збігаються з JPEG і з позиціями гірлянди.
      {
        name: 'studio-hero-clarity-v1-mobile-706',
        crop: { left: 650, top: 0, width: 706, height: 941 },
      },
    ],
  },
  ...serviceJobs,
  {
    // Портрет Валентини (наданий 22.11.2026), спеціально підготовлений для «Про мене»:
    // прозорі «мазкові» краї (альфа-канал) зберігаються, кадр не обрізається, без ретуші.
    master: 'assets-originals/valentyna/valentyna-portrait-original.webp',
    quality: { avif: 65, webp: 88 },
    variants: [480, 800, 1086].map((width) => ({
      name: `valentyna/portrait-${width}`,
      width,
    })),
  },
  {
    master: 'assets-originals/contacts/contacts-background-candles-ai-v2.png',
    quality: { avif: 55, webp: 82 },
    variants: [1280, 2172].map((width) => ({
      name: `contacts/background-candles-v2-${width}`,
      width,
    })),
  },
  {
    master: 'assets-originals/contacts/contacts-background-mobile-ai-v1.png',
    quality: { avif: 55, webp: 82 },
    variants: [480, 768].map((width) => ({
      name: `contacts/background-v1-mobile-${width}`,
      width,
    })),
  },
  {
    master: 'assets-originals/services/visceral-massage-ai-v3.png',
    quality: quality.service,
    flop: true,
    variants: serviceWidths.map((width) => ({
      name: `services/visceral-massage-v3-mirrored-${width}`,
      width,
    })),
  },
  {
    // Спортивний масаж: 1448 WebP у public — незмінна копія оригіналу, тому його не перезаписуємо.
    master: 'assets-originals/services/back-massage-ai-v1.webp',
    quality: quality.service,
    variants: [
      { name: 'services/back-massage-720', width: 720 },
      { name: 'services/back-massage-1448', width: 1448, skipWebp: true },
    ],
  },
  ...certificateJobs,
  ...[9236, 9235, 9234, 9233, 9232, 9231].map((number) => ({
    master: `assets-originals/reviews/IMG_${number}.PNG`,
    // Текст скриншота: висока якість кодування, без реконструкції літер та облич.
    quality: { avif: 75, webp: 90 },
    variants: [480, 800, 1320].map((width) => ({
      name: `reviews/review-${number}-${width}`,
      width,
      // Прибираємо лише системну панель телефона й нижнє чорне поле.
      crop: { left: 0, top: 186, width: 1320, height: 2346 },
    })),
  })),
];

const filter = process.argv[2];

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

for (const job of jobs) {
  for (const variant of job.variants) {
    if (filter && !variant.name.includes(filter)) continue;
    const base = join(publicImages, variant.name);
    await mkdir(dirname(base), { recursive: true });

    const pipeline = () => {
      let image = sharp(join(root, job.master));
      if (job.flop) image = image.flop();
      if (variant.crop) image = image.extract(variant.crop);
      if (variant.width) image = image.resize({ width: variant.width });
      if (variant.box) {
        image = image.resize({
          width: variant.box,
          height: variant.box,
          fit: 'inside',
          withoutEnlargement: true,
        });
      }
      return image;
    };

    if (variant.jpegQuality) {
      await pipeline()
        .resize({ width: variant.width, height: 630, fit: 'cover' })
        .jpeg({ quality: variant.jpegQuality, mozjpeg: true })
        .toFile(`${base}.jpg`);
      console.log(`${variant.name}: jpg ${kb((await stat(`${base}.jpg`)).size)}`);
      continue;
    }

    await pipeline().avif({ quality: job.quality.avif, effort: 6 }).toFile(`${base}.avif`);
    if (!variant.skipWebp) {
      await pipeline().webp({ quality: job.quality.webp, effort: 6 }).toFile(`${base}.webp`);
    }

    const sizes = [`avif ${kb((await stat(`${base}.avif`)).size)}`];
    if (!variant.skipWebp) sizes.push(`webp ${kb((await stat(`${base}.webp`)).size)}`);
    console.log(`${variant.name}: ${sizes.join(', ')}`);
  }
}
