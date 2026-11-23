import type { ContactDetails } from '~/types/content';

export const contacts = {
  phone: '+380689046643',
  email: null,
  address: 'Хорошів, Будинок культури',
  channels: [
    {
      id: 'instagram',
      label: 'Instagram',
      href: 'https://www.instagram.com/massage.valentyna.khoroshiv?bqrl=MWw3amlzc3BqZml0',
    },
    {
      id: 'facebook',
      label: 'Facebook',
      href: 'https://www.facebook.com/share/1CVYRKLabq/?mibextid=wwXIfr',
    },
    { id: 'viber', label: 'Viber', href: 'viber://chat?number=%2B380689046643' },
  ],
} satisfies ContactDetails;

export const contactsContent = {
  title: 'Знайдіть час для себе',
  image: {
    desktop: 'images/contacts/background-candles-v2',
    mobile: 'images/contacts/background-v1-mobile',
    width: 768,
    height: 960,
  },
  mapUrl:
    'https://www.google.com/maps/place/Районний+будинок+культури/@50.5956426,28.4432297,17z/data=!3m1!4b1!4m6!3m5!1s0x472bf7006fdfdd57:0x7ff07e28f0037ce6!8m2!3d50.5956426!4d28.4458046!16s%2Fg%2F11yqmwn5dr',
  phoneLabel: '+380 68 904 66 43',
  bookingLabel: 'Записатися',
  note: 'Дату, час і точне розташування кабінету ви узгоджуєте з Валентиною особисто.',
  channelsLabel: 'Канали зв’язку',
  callLabel: 'Зателефонувати',
} as const;

export const footerContent = {
  creditLabel: 'Created by Oksana',
  creditUrl: 'https://www.linkedin.com/in/oksana-rozbytska-4a29291a2/',
} as const;
