import { aboutContent } from '~/data/about';
import { contacts, contactsContent } from '~/data/contacts';
import { services } from '~/data/services';

// Координати беремо з підтвердженого посилання на карту (фрагмент !3d<lat>!4d<lng>), а не вигадуємо.
const mapPoint = /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/.exec(contactsContent.mapUrl);

/**
 * JSON-LD для Google: картка місцевого бізнесу масажистки з послугами й цінами.
 * Лише факти із сайту (data/*): без годин роботи, рейтингів і відгуків-оцінок.
 * `siteUrl` — повна адреса головної сторінки зі скісною рискою в кінці.
 */
export const buildStructuredData = (siteUrl: string, imageUrl: string) => {
  const prices = services.map((service) => service.price);
  const businessId = `${siteUrl}#business`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HealthAndBeautyBusiness',
        '@id': businessId,
        name: `${aboutContent.name} — масаж`,
        description:
          'Масаж і мануальна терапія в Хорошеві: загальний, спортивний, дитячий, вісцеральний масаж, масаж обличчя та інші послуги.',
        url: siteUrl,
        image: imageUrl,
        telephone: contacts.phone,
        priceRange: `${Math.min(...prices)}–${Math.max(...prices)} грн`,
        currenciesAccepted: 'UAH',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Будинок культури',
          addressLocality: 'Хорошів',
          addressCountry: 'UA',
        },
        ...(mapPoint
          ? {
              geo: {
                '@type': 'GeoCoordinates',
                latitude: Number(mapPoint[1]),
                longitude: Number(mapPoint[2]),
              },
            }
          : {}),
        hasMap: contactsContent.mapUrl,
        sameAs: contacts.channels
          .filter((channel) => channel.href.startsWith('https://'))
          .map((channel) => channel.href),
        employee: {
          '@type': 'Person',
          name: aboutContent.name,
          jobTitle: aboutContent.role,
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Послуги та ціни',
          itemListElement: services.map((service) => ({
            '@type': 'Offer',
            price: service.price,
            priceCurrency: 'UAH',
            itemOffered: {
              '@type': 'Service',
              name: service.title,
              ...(service.description ? { description: service.description } : {}),
              provider: { '@id': businessId },
            },
          })),
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}#website`,
        url: siteUrl,
        name: aboutContent.name,
        inLanguage: 'uk',
        publisher: { '@id': businessId },
      },
    ],
  };
};
