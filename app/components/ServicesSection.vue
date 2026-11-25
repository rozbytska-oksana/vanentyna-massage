<template>
  <section
    id="services"
    ref="section"
    class="services"
    aria-labelledby="services-title"
    tabindex="-1"
  >
    <div class="services__inner">
      <header class="services__header">
        <SectionEyebrow data-text-reveal>{{ servicesContent.eyebrow }}</SectionEyebrow>
        <h2
          id="services-title"
          class="services__title"
          data-text-reveal
        >
          {{ servicesContent.title }}
        </h2>
      </header>
      <ul
        id="services-list"
        class="services__list"
        :class="{ 'services__list--expanded': expanded }"
      >
        <li
          v-for="(service, index) in services"
          :key="service.id"
          class="services__item"
          data-text-reveal
          :class="{
            'services__item--extra': index >= servicesContent.mobileVisibleCount,
            'services__item--extra-tablet': index >= servicesContent.tabletVisibleCount,
          }"
        >
          <ServiceCard
            :service="service"
            :number="index + 1"
            @book="$emit('book')"
          />
        </li>
      </ul>
      <div
        v-if="services.length > servicesContent.mobileVisibleCount"
        class="services__more"
      >
        <button
          ref="toggle"
          class="button button--secondary services__toggle"
          type="button"
          aria-controls="services-list"
          :aria-expanded="expanded"
          @click="toggleList"
        >
          {{
            expanded
              ? servicesContent.showLessLabel
              : `${servicesContent.showAllLabel} (${services.length})`
          }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { services, servicesContent } from '~/data/services';

defineEmits<{ book: [] }>();

const section = useTemplateRef<HTMLElement>('section');
const toggle = useTemplateRef<HTMLButtonElement>('toggle');
const expanded = ref(false);
useTextReveal(section);

// Розгортання лишає сторінку на місці: нові картки з’являються там, де була кнопка.
// Після згортання кнопка повертається у видиму зону, щоб не опинитися далеко нижче за списком.
const toggleList = async (): Promise<void> => {
  expanded.value = !expanded.value;
  if (expanded.value) return;
  await nextTick();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  toggle.value?.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
};
</script>

<style scoped lang="scss">
@use '../assets/styles/breakpoints' as bp;

.services {
  padding-block: clamp(2rem, 4vw, 3.5rem);
  background: transparent;
  font-family: var(--font-hero-body);

  &__inner {
    width: min(100% - 2 * var(--space-page), var(--container-content));
    margin-inline: auto;
  }

  &__header {
    margin-bottom: clamp(1.5rem, 3vw, 2.25rem);
    text-align: center;

    :deep(.section-eyebrow__text) {
      white-space: normal;
      text-wrap: balance;
    }
  }

  &__title {
    margin: 0;
    font-family: var(--font-hero-heading);
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 500;
    line-height: 1.1;
  }

  &__list {
    display: grid;
    gap: 1.5rem;
    margin: 0;
    padding: 0;
    list-style: none;

    @include bp.medium {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: clamp(1.5rem, 2.5vw, 2rem);
    }

    @include bp.x-large {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  &__item {
    min-width: 0;

    // До розгортання видно три ряди: 3 картки на mobile, 6 на tablet.
    &--extra {
      display: none;

      @include bp.medium {
        display: block;
      }
    }

    &--extra-tablet {
      @include bp.medium {
        display: none;
      }

      @include bp.x-large {
        display: block;
      }
    }
  }

  &__list--expanded &__item--extra {
    display: block;
  }

  &__more {
    margin-top: 1.5rem;
    text-align: center;

    @include bp.x-large {
      display: none;
    }
  }

  &__toggle {
    min-width: min(100%, 18rem);
  }
}
</style>
