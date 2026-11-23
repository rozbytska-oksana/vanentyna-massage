<template>
  <section
    ref="hero"
    class="hero"
    :class="{ 'hero--lights-paused': lightsPaused }"
    aria-labelledby="hero-title"
  >
    <div class="hero__backdrop">
      <picture class="hero__media">
        <source
          v-for="format in wideFormats"
          :key="`wide-${format.type}`"
          media="(min-width: 768px)"
          :type="format.type"
          :srcset="format.srcset"
          sizes="max(100vw, calc(100svh * 1.777))"
          :width="heroContent.image.width"
          :height="heroContent.image.height"
        />
        <source
          v-for="format in mobileFormats"
          :key="`mobile-${format.type}`"
          :type="format.type"
          :srcset="format.srcset"
          :width="heroContent.image.mobileWidth"
          :height="heroContent.image.mobileHeight"
        />
        <img
          class="hero__image"
          :src="`${assetBase}${heroContent.image.mobile}`"
          :width="heroContent.image.mobileWidth"
          :height="heroContent.image.mobileHeight"
          :alt="heroContent.image.alt"
          fetchpriority="high"
          loading="eager"
        />
      </picture>
      <div
        class="hero__lights"
        aria-hidden="true"
      >
        <div class="hero__lights-frame">
          <span
            v-for="light in lights"
            :key="light.key"
            class="hero__light"
            :style="light.style"
          ></span>
        </div>
      </div>
      <div
        class="hero__shade"
        aria-hidden="true"
      ></div>
    </div>
    <div class="hero__inner">
      <div class="hero__content">
        <p class="hero__eyebrow text-reveal text-reveal--intro">{{ heroContent.eyebrow }}</p>
        <h1
          id="hero-title"
          class="hero__title text-reveal text-reveal--intro"
          style="--text-reveal-delay: 120ms"
        >
          <span
            v-for="line in heroContent.title"
            :key="line"
          >
            {{ line }}
          </span>
        </h1>
        <p
          class="hero__description text-reveal text-reveal--intro"
          style="--text-reveal-delay: 240ms"
        >
          {{ heroContent.description }}
        </p>
        <div
          class="hero__actions text-reveal text-reveal--intro"
          style="--text-reveal-delay: 360ms"
        >
          <button
            class="button button--secondary hero__booking"
            type="button"
            @click="$emit('book')"
          >
            {{ heroContent.bookingLabel }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { heroLightPositions } from '~/data/hero-lights';
import { heroContent } from '~/data/home';
import { withImageExtension } from '~/utils/withImageExtension';

defineEmits<{ book: [] }>();
const assetBase = useRuntimeConfig().app.baseURL;

// Браузер бере перший підтримуваний формат: AVIF → WebP → JPEG (mobile JPEG — у самому img).
const wideSrcset = (format?: 'avif' | 'webp') =>
  [
    [heroContent.image.medium, 1280],
    [heroContent.image.desktop, 1672],
  ]
    .map(([path, width]) => {
      const file = format ? withImageExtension(String(path), format) : path;
      return `${assetBase}${file} ${width}w`;
    })
    .join(', ');
const wideFormats = [
  { type: 'image/avif', srcset: wideSrcset('avif') },
  { type: 'image/webp', srcset: wideSrcset('webp') },
  { type: 'image/jpeg', srcset: wideSrcset() },
];
const mobileFormats = (['avif', 'webp'] as const).map((format) => ({
  type: `image/${format}`,
  srcset: `${assetBase}${withImageExtension(heroContent.image.mobile, format)}`,
}));

const hero = useTemplateRef<HTMLElement>('hero');
const lightsPaused = ref(false);
let lightsObserver: IntersectionObserver | undefined;

onMounted(() => {
  if (!hero.value || !('IntersectionObserver' in window)) {
    return;
  }
  lightsObserver = new IntersectionObserver(([entry]) => {
    lightsPaused.value = !entry?.isIntersecting;
  });
  lightsObserver.observe(hero.value);
});

onBeforeUnmount(() => {
  lightsObserver?.disconnect();
});

// Детерміновані тривалість і затримка: однаковий результат на сервері й клієнті.
const lights = heroLightPositions.map(([x, y], index) => ({
  key: `${x}-${y}`,
  style: {
    left: `${x}%`,
    top: `${y}%`,
    animationDuration: `${2.6 + ((index * 37) % 23) / 10}s`,
    animationDelay: `-${((index * 53) % 41) / 10}s`,
  },
}));
</script>

<style scoped lang="scss">
@use '../assets/styles/breakpoints' as bp;

.hero {
  position: relative;
  isolation: isolate;
  display: grid;
  min-height: 100svh;
  overflow: clip;
  clip-path: inset(0);
  background: var(--color-hero-background);
  color: var(--color-hero-text);
  font-family: var(--font-hero-body);

  &__backdrop {
    position: fixed;
    inset: 0;
    height: 100svh;
    z-index: -1;
    background: var(--color-hero-background);

    @media (prefers-reduced-motion: reduce) {
      position: absolute;
    }
  }

  &__media,
  &__lights,
  &__shade {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  &__media,
  &__lights {
    top: auto;
    height: 86%;
    mask-image: linear-gradient(180deg, transparent, #000 18%);

    @include bp.medium {
      top: 0;
      height: 100%;
      mask-image: none;
    }
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 62% center;

    @include bp.medium {
      object-position: 58% center;
    }

    @include bp.x-large {
      object-position: center;
    }
  }

  // Мерехтіння гірлянди: рамка повторює геометрію object-fit: cover фото,
  // тож відсоткові позиції лампочок збігаються з кадром на будь-якій ширині.
  &__lights {
    overflow: hidden;
    container-type: size;
    pointer-events: none;

    @media (prefers-reduced-motion: reduce) {
      display: none;
    }
  }

  &__lights-frame {
    // Mobile: показано вертикальний crop 706×941 із x=650 повного кадру 1672×941.
    --crop-w: max(100cqw, calc(100cqh * 706 / 941));
    --crop-h: max(100cqh, calc(100cqw * 941 / 706));

    position: absolute;
    top: calc((100cqh - var(--crop-h)) / 2);
    left: calc((100cqw - var(--crop-w)) * 0.62 - var(--crop-w) * 650 / 706);
    width: calc(var(--crop-w) * 1672 / 706);
    height: var(--crop-h);

    @include bp.medium {
      --frame-w: max(100cqw, calc(100cqh * 1672 / 941));
      --frame-h: max(100cqh, calc(100cqw * 941 / 1672));

      top: calc((100cqh - var(--frame-h)) / 2);
      left: calc((100cqw - var(--frame-w)) * 0.58);
      width: var(--frame-w);
      height: var(--frame-h);
    }

    @include bp.x-large {
      left: calc((100cqw - var(--frame-w)) * 0.5);
    }
  }

  &__light {
    position: absolute;
    width: 1.8%;
    aspect-ratio: 1;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgb(255 248 226 / 95%) 0%,
      rgb(255 216 150 / 70%) 20%,
      rgb(255 190 100 / 25%) 42%,
      rgb(255 180 90 / 0%) 70%
    );
    mix-blend-mode: screen;
    opacity: 0.05;
    transform: translate(-50%, -50%) scale(0.7);
    animation: hero-light-twinkle ease-in-out infinite;
  }

  // Коли банер поза екраном, анімація стоїть — без зайвої роботи під час читання сторінки.
  &--lights-paused &__light {
    animation-play-state: paused;
  }

  &__shade {
    background: linear-gradient(
      180deg,
      rgb(27 17 10 / 70%) 0%,
      rgb(27 17 10 / 52%) 45%,
      rgb(27 17 10 / 18%) 100%
    );

    @include bp.medium {
      background:
        linear-gradient(
          90deg,
          rgb(27 17 10 / 48%) 0%,
          rgb(27 17 10 / 30%) 38%,
          rgb(27 17 10 / 3%) 78%
        ),
        linear-gradient(
          180deg,
          rgb(27 17 10 / 55%) 0%,
          rgb(27 17 10 / 0%) 25%,
          rgb(27 17 10 / 12%) 100%
        );
    }
  }

  &__inner {
    display: flex;
    align-items: flex-start;
    width: min(100% - 2 * var(--space-page), var(--container-wide));
    margin-inline: auto;
    padding-block: calc(var(--header-height) + clamp(2rem, 6svh, 4rem)) 3rem;

    @include bp.medium {
      align-items: center;
      padding-block: calc(var(--header-height) + 2rem) 4rem;
    }
  }

  &__content {
    width: 100%;
    max-width: 45rem;

    @include bp.medium {
      width: 80%;
    }

    @include bp.x-large {
      width: 56%;
      max-width: 46rem;
    }
  }

  &__eyebrow {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    margin: 0 0 1.25rem;
    font-size: 0.8125rem;
    font-weight: 500;
    letter-spacing: 0.28em;
    text-transform: uppercase;

    @include bp.medium {
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
    }
  }

  &__title {
    margin: 0;
    font-family: var(--font-hero-heading);
    font-size: clamp(2.5rem, 10vw, 3.25rem);
    font-weight: 500;
    line-height: 1.04;
    letter-spacing: -0.01em;

    span {
      display: block;
    }

    @include bp.medium {
      font-size: clamp(3.5rem, 6.4vw, 4.5rem);
    }

    @include bp.x-large {
      font-size: clamp(4.25rem, 4.6vw, 5.25rem);
    }
  }

  &__description {
    max-width: 28rem;
    margin: 1.25rem 0 0;
    color: var(--color-hero-muted);
    font-size: 1.125rem;
    line-height: 1.6;

    @include bp.medium {
      margin-top: 1.5rem;
    }

    @include bp.x-large {
      max-width: 30rem;
      font-size: 1.25rem;
    }
  }

  &__actions {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    flex-wrap: wrap;
    gap: 0.875rem;
    margin-top: 2rem;

    @include bp.medium {
      align-items: center;
      flex-direction: row;
      gap: 2rem;
      margin-top: 2.25rem;
    }
  }

  // Кольори, рамка й ховер — зі спільного .button--secondary.
  &__booking {
    min-height: 3.5rem;
    padding: 0.875rem 1.75rem;
    font-weight: 600;

    @include bp.medium {
      padding-inline: 2rem;
      font-size: 1.0625rem;
    }
  }

  &__booking:focus-visible {
    outline-color: var(--color-hero-text);
  }
}

@keyframes hero-light-twinkle {
  0%,
  100% {
    opacity: 0.05;
    transform: translate(-50%, -50%) scale(0.7);
  }

  50% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.15);
  }
}
</style>
