import sharp from 'sharp';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const records = JSON.parse(await readFile('assets-originals/videos/manifest.json', 'utf8'));
const titles = [
  'Масаж спини',
  'Робота з м’язами спини',
  'Масаж шиї та плечей',
  'Масаж плечового поясу',
  'Масаж шиї',
  'Масаж спини та плечей',
  'Масаж обличчя та шиї',
  'Масаж попереку',
  'Спортивний масаж',
  'Масаж спини в кабінеті',
  'Робота з м’язами спини та шиї',
  'Масаж комірцевої зони',
  'Масаж спини: деталі процесу',
  'Делікатний масаж шиї',
  'Масаж стоп',
  'Масаж обличчя',
  'Робота зі стопою',
  'Масаж ніг',
  'Масаж гомілки',
];
await mkdir('public/images/process', { recursive: true });
for (const [index, item] of records.entries()) {
  item.originalSha256 = createHash('sha256')
    .update(await readFile(item.source))
    .digest('hex');
  item.poster = `images/process/${item.id}-v1`;
  item.title = titles[index];
  item.posterWidths = [180, 360, 540].filter((width) => width <= item.width);
  item.posterOutputs = [];
  for (const width of item.posterWidths) {
    for (const format of ['avif', 'webp']) {
      const file = `public/${item.poster}-${width}.${format}`;
      await sharp(`assets-originals/videos/generated/${item.id}.jpg`)
        .resize({ width, withoutEnlargement: true })
        .sharpen({ sigma: 0.4, m1: 0.3, m2: 0.8 })
        .toFormat(format, { quality: format === 'avif' ? 62 : 84, effort: 4 })
        .toFile(file);
      item.posterOutputs.push({ file, bytes: (await stat(file)).size });
    }
  }
}
await writeFile('assets-originals/videos/manifest.json', JSON.stringify(records, null, 2) + '\n');
// Перші кадри різні за планом: спина, шия, стопа; без зміни самих роликів.
const displayOrder = [
  9264, 9261, 9259, 9271, 9269, 9270, 9268, 9267, 9266, 9263, 9272, 9273, 9274, 9265, 9262, 9257,
  9258, 9260, 9275,
];
const ordered = displayOrder.map((number) => records.find((item) => item.id === `img_${number}`));
const data = ordered.map(({ id, src, poster, title, width, height, posterWidths }) => ({
  id,
  src,
  poster,
  title,
  width,
  height,
  posterWidths,
}));
await writeFile(
  'app/data/process-videos.ts',
  `export interface ProcessVideo {
  id: string;
  src: string;
  poster: string;
  title: string;
  width: number;
  height: number;
  posterWidths: number[];
}

export const processContent = {
  eyebrow: 'Моменти турботи',
  title: 'Масаж у деталях',
};

export const processVideos: ProcessVideo[] = ${JSON.stringify(data, null, 2)};\n`,
);
console.log({
  videos: records.length,
  originalBytes: records.reduce((n, r) => n + r.originalBytes, 0),
  mp4Bytes: records.reduce((n, r) => n + r.bytes, 0),
});
