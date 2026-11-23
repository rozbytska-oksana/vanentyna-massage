import type { Advantage } from '~/types/content';
import { certificates } from '~/data/certificates';
import { contacts } from '~/data/contacts';
import { services } from '~/data/services';

// Переваги складені лише з фактів сайту: тексту Валентини (about.ts), опублікованих документів,
// переліку послуг і контактів. Формулювання — чернетка, потребує погодження Валентиною.
// Рахуємо всі надані документи: прихований у галереї (спотворене прізвище на відновленому
// файлі) теж існує, тож входить у кількість.
const firstYear = Math.min(...certificates.map((item) => Number(item.date.slice(0, 4))));
const channels = contacts.channels.map((channel) => channel.label).join(', ');
// Українська множина: 1 документ, 2–4 документи, 5+ документів.
const documentsWord = (count: number): string => {
  const last = count % 10;
  const lastTwo = count % 100;
  if (last === 1 && lastTwo !== 11) return 'документ';
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return 'документи';
  return 'документів';
};

export const advantagesContent = {
  eyebrow: 'Переваги',
  title: 'Чому саме я',
} as const;

// Досвід рахуємо від першого диплома (найраніший документ) — підтверджено користувачем.
const experienceSince = [...certificates].map((item) => item.date).sort()[0] ?? '2022-10-30';

// Повних років між двома ISO-датами (YYYY-MM-DD).
const fullYearsBetween = (from: string, to: string): number => {
  const years = Number(to.slice(0, 4)) - Number(from.slice(0, 4));
  return to.slice(5) < from.slice(5) ? years - 1 : years;
};

// Українська множина: 1 рік, 2–4 роки, 5+ років.
const yearsWord = (count: number): string => {
  const last = count % 10;
  const lastTwo = count % 100;
  if (last === 1 && lastTwo !== 11) return 'рік';
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return 'роки';
  return 'років';
};

/** Переваги на дату `today` (дата збірки з runtimeConfig, щоб SSR і клієнт збігалися). */
export const getAdvantages = (today: string): Advantage[] => {
  const years = fullYearsBetween(experienceSince, today);
  return [
    {
      id: 'experience',
      icon: 'experience',
      title: `${years} ${yearsWord(years)} досвіду`,
      text: `Працюю з масажем з ${experienceSince.slice(0, 4)} року й постійно поглиблюю знання.`,
    },
    {
      id: 'individual',
      icon: 'person',
      title: 'Індивідуальний підхід',
      text: 'Враховую ваші потреби, побажання та особливості організму — сеанс підлаштовується під вас.',
    },
    {
      id: 'learning',
      icon: 'learning',
      title: 'Постійне навчання',
      text: `Регулярно проходжу курси й майстер-класи: ${certificates.length} ${documentsWord(certificates.length)} про навчання з ${firstYear} року.`,
    },
    {
      id: 'range',
      icon: 'range',
      title: `${services.length} видів послуг`,
      text: 'Від загального й спортивного масажу до масажу обличчя, дитячого та вісцерального.',
    },
    {
      id: 'room',
      icon: 'room',
      title: 'Затишний кабінет',
      text: `Теплий простір для відпочинку: ${contacts.address}.`,
    },
    {
      id: 'booking',
      icon: 'booking',
      title: 'Зручний запис',
      text: `Телефон, ${channels} — дату, час і точне розташування кабінету узгоджуємо особисто.`,
    },
  ];
};
