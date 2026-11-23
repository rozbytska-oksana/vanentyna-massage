<template>
  <footer class="site-footer">
    <div class="site-footer__inner">
      <SiteLogo />
      <a
        class="site-footer__credit"
        :href="footerContent.creditUrl"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ footerContent.creditLabel }}
      </a>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { footerContent } from '~/data/contacts';
</script>

<style scoped lang="scss">
@use '../assets/styles/breakpoints' as bp;
@use '../assets/styles/links' as link;

.site-footer {
  padding: 1.25rem var(--space-page);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-content-background);
  background-image: var(--background-content-image);
  color: var(--color-button);

  &__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1.25rem;
    max-width: var(--container-wide);
    margin-inline: auto;

    @include bp.medium {
      flex-wrap: nowrap;
    }
  }

  &__credit {
    color: inherit;
    font-size: 1rem;

    @include link.hover-underline;

    &:focus-visible {
      outline-color: currentColor;
    }
  }
}
</style>
