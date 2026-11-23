<template>
  <article
    class="service-card"
    :aria-labelledby="`service-${service.id}`"
  >
    <div
      v-if="hasImage"
      class="service-card__media"
    >
      <picture class="service-card__picture">
        <source
          v-for="format in imageFormats"
          :key="format.type"
          :type="format.type"
          :srcset="format.srcset"
          :sizes="imageSizes"
        />
        <img
          class="service-card__illustration"
          :src="`${assetBase}${service.image}`"
          :srcset="srcset"
          :sizes="imageSizes"
          :width="service.imageWidth"
          :height="service.imageHeight"
          :alt="service.imageAlt ?? service.title"
          loading="lazy"
          decoding="async"
        />
      </picture>
    </div>
    <div class="service-card__content">
      <h3
        :id="`service-${service.id}`"
        class="service-card__title"
      >
        {{ service.title }}
      </h3>
      <p
        v-if="service.description"
        class="service-card__description"
      >
        {{ service.description }}
      </p>
      <template v-if="service.details">
        <div
          :id="detailsId"
          class="service-card__more"
          :class="{ 'service-card__more--open': expanded }"
        >
          <div class="service-card__more-inner">
            <p class="service-card__details">{{ service.details }}</p>
          </div>
        </div>
        <button
          class="service-card__more-toggle"
          type="button"
          :aria-expanded="expanded"
          :aria-controls="detailsId"
          @click="expanded = !expanded"
        >
          <span class="service-card__more-label">
            {{ expanded ? servicesContent.collapseLabel : servicesContent.detailsLabel }}
          </span>
          <svg
            class="service-card__more-icon"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2.5 4.5 6 8l3.5-3.5"
              stroke="currentColor"
              stroke-width="1.25"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </template>
      <div class="service-card__footer">
        <p class="service-card__price">{{ formatPrice(service.price) }}</p>
        <button
          class="button button--primary service-card__booking"
          type="button"
          :aria-label="`${servicesContent.bookingLabel} — ${service.title}`"
          @click="$emit('book')"
        >
          {{ servicesContent.bookingLabel }}
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Service } from '~/types/content';
import { servicesContent } from '~/data/services';
import { formatPrice } from '~/utils/formatPrice';
import { withImageExtension } from '~/utils/withImageExtension';

const props = defineProps<{ service: Service; number: number }>();
defineEmits<{ book: [] }>();

const assetBase = useRuntimeConfig().app.baseURL;
const expanded = ref(false);
const detailsId = computed(() => `service-${props.service.id}-details`);
const hasImage = computed(() =>
  Boolean(props.service.image && props.service.imageWidth && props.service.imageHeight),
);
const imageSizes = '(min-width: 1200px) 24rem, (min-width: 768px) 46vw, calc(100vw - 2rem)';
const srcsetFor = (format?: 'avif' | 'webp') =>
  props.service.imageSources
    ?.map((source) => {
      const path = format ? withImageExtension(source.path, format) : source.path;
      return `${assetBase}${path} ${source.width}w`;
    })
    .join(', ');
const srcset = computed(() => srcsetFor());
// AVIF і WebP тих самих розмірів; JPEG у img лишається запасним варіантом.
const imageFormats = computed(() =>
  props.service.imageSources
    ? (['avif', 'webp'] as const).map((format) => ({
        type: `image/${format}`,
        srcset: srcsetFor(format),
      }))
    : [],
);
</script>

<style scoped lang="scss">
@use '../assets/styles/breakpoints' as bp;
@use '../assets/styles/links' as link;

.service-card {
  --details-duration: 360ms;

  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  background: var(--color-card);
  transition:
    transform 450ms var(--menu-easing),
    box-shadow 450ms var(--menu-easing),
    border-color 450ms ease;

  @media (prefers-reduced-motion: reduce) {
    --details-duration: 0ms;

    transition: none;
  }

  // Підйом картки при наведенні — разом із уже наявним наближенням фото.
  @media (hover: hover) and (prefers-reduced-motion: no-preference) {
    &:hover {
      border-color: var(--color-border-strong);
      box-shadow: 0 1.5rem 2.5rem -1.75rem rgb(73 48 30 / 45%);
      transform: translateY(-0.375rem);
    }
  }

  &__media {
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: var(--color-surface);
  }

  &__picture {
    display: block;
    height: 100%;
  }

  &__illustration {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;

    // Делікатне повільне збільшення фото при наведенні на картку або фокусі всередині неї:
    // 1 с із рівномірною кривою, без різкого ривка на початку.
    @media (prefers-reduced-motion: no-preference) {
      transition: transform 1000ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
  }

  @media (hover: hover) and (prefers-reduced-motion: no-preference) {
    &:hover &__illustration {
      transform: scale(1.08);
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    &:has(:focus-visible) &__illustration {
      transform: scale(1.08);
    }
  }

  &__content {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
    padding: 1.25rem 1.25rem 1.5rem;

    @include bp.x-large {
      padding-inline: 1.5rem;
    }

    // Відступ між текстом і футером, який притиснутий до низу картки.
    > :nth-last-child(2) {
      margin-bottom: 1.25rem;
    }
  }

  &__title {
    margin: 0;
    font-family: var(--font-hero-heading);
    font-size: clamp(1.75rem, 2.4vw, 2.125rem);
    font-weight: 500;
    line-height: 1.1;
    overflow-wrap: break-word;
  }

  &__description,
  &__details {
    margin: 0.75rem 0 0;
    font-size: 1.0625rem;
    line-height: 1.65;
  }

  &__description {
    color: var(--color-text);
  }

  &__details {
    margin-top: 0.5rem;
    color: var(--color-text-muted);
  }

  // Плавне розгортання без вимірювання висоти в JS: рядок сітки 0fr → 1fr.
  &__more {
    display: grid;
    grid-template-rows: 0fr;
    width: 100%;
    opacity: 0;
    visibility: hidden;
    transition:
      grid-template-rows var(--details-duration) var(--menu-easing),
      opacity var(--details-duration) ease,
      visibility 0s linear var(--details-duration);

    &--open {
      grid-template-rows: 1fr;
      opacity: 1;
      visibility: visible;
      transition:
        grid-template-rows var(--details-duration) var(--menu-easing),
        opacity var(--details-duration) ease,
        visibility 0s;
    }
  }

  &__more-inner {
    min-height: 0;
    overflow: hidden;
  }

  &__more-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    min-height: 2.75rem;
    margin-top: 0.25rem;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--color-accent);
    font-size: 1rem;

    @include link.hover-underline-text('.service-card__more-label');

    &[aria-expanded='true'] .service-card__more-icon {
      transform: rotate(180deg);
    }
  }

  &__more-icon {
    flex-shrink: 0;
    transition: transform var(--details-duration) var(--menu-easing);
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem 1rem;
    width: 100%;
    margin-top: auto;
    padding-top: 1.25rem;
    border-top: 1px solid var(--color-border);
  }

  &__price {
    margin: 0;
    font-size: 1.375rem;
    font-weight: 500;
    white-space: nowrap;
  }

  &__booking {
    padding-inline: 1.5rem;
    font-family: inherit;
  }
}
</style>
