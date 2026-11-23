<template>
  <section
    v-if="items.length"
    id="reviews"
    ref="section"
    class="reviews"
    aria-labelledby="reviews-title"
    tabindex="-1"
  >
    <div class="reviews__inner">
      <header class="reviews__heading">
        <SectionEyebrow data-text-reveal>{{ reviewsContent.eyebrow }}</SectionEyebrow>
        <h2
          id="reviews-title"
          class="reviews__title"
          data-text-reveal
        >
          {{ reviewsContent.title }}
        </h2>
      </header>
      <div
        ref="viewport"
        class="reviews__viewport"
        data-text-reveal="zoom"
        :class="{ 'reviews__viewport--ready': api }"
        role="group"
        :aria-label="reviewsContent.galleryLabel"
      >
        <div class="reviews__track">
          <figure
            v-for="(item, index) in items"
            :key="item.id"
            class="reviews__slide"
            :class="{ 'reviews__slide--active': selected === index }"
          >
            <a
              class="reviews__frame"
              :href="`${baseURL}${item.imageBase}-1320.webp`"
              :aria-label="`${reviewsContent.viewLabel} ${index + 1}`"
              draggable="false"
              @click="open($event, index)"
            >
              <picture>
                <source
                  type="image/avif"
                  :srcset="sources(item, 'avif')"
                  :sizes="sizes"
                />
                <img
                  :src="`${baseURL}${item.imageBase}-800.webp`"
                  :srcset="sources(item, 'webp')"
                  :sizes="sizes"
                  :alt="item.imageAlt"
                  :width="item.width"
                  :height="item.height"
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                />
              </picture>
            </a>
            <figcaption
              v-if="item.text"
              class="reviews__transcript"
            >
              {{ item.text }}
            </figcaption>
          </figure>
        </div>
      </div>
      <div
        v-if="items.length > 1"
        class="reviews__controls"
        role="group"
        :aria-label="reviewsContent.controlsLabel"
      >
        <button
          type="button"
          :aria-label="reviewsContent.previousLabel"
          :disabled="!canPrevious"
          @click="api?.scrollPrev(reduced)"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="m14 6-6 6 6 6" />
          </svg>
        </button>
        <div class="reviews__dots">
          <button
            v-for="(_, index) in snaps"
            :key="index"
            type="button"
            :aria-label="`${reviewsContent.dotLabel} ${index + 1}`"
            :aria-current="selected === index ? 'true' : undefined"
            @click="api?.scrollTo(index, reduced)"
          >
            <span />
          </button>
        </div>
        <button
          type="button"
          :aria-label="reviewsContent.nextLabel"
          :disabled="!canNext"
          @click="api?.scrollNext(reduced)"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="m10 6 6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
    <dialog
      ref="dialog"
      class="reviews__dialog"
      :aria-label="`${reviewsContent.dotLabel} ${activeIndex + 1}`"
      @close="restore"
      @click="backdrop"
      @keydown.left.prevent="navigate(-1)"
      @keydown.right.prevent="navigate(1)"
    >
      <picture
        v-if="active"
        class="reviews__expanded"
        @pointerdown="swipeStart"
        @pointerup="swipeEnd"
        @pointercancel="swipe = null"
      >
        <source
          type="image/avif"
          :srcset="`${baseURL}${active.imageBase}-1320.avif`"
        />
        <img
          :src="`${baseURL}${active.imageBase}-1320.webp`"
          :alt="active.imageAlt"
          :width="active.width"
          :height="active.height"
        />
      </picture>
      <button
        class="reviews__close"
        type="button"
        autofocus
        :aria-label="reviewsContent.closeLabel"
        @click="dialog?.close()"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      </button>
      <div class="reviews__modal-controls">
        <button
          type="button"
          :aria-label="reviewsContent.previousLabel"
          @click="navigate(-1)"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="m14 6-6 6 6 6" />
          </svg>
        </button>
        <span aria-live="polite">{{ activeIndex + 1 }} / {{ items.length }}</span>
        <button
          type="button"
          :aria-label="reviewsContent.nextLabel"
          @click="navigate(1)"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="m10 6 6 6-6 6" />
          </svg>
        </button>
      </div>
    </dialog>
  </section>
</template>

<script setup lang="ts">
import emblaCarouselVue from 'embla-carousel-vue';
import { reviews, reviewsContent } from '~/data/reviews';
import type { Review } from '~/types/content';
import { swipeDirection } from '~/utils/swipeDirection';

const items = reviews.filter((item) => item.publicationApproved);
const baseURL = useRuntimeConfig().app.baseURL;
const reduced = useReducedMotion();
const section = useTemplateRef<HTMLElement>('section');
useTextReveal(section);
// Поведінка як у Vipet: center + loop, swipe, без autoplay, нативний scroll без JS.
const [viewport, api] = emblaCarouselVue(
  computed(() => ({
    align: 'center' as const,
    loop: true,
    skipSnaps: true,
    duration: reduced.value ? 0 : 35,
  })),
);
useCarouselImages(viewport);
const selected = ref(0);
const snaps = ref<number[]>([]);
const canPrevious = ref(false);
const canNext = ref(false);
const update = (): void => {
  selected.value = api.value?.selectedScrollSnap() ?? 0;
  snaps.value = api.value?.scrollSnapList() ?? [];
  canPrevious.value = api.value?.canScrollPrev() ?? false;
  canNext.value = api.value?.canScrollNext() ?? false;
};
watch(api, (value, previous) => {
  previous?.off('select', update).off('reInit', update);
  value?.on('select', update).on('reInit', update);
  update();
});
const sizes =
  '(min-width: 1200px) min(calc((100vw - 12rem) / 5), 221px), (min-width: 768px) calc((100vw - clamp(2rem, 8vw, 6rem) - 3rem) / 3), 78vw';
const sources = (item: Review, format: 'avif' | 'webp'): string =>
  [480, 800].map((width) => `${baseURL}${item.imageBase}-${width}.${format} ${width}w`).join(', ');
const dialog = useTemplateRef<HTMLDialogElement>('dialog');
const activeIndex = ref(0);
const active = ref<Review | null>(null);
let trigger: HTMLElement | null = null;
let disposed = false;
const open = async (event: MouseEvent, index: number): Promise<void> => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !dialog.value) return;
  event.preventDefault();
  trigger = event.currentTarget as HTMLElement;
  activeIndex.value = index;
  active.value = items[index] ?? null;
  await nextTick();
  if (!disposed) dialog.value?.showModal();
};
const restore = (): void => {
  active.value = null;
  trigger?.focus({ preventScroll: true });
  trigger = null;
};
const navigate = (direction: number): void => {
  activeIndex.value = (activeIndex.value + direction + items.length) % items.length;
  active.value = items[activeIndex.value] ?? null;
  api.value?.scrollTo(activeIndex.value, reduced.value);
};
const backdrop = (event: MouseEvent): void => {
  if (!dialog.value || event.target !== dialog.value) return;
  const r = dialog.value.getBoundingClientRect();
  if (
    event.clientX < r.left ||
    event.clientX > r.right ||
    event.clientY < r.top ||
    event.clientY > r.bottom
  )
    dialog.value.close();
};
let swipe: { id: number; x: number; y: number } | null = null;
const swipeStart = (event: PointerEvent): void => {
  if (event.pointerType !== 'mouse' && event.isPrimary)
    swipe = { id: event.pointerId, x: event.clientX, y: event.clientY };
};
const swipeEnd = (event: PointerEvent): void => {
  if (!swipe || event.pointerId !== swipe.id) return;
  const direction = swipeDirection(
    event.clientX - swipe.x,
    event.clientY - swipe.y,
    window.visualViewport?.scale ?? 1,
  );
  swipe = null;
  if (direction) navigate(direction);
};
onBeforeUnmount(() => {
  disposed = true;
  api.value?.off('select', update).off('reInit', update);
  if (dialog.value?.open) dialog.value.close();
});
</script>

<style scoped lang="scss">
@use '../assets/styles/breakpoints' as bp;

.reviews {
  padding-block: clamp(1.5rem, 3vw, 2.5rem) clamp(1rem, 2vw, 1.5rem);
  font-family: var(--font-hero-body);
  scroll-margin-block-start: var(--space-md);

  &__inner {
    width: min(100% - 2 * var(--space-page), var(--container-content));
    margin-inline: auto;
  }

  &__heading {
    text-align: center;
  }

  &__title {
    margin: 0;
    font-family: var(--font-hero-heading);
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 500;
    line-height: 1.08;
    text-wrap: balance;
  }

  &__viewport {
    overflow-x: auto;
    padding-block: 1rem;
    margin-block: 0.25rem 0;
    scrollbar-width: thin;
    &--ready {
      overflow: hidden;
    }
  }

  &__track {
    display: flex;
    touch-action: pan-y pinch-zoom;
  }

  &__slide {
    flex: 0 0 82%;
    min-width: 0;
    margin: 0 1.5rem 0 0;
    position: relative;
    @include bp.medium {
      flex-basis: calc((100% - 3rem) / 3);
    }
    @include bp.x-large {
      flex-basis: calc((100% - 6rem) / 5);
    }
  }

  &__frame {
    display: block;
    aspect-ratio: 1320 / 2346;
    overflow: hidden;
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-md);
    background: var(--color-card);
    transform: scale(0.96);
    transition: transform 600ms cubic-bezier(0.22, 1, 0.36, 1);
    @media (prefers-reduced-motion: reduce) {
      transform: none;
      transition: none;
    }
    & picture {
      display: block;
      width: 100%;
      height: 100%;
    }
    & img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  &__slide--active &__frame {
    transform: scale(1.02);
    @media (prefers-reduced-motion: reduce) {
      transform: none;
    }
  }

  &__transcript {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  &__controls,
  &__modal-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: var(--color-button);
  }

  &__controls > button,
  &__modal-controls button,
  &__close {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    border: 1px solid var(--color-button);
    border-radius: 50%;
    background: var(--color-content-background);
    color: var(--color-button);
    @media (hover: hover) {
      &:hover:not(:disabled) {
        background: var(--color-button);
        color: var(--color-button-text);
      }
    }
    &:disabled {
      opacity: 0.4;
    }
  }

  & svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  &__dots {
    display: flex;
    & button {
      display: grid;
      place-items: center;
      width: 26px;
      height: 44px;
      padding: 0;
      border: 0;
      background: transparent;
      color: var(--color-button);
      & span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
        opacity: 0.35;
      }
      &[aria-current] span {
        opacity: 1;
      }
    }
  }

  &__dialog {
    width: min(calc(100vw - 2rem), calc(80svh * 1320 / 2346));
    max-width: calc(100vw - 2rem);
    max-height: calc(100svh - 2rem);
    padding: 0;
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-md);
    background: var(--color-card);
    color: var(--color-text);
    &::backdrop {
      background: rgb(30 20 13 / 75%);
    }
  }

  &__expanded {
    display: block;
    touch-action: pan-y pinch-zoom;
    & img {
      width: 100%;
      height: auto;
    }
  }

  &__close {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
  }
  &__modal-controls {
    padding: 0.5rem;
  }
}
</style>
