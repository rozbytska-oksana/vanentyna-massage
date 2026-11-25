<template>
  <section
    id="process"
    ref="section"
    class="process"
    aria-labelledby="process-title"
    tabindex="-1"
  >
    <div class="process__inner">
      <header class="process__heading">
        <SectionEyebrow data-text-reveal>{{ processContent.eyebrow }}</SectionEyebrow>
        <h2
          id="process-title"
          data-text-reveal
        >
          {{ processContent.title }}
        </h2>
      </header>
      <div
        role="region"
        aria-label="Відео масажу"
        aria-roledescription="карусель"
      >
        <div
          ref="viewport"
          class="process__viewport"
          :class="{ 'process__viewport--ready': api }"
        >
          <div class="process__track">
            <figure
              v-for="(item, index) in processVideos"
              :key="item.id"
              class="process__slide"
              :class="{
                'process__slide--active': selected === index,
              }"
              role="group"
              aria-roledescription="слайд"
              :aria-label="`${index + 1} із ${processVideos.length}: ${item.title}`"
            >
              <div class="process__frame">
                <ProcessVideoCard
                  :src="item.src"
                  :poster="item.poster"
                  :title="item.title"
                  :width="item.width"
                  :height="item.height"
                  :poster-widths="item.posterWidths"
                  @play="onPlay(index, $event)"
                />
              </div>
            </figure>
          </div>
        </div>
        <div
          v-if="api"
          class="process__controls"
        >
          <button
            type="button"
            aria-label="Попереднє відео"
            @click="api?.scrollPrev(reduced)"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="m14 5-7 7 7 7" />
            </svg>
          </button>
          <div
            class="process__dots"
            role="group"
            aria-label="Обрати відео"
          >
            <button
              v-for="dot in visibleDots"
              :key="dot.id"
              type="button"
              :aria-label="`Відео ${dot.index + 1}: ${dot.title}`"
              :aria-current="selected === dot.index ? 'true' : undefined"
              @click="api?.scrollTo(dot.index, reduced)"
            >
              <span aria-hidden="true" />
            </button>
          </div>
          <button
            type="button"
            aria-label="Наступне відео"
            @click="api?.scrollNext(reduced)"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="m10 5 7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import emblaCarouselVue from 'embla-carousel-vue';
import { processContent, processVideos } from '~/data/process-videos';

const section = ref<HTMLElement | null>(null);
const reduced = useReducedMotion();
useTextReveal(section);
const selected = ref(0);
const visibleDots = computed(() => {
  const count = Math.min(5, processVideos.length);
  const start = Math.max(0, Math.min(selected.value - 2, processVideos.length - count));
  return processVideos
    .slice(start, start + count)
    .map((item, index) => ({ ...item, index: start + index }));
});
// Сенсорний свайп гортає відео; нижні 72px залишаємо нативній шкалі часу.
const options = computed(() => ({
  loop: true,
  align: 'center' as const,
  skipSnaps: true,
  duration: reduced.value ? 0 : 35,
  watchDrag: (_api: unknown, event: MouseEvent | TouchEvent) => {
    const target = event.target;
    if (!(target instanceof Element)) return true;
    if (target.closest('.process-video__gesture')) return true;
    const video = target.closest('video');
    if (video && 'touches' in event) {
      const touch = event.touches[0];
      return !!touch && touch.clientY < video.getBoundingClientRect().bottom - 72;
    }
    return !target.closest('video, button, input, select, textarea');
  },
}));
const [viewport, api] = emblaCarouselVue(options);
useCarouselImages(viewport);
let playingVideo: HTMLVideoElement | null = null;
let playingIndex = -1;
const pause = (except = -1) => {
  if (playingIndex !== except && playingVideo && !playingVideo.paused) playingVideo.pause();
};
const update = () => {
  selected.value = api.value?.selectedScrollSnap() ?? 0;
  pause(selected.value);
};
const onPlay = (index: number, player: HTMLVideoElement) => {
  pause(index);
  playingVideo = player;
  playingIndex = index;
  api.value?.scrollTo(index, reduced.value);
};
watch(api, (value, previous) => {
  previous?.off('select', update).off('reInit', update);
  value?.on('select', update).on('reInit', update);
  update();
});
let observer: IntersectionObserver | undefined;
const onVisibility = () => {
  if (document.hidden) pause();
};
onMounted(() => {
  document.addEventListener('visibilitychange', onVisibility);
  if (section.value && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) pause();
    });
    observer.observe(section.value);
  }
});
onBeforeUnmount(() => {
  pause();
  playingVideo = null;
  observer?.disconnect();
  document.removeEventListener('visibilitychange', onVisibility);
  api.value?.off('select', update).off('reInit', update);
});
</script>

<style scoped lang="scss">
@use '../assets/styles/breakpoints' as bp;
.process {
  padding-block: clamp(2rem, 4vw, 3rem);
  font-family: var(--font-hero-body);
  &__inner {
    width: min(100% - 2 * var(--space-page), var(--container-content));
    margin-inline: auto;
  }
  &__heading {
    text-align: center;
    & h2 {
      margin: 0;
      font: 500 clamp(2.5rem, 5vw, 4rem)/1.08 var(--font-hero-heading);
      text-wrap: balance;
    }
  }
  &__viewport {
    overflow-x: auto;
    padding-block: 1.5rem;
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
    position: relative;
    flex: 0 0 82%;
    min-width: 0;
    margin: 0 1.5rem 0 0;
    @include bp.medium {
      flex-basis: calc((100% - 3rem) / 3);
    }
    @include bp.x-large {
      flex-basis: calc((100% - 6rem) / 5);
    }
  }
  &__frame {
    transform: scale(0.96);
    @media (prefers-reduced-motion: no-preference) {
      transition: transform 600ms cubic-bezier(0.22, 1, 0.36, 1);
    }
  }
  &__slide--active {
    z-index: 1;
  }
  &__slide--active &__frame {
    transform: scale(1.02);
  }
  &__controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-button);
    & > button {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      border: 1px solid currentColor;
      border-radius: 50%;
      background: transparent;
      color: inherit;
    }
    & svg {
      width: 22px;
      height: 22px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.5;
    }
  }
  &__dots {
    display: flex;
    & button {
      display: grid;
      place-items: center;
      width: 28px;
      height: 44px;
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
    }
    & span {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      opacity: 0.35;
    }
    & button[aria-current='true'] span {
      opacity: 1;
    }
  }
  & button:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 3px;
  }
  @media (prefers-reduced-motion: reduce) {
    &__frame {
      transform: none;
    }
    &__slide--active &__frame {
      transform: none;
    }
  }
}
</style>
