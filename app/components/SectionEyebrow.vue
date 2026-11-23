<template>
  <p
    class="section-eyebrow"
    :style="{ '--plant-mark': `url('${assetBase}images/plant-mark.svg')` }"
  >
    <span
      class="section-eyebrow__ornament"
      aria-hidden="true"
    ></span>
    <span class="section-eyebrow__text"><slot /></span>
    <span
      class="section-eyebrow__ornament section-eyebrow__ornament--end"
      aria-hidden="true"
    ></span>
  </p>
</template>

<script setup lang="ts">
// Підпис секції з тонкими лініями й рослинним знаком із логотипа з обох боків.
const assetBase = useRuntimeConfig().app.baseURL;
</script>

<style scoped lang="scss">
@use '../assets/styles/breakpoints' as bp;

.section-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 100%;
  margin: 0 0 0.75rem;
  color: var(--color-text-muted);
  font-size: 1rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;

  @include bp.medium {
    gap: 1rem;
  }

  &__text {
    // Короткі підписи вміщуються в рядок; довгі (напр. професія) переносяться без переповнення.
    min-width: 0;
    text-wrap: balance;
    // Компенсує розрядку після останньої літери, щоб орнаменти стояли симетрично.
    margin-right: -0.18em;
  }

  &__ornament {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    gap: 0.375rem;

    @include bp.medium {
      gap: 0.5rem;
    }

    // Тонка лінія, що згасає назовні; на вузьких екранах коротшає.
    &::before {
      content: '';
      width: clamp(0.75rem, 6vw - 0.5rem, 3rem);
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--color-border-strong));
    }

    // Рослинний знак із логотипа (plant-mark.svg як маска) в акцентному кольорі.
    &::after {
      content: '';
      width: 1.125rem;
      aspect-ratio: 240 / 140;
      background: var(--color-accent);
      opacity: 0.75;
      mask: var(--plant-mark) center / contain no-repeat;
    }

    &--end {
      flex-direction: row-reverse;

      &::before {
        background: linear-gradient(270deg, transparent, var(--color-border-strong));
        transform-origin: left center;
      }
    }
  }

  // Після появи підпису (клас від useTextReveal) лінії «малюються» від знака назовні,
  // а знак м’яко проявляється. Без JS чи з reduced motion орнамент одразу видимий.
  @media (prefers-reduced-motion: no-preference) {
    &.is-revealed &__ornament::before {
      animation: section-eyebrow-line 1200ms var(--menu-easing) 250ms backwards;
    }

    &.is-revealed &__ornament::after {
      animation: section-eyebrow-mark 900ms ease 150ms backwards;
    }
  }

  &__ornament:not(&__ornament--end)::before {
    transform-origin: right center;
  }
}

@keyframes section-eyebrow-line {
  from {
    transform: scaleX(0);
  }
}

@keyframes section-eyebrow-mark {
  from {
    opacity: 0;
    transform: scale(0.6) rotate(-12deg);
  }
}
</style>
