<template>
  <section
    id="advantages"
    ref="section"
    class="advantages"
    aria-labelledby="advantages-title"
    tabindex="-1"
  >
    <div class="advantages__inner">
      <header class="advantages__header">
        <SectionEyebrow data-text-reveal>{{ advantagesContent.eyebrow }}</SectionEyebrow>
        <h2
          id="advantages-title"
          class="advantages__title"
          data-text-reveal
        >
          {{ advantagesContent.title }}
        </h2>
      </header>
      <ul class="advantages__list">
        <li
          v-for="item in advantages"
          :key="item.id"
          class="advantages__item"
          data-text-reveal
        >
          <span class="advantages__icon">
            <AdvantageIcon :name="item.icon" />
          </span>
          <h3 class="advantages__name">
            <template v-if="item.count !== null">
              <span
                class="advantages__count"
                :data-advantage="item.id"
              >
                {{ displayed[item.id] ?? item.count }}
              </span>
              {{ item.rest }}
            </template>
            <template v-else>{{ item.title }}</template>
          </h3>
          <p class="advantages__text">{{ item.text }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { advantagesContent, getAdvantages } from '~/data/advantages';

const section = useTemplateRef<HTMLElement>('section');
// Число на початку заголовка («4 роки досвіду») виділяється для лічильника.
const advantages = getAdvantages(String(useRuntimeConfig().public.buildDate)).map((item) => {
  const match = /^(\d+)\s(.*)$/.exec(item.title);
  return { ...item, count: match ? Number(match[1]) : null, rest: match?.[2] ?? '' };
});
useTextReveal(section);

// Лічильник від 0 до числа при першій появі. У SSR, без JS і з reduced motion число одразу кінцеве.
const displayed = ref<Record<string, number>>({});
let counterObserver: IntersectionObserver | undefined;
const frames = new Set<number>();

const countUp = (id: string, target: number): void => {
  const duration = 1200;
  const startedAt = performance.now();
  const step = (now: number): void => {
    const progress = Math.min((now - startedAt) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    displayed.value = { ...displayed.value, [id]: Math.round(target * eased) };
    if (progress < 1) frames.add(requestAnimationFrame(step));
  };
  displayed.value = { ...displayed.value, [id]: 0 };
  frames.add(requestAnimationFrame(step));
};

onMounted(() => {
  if (
    !section.value ||
    typeof window.IntersectionObserver !== 'function' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }
  counterObserver = new IntersectionObserver(
    (entries) => {
      entries
        .filter((entry) => entry.isIntersecting)
        .forEach((entry) => {
          counterObserver?.unobserve(entry.target);
          const id = (entry.target as HTMLElement).dataset.advantage;
          const item = advantages.find((advantage) => advantage.id === id);
          if (item?.count) countUp(item.id, item.count);
        });
    },
    { threshold: 0.6 },
  );
  section.value
    .querySelectorAll<HTMLElement>('.advantages__count')
    .forEach((element) => counterObserver?.observe(element));
});

onBeforeUnmount(() => {
  counterObserver?.disconnect();
  frames.forEach((frame) => cancelAnimationFrame(frame));
  frames.clear();
});
</script>

<style scoped lang="scss">
@use '../assets/styles/breakpoints' as bp;

.advantages {
  padding-block: clamp(2.5rem, 5vw, 4.5rem);
  font-family: var(--font-hero-body);

  &__inner {
    width: min(100% - 2 * var(--space-page), var(--container-content));
    margin-inline: auto;
  }

  &__header {
    margin-bottom: clamp(2rem, 4vw, 3rem);
    text-align: center;
  }

  &__title {
    margin: 0;
    font-family: var(--font-hero-heading);
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 500;
    line-height: 1.1;
  }

  // Сітка з тонкими лініями над кожною перевагою — у ритмі прайс-листа послуг.
  &__list {
    display: grid;
    gap: 2rem;
    margin: 0;
    padding: 0;
    list-style: none;

    @include bp.medium {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 2.5rem clamp(1.5rem, 4vw, 3rem);
    }

    @include bp.x-large {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  // Текст починається зверху, на рівні верхнього краю іконки; рядок заголовка — лише його висота.
  &__item {
    display: grid;
    grid-template-rows: auto 1fr;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 0.5rem 1.25rem;
    align-items: start;
    padding-top: 1.75rem;
    border-top: 1px solid var(--color-border-strong);

    // Перший ряд без лінії зверху: 1 / 2 / 3 пункти залежно від кількості колонок.
    &:first-child {
      padding-top: 0;
      border-top: 0;
    }

    @include bp.medium {
      &:nth-child(-n + 2) {
        padding-top: 0;
        border-top: 0;
      }
    }

    @include bp.x-large {
      &:nth-child(-n + 3) {
        padding-top: 0;
        border-top: 0;
      }
    }
  }

  // Іконка в тонкому коричневому колі.
  &__icon {
    display: grid;
    grid-row: 1 / span 2;
    width: 3.5rem;
    height: 3.5rem;
    place-items: center;
    border: 1px solid var(--color-button);
    border-radius: 50%;
    color: var(--color-button);

    @media (prefers-reduced-motion: no-preference) {
      transition: transform 500ms var(--menu-easing);
    }
  }

  // При наведенні на перевагу іконка плавно збільшується.
  @media (hover: hover) and (prefers-reduced-motion: no-preference) {
    &__item:hover &__icon {
      transform: scale(1.12);
    }
  }

  &__name {
    grid-row: 1;
    margin: 0;
    font-family: var(--font-hero-heading);
    font-size: clamp(1.5rem, 2.2vw, 1.75rem);
    font-weight: 500;
    line-height: 1.15;
  }

  // Цифри однакової ширини, щоб заголовок не «стрибав» під час лічби.
  &__count {
    font-variant-numeric: tabular-nums lining-nums;
  }

  &__text {
    grid-column: 2;
    margin: 0;
    color: var(--color-text-muted);
    font-size: 1rem;
    line-height: 1.65;
  }
}
</style>
