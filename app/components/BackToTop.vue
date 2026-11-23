<template>
  <button
    class="back-to-top"
    :class="{ 'back-to-top--visible': visible }"
    type="button"
    :aria-label="headerContent.backToTopLabel"
    @click="scrollToTop"
  >
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 19V5M6 11l6-6 6 6"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { headerContent } from '~/data/home';

// Кнопка з’являється після невеликої прокрутки й плавно повертає нагору сторінки.
const threshold = 600;
const visible = ref(false);
let frame = 0;

const update = (): void => {
  frame = 0;
  visible.value = window.scrollY > threshold;
};

const onScroll = (): void => {
  if (!frame) frame = window.requestAnimationFrame(update);
};

const scrollToTop = (): void => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  // Кнопка зникне, тож фокус переходить на логотип у хедері, а не губиться.
  document.querySelector<HTMLElement>('.site-header__inner a')?.focus({ preventScroll: true });
};

onMounted(() => {
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
  if (frame) window.cancelAnimationFrame(frame);
});
</script>

<style scoped lang="scss">
.back-to-top {
  --back-to-top-duration: 350ms;

  position: fixed;
  right: max(1rem, env(safe-area-inset-right));
  bottom: max(1rem, env(safe-area-inset-bottom));
  z-index: 5;
  display: grid;
  width: 3rem;
  height: 3rem;
  padding: 0;
  place-items: center;
  border: 1px solid var(--color-button);
  border-radius: 50%;
  background: var(--color-content-background);
  box-shadow: 0 0.5rem 1.25rem -0.75rem rgb(73 48 30 / 45%);
  color: var(--color-button);
  opacity: 0;
  visibility: hidden;
  transform: translateY(0.75rem);
  transition:
    opacity var(--back-to-top-duration) ease,
    transform var(--back-to-top-duration) ease,
    visibility 0s linear var(--back-to-top-duration),
    background-color var(--back-to-top-duration) ease,
    color var(--back-to-top-duration) ease;

  @media (prefers-reduced-motion: reduce) {
    --back-to-top-duration: 0ms;
  }

  // Прихована кнопка недоступна для фокуса (visibility: hidden), видима — плавно з’являється.
  &--visible {
    opacity: 1;
    visibility: visible;
    transform: none;
    transition:
      opacity var(--back-to-top-duration) ease,
      transform var(--back-to-top-duration) ease,
      visibility 0s,
      background-color var(--back-to-top-duration) ease,
      color var(--back-to-top-duration) ease;
  }

  @media (hover: hover) {
    &:hover {
      background: var(--color-button);
      color: var(--color-button-text);
    }
  }
}
</style>
