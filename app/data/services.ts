import type { Service } from '~/types/content';

export const servicesContent = {
  eyebrow: 'Оберіть свою турботу',
  title: 'Послуги та ціни',
  bookingLabel: 'Записатися',
  detailsLabel: 'Детальніше',
  collapseLabel: 'Згорнути',
  // Три ряди: одна колонка на mobile, дві на tablet.
  mobileVisibleCount: 3,
  tabletVisibleCount: 6,
  showAllLabel: 'Показати всі послуги',
  showLessLabel: 'Згорнути список',
} as const;

// Чернетка прайсу й описів із тексту Валентини. Усі записи потребують перевірки перед публікацією.
// `details` — розширені описи-чернетки, складені не Валентиною; потребують її погодження.
export const services: Service[] = [
  {
    id: 'full-body',
    slug: 'zahalnyi-masazh',
    title: 'Загальний масаж усього тіла',
    price: 500,
    description: 'Для загального розслаблення, зменшення м’язового напруження та турботи про тіло.',
    details:
      'Послідовне опрацювання спини, шиї, рук, ніг і стоп. Силу натиску узгоджуємо з вами на початку й під час сеансу.',
    image: 'images/services/full-body-massage-v3-960.jpg',
    imageAlt:
      'Ілюстрація: масажистка виконує масаж спини дорослої клієнтки в бежево-коричневому кабінеті.',
    imageWidth: 960,
    imageHeight: 720,
    imageSources: [
      { path: 'images/services/full-body-massage-v3-480.jpg', width: 480 },
      { path: 'images/services/full-body-massage-v3-960.jpg', width: 960 },
      { path: 'images/services/full-body-massage-v3-1448.jpg', width: 1448 },
    ],
    published: false,
  },
  {
    id: 'back',
    slug: 'masazh-spyny',
    title: 'Масаж спини',
    price: 300,
    description: 'Робота з м’язами спини, напруженням і відчуттям втоми.',
    details:
      'Увага до м’язів уздовж хребта, лопаток і попереку — особливо коли спина втомлюється від сидячої роботи чи фізичного навантаження.',
    image: 'images/services/back-closeup-male-v3-960.jpg',
    imageAlt: 'Ілюстрація: жіночі руки виконують масаж спини дорослого чоловіка крупним планом.',
    imageWidth: 960,
    imageHeight: 720,
    imageSources: [
      { path: 'images/services/back-closeup-male-v3-480.jpg', width: 480 },
      { path: 'images/services/back-closeup-male-v3-960.jpg', width: 960 },
      { path: 'images/services/back-closeup-male-v3-1448.jpg', width: 1448 },
    ],
    published: false,
  },
  {
    id: 'neck',
    slug: 'masazh-komirtsevoi-zony',
    title: 'Масаж комірцевої зони',
    price: 200,
    description: 'Опрацювання м’язів шиї, плечей та верхньої частини спини.',
    details:
      'Зона, де найчастіше збирається напруження від роботи за комп’ютером і телефоном. Можна обрати окремо або як доповнення до іншого масажу.',
    image: 'images/services/neck-massage-overhead-v3-960.jpg',
    imageAlt:
      'Ілюстрація: жіночі руки виконують масаж шиї та плечей клієнтки з волоссям у пучку, ракурс зверху.',
    imageWidth: 960,
    imageHeight: 720,
    imageSources: [
      { path: 'images/services/neck-massage-overhead-v3-480.jpg', width: 480 },
      { path: 'images/services/neck-massage-overhead-v3-960.jpg', width: 960 },
      { path: 'images/services/neck-massage-overhead-v3-1448.jpg', width: 1448 },
    ],
    published: false,
  },
  {
    id: 'children',
    slug: 'dytiachyi-masazh',
    title: 'Дитячий масаж',
    price: 250,
    description:
      'Індивідуальний підхід з урахуванням віку, особливостей дитини та рекомендацій фахівців.',
    details:
      'Сеанс у спокійному темпі, з урахуванням самопочуття й настрою дитини. Батьки можуть бути поруч.',
    image: 'images/services/children-still-life-v3-960.jpg',
    imageAlt: 'Ілюстрація: дерев’яний зайчик і кільце біля бежевих рушників у масажному кабінеті.',
    imageWidth: 960,
    imageHeight: 720,
    imageSources: [
      { path: 'images/services/children-still-life-v3-480.jpg', width: 480 },
      { path: 'images/services/children-still-life-v3-960.jpg', width: 960 },
      { path: 'images/services/children-still-life-v3-1448.jpg', width: 1448 },
    ],
    published: false,
  },
  {
    id: 'anticellulite-lymphatic',
    slug: 'antytseliulitnyi-limfodrenazhnyi-masazh',
    title: 'Антицелюлітний та лімфодренажний масаж',
    price: 600,
    description:
      'Робота з ділянками тіла для покращення зовнішнього вигляду шкіри. Лімфодренажні техніки — для підтримки лімфовідтоку та зменшення відчуття важкості.',
    details:
      'Інтенсивніші техніки на обраних ділянках поєднуються з м’якими лімфодренажними рухами. Кількість сеансів обговорюємо індивідуально.',
    image: 'images/services/anticellulite-lymphatic-room-v2-960.jpg',
    imageAlt: 'Ілюстрація: масажистка працює з гомілкою дорослої клієнтки.',
    imageWidth: 960,
    imageHeight: 720,
    imageSources: [
      { path: 'images/services/anticellulite-lymphatic-room-v2-480.jpg', width: 480 },
      { path: 'images/services/anticellulite-lymphatic-room-v2-960.jpg', width: 960 },
      { path: 'images/services/anticellulite-lymphatic-room-v2-1448.jpg', width: 1448 },
    ],
    published: false,
  },
  {
    id: 'sports',
    slug: 'sportyvnyi-masazh',
    title: 'Спортивний масаж',
    price: 600,
    description: 'Для людей, які займаються спортом і мають підвищене м’язове навантаження.',
    details:
      'Глибше опрацювання навантажених м’язів у період тренувань, перед змаганнями або для відновлення після них.',
    image: 'images/services/back-massage-720.jpg',
    imageAlt: 'Ілюстрація: масажистка робить масаж спини клієнту на кушетці в затишному кабінеті.',
    imageWidth: 720,
    imageHeight: 540,
    imageSources: [
      { path: 'images/services/back-massage-720.jpg', width: 720 },
      { path: 'images/services/back-massage-1448.webp', width: 1448 },
    ],
    published: false,
  },
  {
    id: 'face',
    slug: 'masazh-oblychchia',
    title: 'Масаж обличчя',
    price: 250,
    description:
      'Класичний, букальний, лімфодренажний, міофасціальний, ліфтинговий, скульптурний та щипковий масаж обличчя.',
    details:
      'Техніку чи їх поєднання підбираємо під ваш запит — від розслаблення до роботи з тонусом і рельєфом обличчя.',
    image: 'images/services/face-room-v2-960.jpg',
    imageAlt: 'Ілюстрація: масажистка виконує масаж обличчя дорослої клієнтки.',
    imageWidth: 960,
    imageHeight: 720,
    imageSources: [
      { path: 'images/services/face-room-v2-480.jpg', width: 480 },
      { path: 'images/services/face-room-v2-960.jpg', width: 960 },
      { path: 'images/services/face-room-v2-1448.jpg', width: 1448 },
    ],
    published: false,
  },
  {
    id: 'acupuncture',
    slug: 'holkoterapiia',
    title: 'Метод сухої голки з прогріванням',
    price: 700,
    description:
      'Додаткова методика роботи з м’язовими тригерними зонами за відповідними показаннями.',
    details:
      'Застосовується як доповнення до масажу після попередньої консультації та за відсутності протипоказань.',
    image: 'images/services/acupuncture-room-v2-960.jpg',
    imageAlt: 'Ілюстрація: запаковані процедурні голки на бежевій тканині поруч із рушниками.',
    imageWidth: 960,
    imageHeight: 720,
    imageSources: [
      { path: 'images/services/acupuncture-room-v2-480.jpg', width: 480 },
      { path: 'images/services/acupuncture-room-v2-960.jpg', width: 960 },
      { path: 'images/services/acupuncture-room-v2-1448.jpg', width: 1448 },
    ],
    published: false,
  },
  {
    id: 'visceral',
    slug: 'vistseralnyi-masazh-zhyvota',
    title: 'Вісцеральний масаж живота',
    price: 200,
    description:
      'Спеціальна техніка роботи з ділянкою живота за наявності показань та відсутності протипоказань.',
    details:
      'Делікатна робота руками через передню стінку живота. Перед сеансом обговорюємо показання та протипоказання.',
    image: 'images/services/visceral-massage-v3-mirrored-960.jpg',
    imageAlt: 'Ілюстрація: жіночі руки виконують масаж відкритої ділянки живота дорослої клієнтки.',
    imageWidth: 960,
    imageHeight: 720,
    imageSources: [
      { path: 'images/services/visceral-massage-v3-mirrored-480.jpg', width: 480 },
      { path: 'images/services/visceral-massage-v3-mirrored-960.jpg', width: 960 },
      { path: 'images/services/visceral-massage-v3-mirrored-1448.jpg', width: 1448 },
    ],
    published: false,
  },
];
