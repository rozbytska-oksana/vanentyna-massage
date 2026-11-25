<template>
  <section
    id="about"
    ref="section"
    class="about"
    aria-labelledby="about-title"
    tabindex="-1"
  >
    <header class="about__header">
      <SectionEyebrow data-text-reveal>{{ aboutContent.eyebrow }}</SectionEyebrow>
      <h2
        id="about-title"
        class="about__heading"
        data-text-reveal
      >
        {{ aboutContent.role }}
      </h2>
    </header>
    <div class="about__inner">
      <figure
        v-if="aboutContent.portrait"
        class="about__figure"
        data-text-reveal="zoom"
      >
        <picture class="about__portrait">
          <source
            type="image/avif"
            :srcset="portraitSrcset('avif')"
            :sizes="portraitSizes"
          />
          <img
            class="about__image"
            :src="`${assetBase}${aboutContent.portrait.src}`"
            :srcset="portraitSrcset('webp')"
            :sizes="portraitSizes"
            :alt="aboutContent.portrait.alt"
            :width="aboutContent.portrait.width"
            :height="aboutContent.portrait.height"
            loading="lazy"
            decoding="async"
          />
        </picture>
      </figure>

      <div class="about__content">
        <p
          class="about__introduction"
          data-text-reveal
        >
          <template
            v-for="(part, index) in emphasize(aboutContent.introduction)"
            :key="index"
          >
            <strong v-if="part.emphasized">{{ part.text }}</strong>
            <template v-else>{{ part.text }}</template>
          </template>
        </p>
        <p
          v-for="paragraph in aboutContent.paragraphs"
          :key="paragraph"
          class="about__paragraph"
          data-text-reveal
        >
          <template
            v-for="(part, index) in emphasize(paragraph)"
            :key="index"
          >
            <strong v-if="part.emphasized">{{ part.text }}</strong>
            <template v-else>{{ part.text }}</template>
          </template>
        </p>
        <blockquote
          class="about__quote"
          data-text-reveal
        >
          <p>{{ aboutContent.quote }}</p>
        </blockquote>
      </div>

      <section
        v-if="publishedCertificates.length"
        id="certificates"
        class="about__learning"
        aria-labelledby="certificates-title"
        tabindex="-1"
      >
        <h3
          id="certificates-title"
          class="about__learning-title"
          data-text-reveal
        >
          {{ aboutContent.learning.title }}
        </h3>
        <CertificatesCarousel
          :certificates="publishedCertificates"
          data-text-reveal
        />
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { aboutContent } from '~/data/about';
import { publishedCertificates } from '~/data/certificates';

const assetBase = useRuntimeConfig().app.baseURL;
const section = useTemplateRef<HTMLElement>('section');
const portraitSizes = '(min-width: 1200px) 28vw, (min-width: 768px) 46vw, min(100vw - 2rem, 26rem)';

const portraitSrcset = (format: 'avif' | 'webp'): string =>
  (aboutContent.portrait?.sources ?? [])
    .map((source) => `${assetBase}${source.path}.${format} ${source.width}w`)
    .join(', ');

const emphasize = (text: string): { text: string; emphasized: boolean }[] => {
  const phrase = aboutContent.emphasis.find((item) => text.includes(item));
  if (!phrase) return [{ text, emphasized: false }];
  const index = text.indexOf(phrase);
  return [
    { text: text.slice(0, index), emphasized: false },
    { text: phrase, emphasized: true },
    { text: text.slice(index + phrase.length), emphasized: false },
  ];
};

useTextReveal(section);
</script>

<style scoped lang="scss">
@use '../assets/styles/breakpoints' as bp;

.about {
  padding-block: clamp(3rem, 6vw, 6rem);
  font-family: var(--font-hero-body);

  // Заголовок секції в стилі «Послуги та ціни»: підпис з орнаментом і великий Cormorant по центру.
  &__header {
    width: min(100% - 2 * var(--space-page), var(--container-content));
    margin: 0 auto clamp(2rem, 4vw, 3.25rem);
    text-align: center;
  }

  &__heading {
    margin: 0;
    font-family: var(--font-hero-heading);
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 500;
    line-height: 1.1;
    text-wrap: balance;
  }

  &__inner {
    display: grid;
    gap: clamp(2.5rem, 5vw, 4rem);
    width: min(100% - 2 * var(--space-page), var(--container-content));
    margin-inline: auto;

    @include bp.medium {
      grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
      align-items: start;
    }

    @include bp.x-large {
      grid-template-columns: minmax(0, 0.85fr) minmax(0, 1fr) minmax(0, 0.8fr);
      gap: clamp(1.5rem, 2.5vw, 3rem);
      width: min(100% - 2 * var(--space-page), var(--container-wide));
    }
  }

  // Фото з прозорими «мазковими» краями показується цілком, без рамок і декору.
  &__figure {
    width: 100%;
    max-width: 26rem;
    margin: 0 auto;

    // На планшеті фото займає всю ширину колонки й задає власну висоту.
    @include bp.medium {
      position: relative;
      align-self: stretch;
      max-width: none;
    }
  }

  &__portrait {
    display: block;

    // Більше за висоту тексту: фото виходить на 2rem вище й на 3.5rem нижче
    // (зверху менше, щоб не наближатися до заголовка секції).
    @include bp.x-large {
      position: absolute;
      inset: -2rem 0 -3.5rem;
    }
  }

  &__image {
    display: block;
    width: 100%;
    height: auto;

    @include bp.x-large {
      height: 100%;
      object-fit: contain;
      object-position: center;
    }
  }

  &__content {
    min-width: 0;
  }

  &__introduction,
  &__paragraph {
    margin: 0 0 1rem;
    font-size: 1.0625rem;
    line-height: 1.7;
  }

  &__paragraph {
    color: var(--color-text-muted);
  }

  &__introduction,
  &__paragraph {
    & strong {
      color: var(--color-button);
      font-family: var(--font-hero-heading);
      font-size: 1.2em;
      font-style: italic;
      font-weight: 500;
    }
  }

  &__quote {
    margin: 1.25rem 0 0;
    color: var(--color-button);
    font-family: var(--font-hero-heading);
    font-size: clamp(1.375rem, 2vw, 1.625rem);
    font-style: italic;
    line-height: 1.3;

    p {
      margin: 0;
    }
  }

  &__learning {
    min-width: 0;
    padding-top: clamp(2rem, 4vw, 2.5rem);
    border-top: 1px solid var(--color-border-strong);
    scroll-margin-block-start: var(--space-md);

    @include bp.medium {
      grid-column: 1 / -1;
    }

    @include bp.x-large {
      grid-column: auto;
      padding: 0 0 0 clamp(1rem, 2vw, 2rem);
      border-top: 0;
      border-left: 1px solid var(--color-border-strong);
    }
  }

  &__learning-title {
    margin: 0 0 1rem;
    font-family: var(--font-hero-heading);
    font-size: clamp(1.625rem, 2.2vw, 2rem);
    font-weight: 500;
    line-height: 1.1;
  }
}
</style>
