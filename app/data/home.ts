export const headerContent = {
  homeLabel: 'Валентина Нечипоренко — на головну',
  brandName: 'Валентина Нечипоренко',
  brandTagline: 'Масаж · Хорошів',
  navigationLabel: 'Головна навігація',
  menuLabel: 'Відкрити меню',
  closeLabel: 'Закрити меню',
  soonLabel: 'готується',
  backToTopLabel: 'Нагору',
  bookingLabel: 'Записатися',
  navigation: [
    { id: 'services', label: 'Послуги', href: '#services' },
    { id: 'about', label: 'Про мене', href: '#about' },
    // Розділів відео й відгуків ще немає: пункти показуються з позначкою «готується», без посилань.
    { id: 'video', label: 'Відео', href: null },
    { id: 'reviews', label: 'Відгуки', href: null },
    { id: 'contacts', label: 'Контакти', href: '#contacts' },
  ],
} as const;

export const heroContent = {
  eyebrow: 'Масаж у Хорошеві',
  title: ['Масаж із турботою', 'про вас.'],
  description:
    'Допомагаю розслабитися та приділити час своєму тілу. З увагою до ваших потреб і комфорту.',
  bookingLabel: 'Записатися на масаж',
  image: {
    desktop: 'images/studio-hero-clarity-v1-1672.jpg',
    medium: 'images/studio-hero-clarity-v1-1280.jpg',
    mobile: 'images/studio-hero-clarity-v1-mobile-706.jpg',
    width: 1672,
    height: 941,
    mobileWidth: 706,
    mobileHeight: 941,
    alt: 'Масажний кабінет із кушеткою, бежевими рушниками та теплою гірляндою.',
  },
} as const;

export const bookingContent = {
  title: 'Запис на масаж',
  description: 'Оберіть зручний спосіб зв’язку, щоб обговорити ваш візит.',
  note: 'Дату, час і точне розташування кабінету ви узгоджуєте з Валентиною особисто.',
  closeLabel: 'Закрити',
} as const;
