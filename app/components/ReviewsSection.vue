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
      @cancel.prevent="close"
      @close="restore"
      @click="backdrop"
      @keydown.left.prevent="navigate(-1)"
      @keydown.right.prevent="navigate(1)"
    >
      <!-- Як у сертифікатах: зображення на всю панель, хрестик зверху, стрілки по центру. -->
      <picture
        v-if="active"
        ref="expanded"
        class="reviews__expanded"
        :style="[{ '--review-ratio': active.width / active.height }, swipeStyle]"
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
          draggable="false"
        />
      </picture>
      <button
        class="reviews__close"
        type="button"
        autofocus
        :aria-label="reviewsContent.closeLabel"
        @click="close"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      </button>
      <button
        class="reviews__modal-nav reviews__modal-nav--previous"
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
      <button
        class="reviews__modal-nav reviews__modal-nav--next"
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
    </dialog>
  </section>
</template>

<script setup lang="ts">
import emblaCarouselVue from 'embla-carousel-vue';
import { reviews, reviewsContent } from '~/data/reviews';
import type { Review } from '~/types/content';

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
const expanded = ref<HTMLElement | null>(null);
const activeIndex = ref(0);
const active = ref<Review | null>(null);
let trigger: HTMLElement | null = null;
let disposed = false;
let closing = false;
let animation: Animation | null = null;
// Відкриття «з картки» й закриття — як у сертифікатів.
const open = async (event: MouseEvent, index: number): Promise<void> => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !dialog.value) return;
  event.preventDefault();
  if (dialog.value.open) return;
  trigger = event.currentTarget as HTMLElement;
  const origin = trigger.getBoundingClientRect();
  activeIndex.value = index;
  active.value = items[index] ?? null;
  await nextTick();
  if (disposed || !dialog.value) return;
  dialog.value.showModal();
  const target = dialog.value.getBoundingClientRect();
  if (!reduced.value)
    animation = dialog.value.animate(
      [
        {
          opacity: 0,
          transform: `translate(${origin.x + origin.width / 2 - target.x - target.width / 2}px, ${origin.y + origin.height / 2 - target.y - target.height / 2}px) scale(.3)`,
        },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 560, easing: 'cubic-bezier(.22,1,.36,1)' },
    );
};
const restore = (): void => {
  active.value = null;
  trigger?.focus({ preventScroll: true });
  trigger = null;
  closing = false;
};
const navigate = (direction: number): void => {
  if (!active.value || closing) return;
  activeIndex.value = (activeIndex.value + direction + items.length) % items.length;
  active.value = items[activeIndex.value] ?? null;
  api.value?.scrollTo(activeIndex.value, reduced.value);
  slideIn(direction);
};
// Свайп ліворуч / праворуч: дотик або перетягування мишею.
const { slideIn, swipeStyle } = useSwipeNavigation(expanded, (direction) => navigate(direction));
const close = async (): Promise<void> => {
  if (!dialog.value?.open || closing) return;
  closing = true;
  animation?.cancel();
  if (!reduced.value) {
    animation = dialog.value.animate(
      [
        { opacity: 1, transform: 'none' },
        { opacity: 0, transform: 'translateY(12px) scale(.96)' },
      ],
      { duration: 230, easing: 'ease-in', fill: 'forwards' },
    );
    await animation.finished.catch(() => {});
  }
  dialog.value?.close();
  animation?.cancel();
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
    void close();
};
onBeforeUnmount(() => {
  disposed = true;
  animation?.cancel();
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

  &__controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: var(--color-button);
  }

  &__controls > button,
  &__modal-nav,
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
    transition:
      background-color 350ms ease,
      color 350ms ease;
    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
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

  // Збільшений перегляд — у стилі діалогу сертифікатів: подвійна рамка, темніше тло,
  // хрестик справа зверху й стрілки по центру зображення, без нижньої панелі.
  &__dialog {
    width: max-content;
    max-width: calc(100vw - 2rem);
    max-height: calc(100dvh - 2rem);
    padding: 0;
    overflow: visible;
    border: 2px solid #c9a982;
    border-radius: 6px;
    background: var(--color-card);
    color: var(--color-text);
    box-shadow:
      inset 0 0 0 1px var(--color-button),
      0 24px 80px rgb(30 20 13 / 45%);

    &::backdrop {
      background: rgb(30 20 13 / 78%);
    }
  }

  &__expanded {
    position: relative;
    display: block;
    width: min(calc(100vw - 2rem - 4px), calc((100dvh - 2rem - 4px) * var(--review-ratio)));
    aspect-ratio: var(--review-ratio);
    // Горизонтальний рух іде в обробник свайпу; вертикальна прокрутка й зум — нативні.
    touch-action: pan-y pinch-zoom;
    cursor: grab;
    user-select: none;
    -webkit-user-select: none;
    transition:
      transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
      opacity 260ms ease;

    &:active {
      cursor: grabbing;
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }

    & img {
      display: block;
      width: 100%;
      height: 100%;
      border-radius: 3px;
      object-fit: contain;
    }
  }

  &__close {
    position: absolute;
    z-index: 1;
    top: 0.5rem;
    right: 0.5rem;
  }

  &__modal-nav {
    position: absolute;
    z-index: 1;
    top: 50%;
    transform: translateY(-50%);

    &--previous {
      left: 0.5rem;
    }

    &--next {
      right: 0.5rem;
    }
  }
}
</style>
