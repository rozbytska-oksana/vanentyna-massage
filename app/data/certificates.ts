import type { Certificate } from '~/types/content';

// Документи Валентини, надані користувачем 20.11.2026 як AI-відновлені зображення
// (оригінали: assets-originals/certificates). Текст і дати переписано з документів.
// «Вісцеральна терапія»: прізвище написане «Нечипфенко» — так само й на оригінальному фото
// (перевірено користувачем 22.11.2026), тож це помилка в самому документі, а не AI-відновлення.
const certificateList: Certificate[] = [
  {
    id: 'probody-forum-lviv-2026',
    kind: 'Сертифікат учасниці',
    title: 'PROBODY Forum Lviv 2026',
    issuer: 'PROBODY Forum, Львів',
    date: '2026-06-27',
    dateLabel: '26–27 червня 2026',
    imageBase: 'images/certificates/2026-06-27-probody-forum-lviv',
    imageAlt: 'Сертифікат PROBODY Forum Lviv 2026 за активну участь у форумі, 26–27 червня 2026.',
    width: 1448,
    height: 1086,
    aiRestored: true,
    originalVerified: false,
    publicationApproved: true,
  },
  {
    id: 'manual-practices-acupuncture-2026',
    kind: 'Сертифікат',
    title: 'Мануальні практики: корекція та голкотерапія',
    issuer: 'Школа чарівників Світлани Сарасваті',
    date: '2026-03-15',
    dateLabel: '15 березня 2026',
    imageBase: 'images/certificates/2026-03-15-manual-practices-acupuncture',
    imageAlt:
      'Сертифікат про навчання за курсом «Мануальні практики: корекція та голкотерапія», 15 березня 2026.',
    width: 1086,
    height: 1448,
    aiRestored: true,
    originalVerified: false,
    publicationApproved: true,
  },
  {
    id: 'anticellulite-masterclass-2025',
    kind: 'Майстер-клас',
    title: 'Антицелюлітний масаж',
    issuer: 'Викладачка — Валентина Чернова-Токар',
    date: '2025-06-14',
    dateLabel: '14 червня 2025',
    imageBase: 'images/certificates/2025-06-14-anticellulite-masterclass',
    imageAlt:
      'Сертифікат про майстер-клас «Антицелюлітний масаж: обгортання, ток сен, інарі, блейди, кільце гуаша», 14 червня 2025.',
    width: 1448,
    height: 1086,
    aiRestored: true,
    originalVerified: false,
    publicationApproved: true,
  },
  {
    id: 'visceral-therapy-masterclass-2025',
    kind: 'Майстер-клас',
    title: 'Вісцеральна терапія (вісцеральний масаж)',
    issuer: 'Викладачка — Валентина Чернова-Токар',
    date: '2025-03-29',
    dateLabel: '29 березня 2025',
    imageBase: 'images/certificates/2025-03-29-visceral-therapy-masterclass',
    imageAlt:
      'Сертифікат про майстер-клас «Вісцеральна терапія (вісцеральний масаж)», 29 березня 2025.',
    width: 1448,
    height: 1086,
    aiRestored: true,
    originalVerified: false,
    publicationApproved: true,
  },
  {
    id: 'expert-x-facial-massage-ua-2023',
    kind: 'Сертифікат',
    title: 'Масаж обличчя',
    issuer: 'Міжнародний навчальний центр Expert X',
    date: '2023-03-18',
    dateLabel: '18 березня 2023',
    imageBase: 'images/certificates/2023-03-18-expert-x-facial-massage-ua',
    imageAlt:
      'Сертифікат Expert X про курс «Масаж обличчя» з відмінно складеним іспитом, 18 березня 2023.',
    width: 1448,
    height: 1086,
    aiRestored: true,
    originalVerified: false,
    publicationApproved: true,
  },
  {
    id: 'expert-x-facial-massage-en-2023',
    kind: 'Сертифікат англійською',
    title: 'Facial Massage',
    issuer: 'Expert X International Education Centre',
    date: '2023-03-18',
    dateLabel: '18 березня 2023',
    imageBase: 'images/certificates/2023-03-18-expert-x-facial-massage-en',
    imageAlt: 'Англомовний сертифікат Expert X про курс Facial Massage, 18 березня 2023.',
    width: 1448,
    height: 1086,
    aiRestored: true,
    originalVerified: false,
    publicationApproved: true,
  },
  {
    id: 'shliakh-do-uspikhu-diploma-2022',
    kind: 'Диплом',
    title: 'Майстер масажу-універсал',
    issuer: 'Навчально-кадровий центр «Шлях до успіху»',
    date: '2022-10-30',
    dateLabel: '30 жовтня 2022',
    imageBase: 'images/certificates/2022-10-30-shliakh-do-uspikhu-master-masazhu',
    imageAlt:
      'Диплом навчально-кадрового центру «Шлях до успіху» про авторський курс «Майстер масажу-універсал», 30 жовтня 2022.',
    width: 1448,
    height: 1086,
    aiRestored: true,
    originalVerified: false,
    publicationApproved: true,
  },
];

/** Від новіших до старіших; документи з однаковою датою зберігають порядок списку. */
export const certificates: readonly Certificate[] = [...certificateList].sort((a, b) =>
  b.date.localeCompare(a.date),
);

/** Показуються лише погоджені до публікації документи. */
export const publishedCertificates = certificates.filter(
  (certificate) => certificate.publicationApproved,
);
