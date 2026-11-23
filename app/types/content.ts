export interface Service {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  /** Чернетка розширеного опису (не текст Валентини); потребує її погодження перед публікацією. */
  details?: string;
  /** Число у гривнях; прайс потребує перевірки перед публікацією. */
  price: number;
  image: string | null;
  imageAlt: string | null;
  imageWidth?: number;
  imageHeight?: number;
  /** Responsive-варіанти того самого кадру; `image` — запасний src. */
  imageSources?: readonly { path: string; width: number }[];
  published: boolean;
}

export interface AboutContent {
  eyebrow: string;
  name: string;
  role: string;
  introduction: string;
  emphasis: string[];
  paragraphs: string[];
  quote: string;
  learning: {
    title: string;
  };
  portrait: {
    src: string;
    sources: { path: string; width: number }[];
    alt: string;
    width: number;
    height: number;
  } | null;
}

export interface StudioImage {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
}

export interface Review {
  id: string;
  imageBase: string;
  imageAlt: string;
  width: number;
  height: number;
  /** Читабельна цитата з кадру; null, якщо текст неможливо точно розібрати. */
  text: string | null;
  publicationApproved: boolean;
}

export interface Certificate {
  id: string;
  /** Тип документа: сертифікат, диплом, майстер-клас тощо. */
  kind: string;
  title: string;
  issuer: string;
  /** ISO-дата для сортування; для багатоденних подій — останній день. */
  date: string;
  dateLabel: string;
  /** Шлях без розміру й розширення: `${imageBase}-{480|960|1448}.{avif|webp}`. */
  imageBase: string;
  imageAlt: string;
  /** Розміри майстра; похідні вписані в квадрат 480/960/1448 за більшою стороною. */
  width: number;
  height: number;
  /** Файл відновлено ШІ з фото документа; з паперовим оригіналом не звірено. */
  aiRestored: boolean;
  originalVerified: boolean;
  publicationApproved: boolean;
}

export interface Video {
  id: string;
  title: string;
  src: string;
  poster: string;
  width: number;
  height: number;
  publicationApproved: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  /** Застереження під відповіддю (наприклад, про відповідальність клієнта). */
  note?: string;
}

export interface ContactChannel {
  id: string;
  label: string;
  href: string;
}

export interface ContactDetails {
  phone: string | null;
  email: string | null;
  address: string | null;
  channels: ContactChannel[];
}

export type AdvantageIconName = 'experience' | 'person' | 'learning' | 'range' | 'room' | 'booking';

export interface Advantage {
  id: string;
  icon: AdvantageIconName;
  title: string;
  text: string;
}
