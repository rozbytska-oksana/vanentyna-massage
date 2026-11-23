<template>
  <NuxtLink
    class="site-logo"
    to="/"
    :prefetch="false"
    :aria-label="headerContent.homeLabel"
  >
    <span
      class="site-logo__mark"
      :style="{ '--mark-image': `url('${assetBase}images/plant-mark.svg')` }"
      aria-hidden="true"
    ></span>
    <span class="site-logo__wordmark">
      <span class="site-logo__name">{{ headerContent.brandName }}</span>
      <span class="site-logo__tagline">{{ headerContent.brandTagline }}</span>
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
import { headerContent } from '~/data/home';

const assetBase = useRuntimeConfig().app.baseURL;
</script>

<style scoped lang="scss">
@use '../assets/styles/breakpoints' as bp;

.site-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  color: inherit;
  text-decoration: none;
  font-family: var(--font-hero-body);

  @include bp.medium {
    gap: 0.875rem;
  }

  &:focus-visible {
    outline-color: currentColor;
  }

  &__mark {
    flex: 0 0 auto;
    width: clamp(2.25rem, 11vw, 3rem);
    aspect-ratio: 240 / 140;
    background: currentColor;
    mask: var(--mark-image) center / contain no-repeat;

    @include bp.medium {
      width: 3.5rem;
    }
  }

  &__wordmark {
    display: grid;
    gap: 0.25rem;
    min-width: 0;
  }

  &__name {
    font-family: var(--font-hero-heading);
    font-size: clamp(1.125rem, 5.6vw, 1.3125rem);
    font-weight: 500;
    line-height: 1.05;
    white-space: nowrap;

    @include bp.medium {
      font-size: 1.5rem;
    }
  }

  &__tagline {
    font-size: 0.6875rem;
    font-weight: 500;
    line-height: 1.2;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    white-space: nowrap;

    @include bp.medium {
      letter-spacing: 0.32em;
    }
  }
}
</style>
