<template>
  <div class="certificates">
    <div
      ref="viewport"
      class="certificates__viewport"
      :class="{ 'certificates__viewport--ready': api }"
      role="group"
      :aria-label="certificatesContent.galleryLabel"
    >
      <div class="certificates__track">
        <figure
          v-for="(item, index) in certificates"
          :key="item.id"
          class="certificates__slide"
          :class="{
            'certificates__slide--landscape': item.width > item.height,
            'certificates__slide--active': selected === index,
          }"
        >
          <a
            :href="`${baseURL}${item.imageBase}-1448.webp`"
            class="certificates__frame"
            draggable="false"
            :aria-label="`${certificatesContent.viewLabel}: ${caption(item)}`"
            @click="open($event, item)"
          >
            <picture>
              <source
                type="image/avif"
                :srcset="sources(item, 'avif')"
                :sizes="sizes"
              />
              <source
                type="image/webp"
                :srcset="sources(item, 'webp')"
                :sizes="sizes"
              />
              <img
                :src="`${baseURL}${item.imageBase}-960.webp`"
                :alt="item.imageAlt"
                :width="item.width"
                :height="item.height"
                draggable="false"
                loading="lazy"
                fetchpriority="low"
                decoding="async"
              />
            </picture>
          </a>
        </figure>
      </div>
    </div>
    <div
      class="certificates__controls"
      role="group"
      :aria-label="certificatesContent.controlsLabel"
    >
      <button
        type="button"
        :aria-label="certificatesContent.previousSlidesLabel"
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
      <div
        class="certificates__dots"
        role="group"
        :aria-label="certificatesContent.dotsLabel"
      >
        <button
          v-for="(_, index) in snaps"
          :key="index"
          type="button"
          :aria-label="`${certificatesContent.dotLabel} ${index + 1}`"
          :aria-current="selected === index ? 'true' : undefined"
          @click="api?.scrollTo(index, reduced)"
        >
          <span />
        </button>
      </div>
      <button
        type="button"
        :aria-label="certificatesContent.nextSlidesLabel"
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
    <dialog
      ref="dialog"
      class="certificates__dialog"
      :aria-label="active ? caption(active) : certificatesContent.dialogLabel"
      @cancel.prevent="close"
      @close="restore"
      @click="backdrop"
      @keydown.left.prevent="navigate(-1)"
      @keydown.right.prevent="navigate(1)"
    >
      <figure
        v-if="active"
        ref="expanded"
        class="certificates__expanded"
        tabindex="-1"
        autofocus
        :style="[{ '--certificate-ratio': active.width / active.height }, swipeStyle]"
      >
        <img
          class="certificates__preview"
          :src="previewSrc || `${baseURL}${active.imageBase}-960.webp`"
          alt=""
          aria-hidden="true"
          :width="active.width"
          :height="active.height"
        />
        <picture :key="active.id">
          <source
            type="image/avif"
            :srcset="`${baseURL}${active.imageBase}-1448.avif`"
          />
          <img
            class="certificates__full"
            :class="{ 'certificates__full--ready': fullReady }"
            :src="`${baseURL}${active.imageBase}-1448.webp`"
            :alt="active.imageAlt"
            :width="active.width"
            :height="active.height"
            @load="fullReady = true"
          />
        </picture>
      </figure>
      <button
        class="certificates__close"
        type="button"
        :aria-label="certificatesContent.closeLabel"
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
        class="certificates__modal-nav certificates__modal-nav--previous"
        type="button"
        :aria-label="certificatesContent.previousLabel"
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
        class="certificates__modal-nav certificates__modal-nav--next"
        type="button"
        :aria-label="certificatesContent.nextLabel"
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
  </div>
</template>

<script setup lang="ts">
// Перенесено з vipet-grooming (CertificatesSection): Embla з центруванням і колом,
// збільшення «з картки» з миттєвим прев’ю, свайп у діалозі. Стиль — світлий, коричневі рамки.
import emblaCarouselVue from 'embla-carousel-vue';
import { certificatesContent } from '~/data/about';
import type { Certificate } from '~/types/content';
import { useCarouselImages } from '~/composables/useCarouselImages';
import { useReducedMotion } from '~/composables/useReducedMotion';

const props = defineProps<{ certificates: readonly Certificate[] }>();

const baseURL = useRuntimeConfig().app.baseURL;
const reduced = useReducedMotion();
const [viewport, api] = emblaCarouselVue(
  computed(() => ({
    align: 'center' as const,
    startIndex: 0,
    loop: true,
    skipSnaps: true,
    dragFree: false,
    duration: reduced.value ? 0 : 35,
  })),
);
useCarouselImages(viewport);
const selected = ref(0),
  snaps = ref<number[]>([]),
  canPrevious = ref(false),
  canNext = ref(false);
const update = () => {
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

const caption = (item: Certificate) => `${item.title}, ${item.dateLabel}`;
const sizes =
  '(min-width: 1200px) 12vw, (min-width: 768px) calc((100vw - clamp(2rem, 8vw, 6rem) - 4rem) / 5), calc((100vw - clamp(2rem, 8vw, 6rem) - 1.75rem) / 3)';
// Похідні вписані в квадрат за більшою стороною: ширина портретного документа менша.
const sources = (item: Certificate, format: 'avif' | 'webp') =>
  [480, 960]
    .map((box) => {
      const width = Math.round((box * item.width) / Math.max(item.width, item.height));
      return `${baseURL}${item.imageBase}-${box}.${format} ${width}w`;
    })
    .join(', ');

const dialog = ref<HTMLDialogElement | null>(null);
const fullReady = ref(false);
const active = ref<Certificate | null>(null);
// Прев’ю в діалозі — та сама мініатюра, яку вже завантажила карусель, тож вона з’являється
// миттєво, поки докачується повний розмір.
const previewSrc = ref('');
const loadedCardSrc = (index: number) =>
  viewport.value?.querySelectorAll<HTMLImageElement>('.certificates__slide img')[index]
    ?.currentSrc ?? '';
let trigger: HTMLElement | null = null,
  animation: Animation | null = null,
  disposed = false,
  closing = false;
const restore = () => {
  trigger?.focus({ preventScroll: true });
  trigger = null;
  closing = false;
};
const open = async (event: MouseEvent, item: Certificate) => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !dialog.value) return;
  event.preventDefault();
  if (dialog.value.open) return;
  trigger = event.currentTarget as HTMLElement;
  const origin = trigger.getBoundingClientRect();
  fullReady.value = false;
  previewSrc.value = loadedCardSrc(props.certificates.findIndex((entry) => entry.id === item.id));
  active.value = item;
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
const navigate = (direction: number) => {
  if (!active.value || closing) return;
  const total = props.certificates.length;
  const index = props.certificates.findIndex((item) => item.id === active.value?.id);
  const nextIndex = (index + direction + total) % total;
  fullReady.value = false;
  previewSrc.value = loadedCardSrc(nextIndex);
  active.value = props.certificates[nextIndex] ?? null;
  api.value?.scrollTo(nextIndex, reduced.value);
  slideIn(direction);
};
// Свайп ліворуч / праворуч у діалозі (дотик або перетягування мишею); кнопки й стрілки
// клавіатури лишаються основними.
const expanded = ref<HTMLElement | null>(null);
const { slideIn, swipeStyle } = useSwipeNavigation(expanded, (direction) => navigate(direction));
const close = async () => {
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
const backdrop = (event: MouseEvent) => {
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
watch(reduced, (value) => {
  if (value) animation?.finish();
});
onBeforeUnmount(() => {
  disposed = true;
  animation?.cancel();
  if (dialog.value?.open) {
    dialog.value.close();
    restore();
  }
  api.value?.off('select', update).off('reInit', update);
});
</script>

<style scoped lang="scss">
@use '../assets/styles/breakpoints' as bp;

.certificates {
  min-width: 0;

  &__viewport {
    overflow-x: auto;
    margin: -16px 0 -20px;
    padding: 32px 0;

    &--ready {
      overflow: hidden;
    }
  }

  &__track {
    display: flex;
    align-items: center;
    touch-action: pan-y pinch-zoom;
  }

  &__slide {
    // Статичний контекст накладання: зміна активного слайда лише переставляє шари.
    position: relative;
    z-index: 0;
    flex: 0 0 calc((100% - 1.75rem) / 3);
    min-width: 0;
    // Відступ із запасом на збільшення активного документа (×1.08), щоб рамки не торкалися.
    margin: 0 0.875rem 0 0;

    // На планшеті — п’ять документів; у вузькій desktop-колонці зберігаємо три.
    @include bp.medium {
      flex-basis: calc((100% - 4rem) / 5);
      margin-right: 1rem;
    }

    @include bp.x-large {
      flex-basis: calc((100% - 2rem) / 3);
    }

    &--active {
      z-index: 1;

      .certificates__frame {
        transform: scale(1.08);

        @media (prefers-reduced-motion: reduce) {
          transform: none;
        }
      }
    }
  }

  // Тонка коричнева «металева» рамка в стилі сайту замість золотої.
  &__frame {
    display: block;
    width: 100%;
    margin-inline: auto;
    padding: 2px;
    border-radius: 10px;
    background: linear-gradient(135deg, #7a5638, #c9a982 26%, #8b6a3f 50%, #d6bc98 76%, #674532);
    box-shadow: 0 9px 22px rgb(73 48 30 / 28%);
    transform: scale(0.98);
    transition: transform 600ms cubic-bezier(0.22, 1, 0.36, 1);

    // Постійні шари: перемикання will-change після свайпу перемальовувало тіні й гальмувало.
    @media (prefers-reduced-motion: no-preference) {
      will-change: transform;
    }

    @media (prefers-reduced-motion: reduce) {
      transform: none;
      transition: none;
    }

    &:focus-visible {
      outline-offset: 4px;
    }
  }

  &__frame picture {
    display: block;
    overflow: hidden;
    border: 1px solid var(--color-button);
    border-radius: 8px;
    background: var(--color-card);
  }

  // Усі документи на всю ширину слайда, тож відстані між рамками однакові;
  // вертикальний сертифікат просто вищий за горизонтальні.
  &__frame img {
    display: block;
    width: 100%;
    height: auto;
  }

  &__controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 1rem;
    color: var(--color-button);
  }

  &__controls button,
  &__close,
  &__modal-nav {
    display: grid;
    width: 44px;
    height: 44px;
    place-items: center;
    border: 1px solid var(--color-button);
    border-radius: 50%;
    background: var(--color-content-background);
    color: var(--color-button);
  }

  // Круглі кнопки поводяться як бежеві кнопки сайту: плавно заливаються коричневим.
  &__controls > button,
  &__close,
  &__modal-nav {
    transition:
      background-color 350ms ease,
      color 350ms ease,
      opacity 350ms ease;

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  }

  @media (hover: hover) {
    &__controls > button:hover:not(:disabled),
    &__close:hover,
    &__modal-nav:hover {
      background: var(--color-button);
      color: var(--color-button-text);
    }
  }

  &__controls button:disabled {
    opacity: 0.35;
  }

  &__controls svg,
  &__close svg,
  &__modal-nav svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

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
  }

  &__dialog::backdrop {
    background: rgb(30 20 13 / 78%);
  }

  &__close {
    position: absolute;
    z-index: 1;
    top: 0.5rem;
    right: 0.5rem;
    background: var(--color-content-background);
  }

  &__modal-nav {
    position: absolute;
    z-index: 1;
    top: 50%;
    background: var(--color-content-background);
    transform: translateY(-50%);

    &--previous {
      left: 0.5rem;
    }

    &--next {
      right: 0.5rem;
    }
  }

  &__expanded {
    position: relative;
    width: min(calc(100vw - 2rem - 4px), calc((100dvh - 2rem - 4px) * var(--certificate-ratio)));
    aspect-ratio: var(--certificate-ratio);
    margin: 0;
    outline: none;
    // Горизонтальний рух іде в обробник свайпу; вертикальна прокрутка й зум — нативні.
    touch-action: pan-y pinch-zoom;
    cursor: grab;
    user-select: none;
    -webkit-user-select: none;
    // Після відпускання зображення плавно повертається на місце.
    transition:
      transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
      opacity 260ms ease;

    &:active {
      cursor: grabbing;
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  }

  &__expanded img {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 3px;
    object-fit: contain;
  }

  &__full {
    opacity: 0;
    transition: opacity 200ms ease;

    &--ready {
      opacity: 1;
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  }

  &__dots {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  &__dots button {
    display: grid;
    width: 24px;
    height: 44px;
    padding: 0;
    place-items: center;
    border: 0;
    background: transparent;
  }

  &__dots span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.35;
  }

  &__dots button[aria-current='true'] span {
    opacity: 1;
    box-shadow: 0 0 8px rgb(103 69 50 / 40%);
  }
}
</style>
