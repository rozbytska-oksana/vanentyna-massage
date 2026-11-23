<template>
  <section
    id="faq"
    ref="section"
    class="faq"
    aria-labelledby="faq-title"
    tabindex="-1"
  >
    <div class="faq__inner">
      <header class="faq__header">
        <SectionEyebrow data-text-reveal>{{ faqContent.eyebrow }}</SectionEyebrow>
        <h2
          id="faq-title"
          class="faq__title"
          data-text-reveal
        >
          {{ faqContent.title }}
        </h2>
      </header>
      <div class="faq__list">
        <!-- Нативний details: працює без JS, з клавіатури й у пошуку по сторінці. -->
        <details
          v-for="item in faqItems"
          :key="item.id"
          class="faq__item"
          data-text-reveal
          name="faq"
        >
          <summary class="faq__question">
            <span>{{ item.question }}</span>
            <svg
              class="faq__icon"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                class="faq__icon-vertical"
                d="M10 4v12"
                stroke="currentColor"
                stroke-width="1.25"
                stroke-linecap="round"
              />
              <path
                d="M4 10h12"
                stroke="currentColor"
                stroke-width="1.25"
                stroke-linecap="round"
              />
            </svg>
          </summary>
          <div class="faq__body">
            <p class="faq__answer">{{ item.answer }}</p>
            <p
              v-if="item.note"
              class="faq__note"
            >
              {{ item.note }}
            </p>
          </div>
        </details>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { faqContent, faqItems } from '~/data/content';

const section = useTemplateRef<HTMLElement>('section');
useTextReveal(section);
</script>

<style scoped lang="scss">
.faq {
  --faq-duration: 360ms;

  padding-block: var(--space-section);
  padding-block-start: clamp(1.5rem, 3vw, 2.5rem);
  font-family: var(--font-hero-body);
  // Дозволяє плавно анімувати висоту до auto там, де браузер це підтримує.
  interpolate-size: allow-keywords;
  scroll-margin-block-start: var(--space-md);

  @media (prefers-reduced-motion: reduce) {
    --faq-duration: 0ms;
  }

  // Заголовок зверху по центру (як у «Послуги та ціни»), запитання — під ним у вужчій колонці.
  &__inner {
    width: min(100% - 2 * var(--space-page), 56rem);
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

  &__list {
    border-top: 1px solid var(--color-border);
  }

  &__item {
    border-bottom: 1px solid var(--color-border);

    &::details-content {
      block-size: 0;
      overflow-y: clip;
      transition:
        block-size var(--faq-duration) var(--menu-easing),
        content-visibility var(--faq-duration) allow-discrete;
    }

    &[open]::details-content {
      block-size: auto;
    }

    &[open] .faq__icon-vertical {
      transform: scaleY(0);
    }
  }

  &__question {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    min-height: 3rem;
    padding-block: 1.25rem;
    font-family: var(--font-hero-heading);
    font-size: clamp(1.375rem, 2.2vw, 1.75rem);
    font-weight: 500;
    line-height: 1.2;
    cursor: pointer;
    list-style: none;

    transition: color 300ms ease;

    &::-webkit-details-marker {
      display: none;
    }

    @media (hover: hover) {
      &:hover {
        color: var(--color-button);
      }
    }

    &:focus-visible {
      outline-offset: 2px;
    }
  }

  &__icon {
    flex-shrink: 0;
    color: var(--color-accent);
  }

  &__icon-vertical {
    transform-origin: center;
    transition: transform var(--faq-duration) var(--menu-easing);
  }

  &__body {
    max-width: 42rem;
    padding-bottom: 1.5rem;
  }

  @media (prefers-reduced-motion: no-preference) {
    &__item[open] &__body {
      animation: faq-body-in 520ms var(--menu-easing) 80ms backwards;
    }
  }

  &__answer {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 1.0625rem;
    line-height: 1.7;
  }

  // Застереження відокремлене тонкою лінією зліва й трохи дрібнішим шрифтом.
  &__note {
    margin: 1rem 0 0;
    padding-left: 1rem;
    border-left: 2px solid var(--color-border-strong);
    color: var(--color-text);
    font-size: 0.9375rem;
    line-height: 1.6;
  }
}

@keyframes faq-body-in {
  from {
    opacity: 0;
    transform: translateY(-0.5rem);
  }
}
</style>
