<template>
  <div class="process-video">
    <video
      v-if="loaded"
      ref="video"
      class="process-video__player"
      :src="`${baseURL}${src}`"
      :poster="`${baseURL}${poster}-360.webp`"
      controls
      tabindex="0"
      preload="none"
      playsinline
      :aria-label="title"
      @play="onPlay"
      @pause="playing = false"
      @ended="playing = false"
      @error="failed = true"
    />
    <button
      v-if="loaded && !failed"
      class="process-video__gesture"
      type="button"
      :aria-label="`${playing ? 'Призупинити' : 'Відтворити'}: ${title}`"
      @click="togglePlayback"
    >
      <span
        v-if="!playing"
        class="process-video__play"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24"><path d="m9 5 11 7-11 7Z" /></svg>
      </span>
    </button>
    <a
      v-if="!loaded || failed"
      class="process-video__cover"
      draggable="false"
      :href="`${baseURL}${src}`"
      :aria-label="`Відтворити відео: ${title}`"
      @click="start"
    >
      <picture>
        <source
          type="image/avif"
          :srcset="posterSources('avif')"
          :sizes="sizes"
        />
        <img
          :src="`${baseURL}${poster}-360.webp`"
          :srcset="posterSources('webp')"
          :sizes="sizes"
          :alt="title"
          :width="width"
          :height="height"
          draggable="false"
          loading="lazy"
          fetchpriority="low"
          decoding="async"
        />
      </picture>
      <span
        class="process-video__play"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24"><path d="m9 5 11 7-11 7Z" /></svg>
      </span>
      <span class="process-video__hint">
        {{ failed ? 'Відкрити відео окремо' : title }}
      </span>
    </a>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue';

const props = defineProps<{
  src: string;
  poster: string;
  title: string;
  width: number;
  height: number;
  posterWidths: number[];
}>();
const posterSources = (format: 'avif' | 'webp'): string =>
  props.posterWidths
    .map((width) => `${baseURL}${props.poster}-${width}.${format} ${width}w`)
    .join(', ');
const emit = defineEmits<{ play: [player: HTMLVideoElement] }>();
const baseURL = useRuntimeConfig().app.baseURL;
const loaded = ref(false);
const failed = ref(false);
const playing = ref(false);
const video = ref<HTMLVideoElement | null>(null);
const sizes =
  '(min-width: 1200px) min(calc((100vw - 12rem) / 5), 221px), (min-width: 768px) calc((100vw - clamp(2rem, 8vw, 6rem) - 3rem) / 3), 78vw';
const onPlay = () => {
  playing.value = true;
  if (video.value) emit('play', video.value);
};
const togglePlayback = async () => {
  const player = video.value;
  if (!player) return;
  if (!player.paused) {
    player.pause();
    return;
  }
  try {
    await player.play();
  } catch {
    // Нативні елементи керування дозволяють повторити спробу.
  }
};
const start = async (event: MouseEvent) => {
  if (failed.value || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  loaded.value = true;
  await nextTick();
  try {
    if (video.value) {
      video.value.focus({ preventScroll: true });
      video.value.muted = false;
      await video.value.play();
    }
  } catch {
    // Якщо браузер відхилив запуск, лишаються нативні елементи керування.
  }
};
onBeforeUnmount(() => video.value?.pause());
</script>

<style scoped lang="scss">
.process-video {
  position: relative;
  aspect-ratio: 9 / 16;
  overflow: hidden;
  border: 1px solid var(--color-border-strong);
  border-radius: 0.75rem;
  background: var(--color-hero-background);
  box-shadow: 0 12px 30px rgb(0 0 0 / 20%);

  &__player,
  &__cover,
  &__cover picture,
  &__cover img {
    display: block;
    width: 100%;
    height: 100%;
  }

  &__player,
  &__cover img {
    object-fit: contain;
  }

  &__cover {
    position: absolute;
    inset: 0;
    color: var(--color-button-text);
    text-decoration: none;

    &:focus-visible {
      outline: 3px solid var(--color-button-text);
      outline-offset: -5px;
    }
  }

  &__gesture {
    position: absolute;
    // Залишаємо нативну шкалу програвання вільною від накладки.
    inset: 0 0 5rem;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--color-button-text);
    touch-action: pan-y pinch-zoom;

    &:focus-visible {
      outline: 3px solid var(--color-button-text);
      outline-offset: -5px;
    }

    // На сенсорних пристроях працюють лише нативні елементи керування.
    @media (hover: none), (pointer: coarse) {
      display: none;
    }
  }

  &__cover img {
    user-select: none;
    -webkit-user-drag: none;
  }

  &__play {
    position: absolute;
    inset: 50% auto auto 50%;
    display: grid;
    place-items: center;
    width: 64px;
    height: 64px;
    transform: translate(-50%, -50%);
    border: 1px solid var(--color-button-text);
    border-radius: 50%;
    background: rgb(103 69 50 / 85%);

    & svg {
      width: 28px;
      height: 28px;
      fill: currentColor;
    }
  }

  &__hint {
    position: absolute;
    inset: auto 0 0;
    padding: 2rem 0.75rem 0.875rem;
    background: linear-gradient(transparent, rgb(0 0 0 / 85%));
    text-align: center;
    font: 400 clamp(1.25rem, 1.8vw, 1.75rem)/1.3 var(--font-hero-heading);
    color: var(--color-button-text);
  }
}
</style>
