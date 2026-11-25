<template>
  <section
    id="contacts"
    ref="section"
    class="contacts"
    tabindex="-1"
    aria-labelledby="contacts-title"
  >
    <picture class="contacts__picture">
      <source
        media="(min-width: 768px)"
        type="image/avif"
        :srcset="`${assetBase}${contactsContent.image.desktop}-1280.avif 1280w, ${assetBase}${contactsContent.image.desktop}-2172.avif 2172w`"
        sizes="100vw"
      />
      <source
        media="(min-width: 768px)"
        type="image/webp"
        :srcset="`${assetBase}${contactsContent.image.desktop}-1280.webp 1280w, ${assetBase}${contactsContent.image.desktop}-2172.webp 2172w`"
        sizes="100vw"
      />
      <source
        type="image/avif"
        :srcset="`${assetBase}${contactsContent.image.mobile}-480.avif 480w, ${assetBase}${contactsContent.image.mobile}-768.avif 768w`"
        sizes="100vw"
      />
      <img
        :src="`${assetBase}${contactsContent.image.mobile}-768.webp`"
        :srcset="`${assetBase}${contactsContent.image.mobile}-480.webp 480w, ${assetBase}${contactsContent.image.mobile}-768.webp 768w`"
        sizes="100vw"
        :width="contactsContent.image.width"
        :height="contactsContent.image.height"
        alt=""
        loading="lazy"
      />
    </picture>
    <div class="contacts__content">
      <h2
        id="contacts-title"
        class="contacts__title"
        data-text-reveal
      >
        {{ contactsContent.title }}
      </h2>
      <div
        class="contacts__details"
        data-text-reveal
      >
        <a
          class="contacts__link"
          :href="`tel:${contacts.phone}`"
        >
          <ContactIcon name="phone" />
          <span>{{ contactsContent.phoneLabel }}</span>
        </a>
        <a
          class="contacts__link"
          :href="contactsContent.mapUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ContactIcon name="location" />
          <span>{{ contacts.address }}</span>
        </a>
      </div>
      <ul
        class="contacts__channels"
        data-text-reveal
        :aria-label="contactsContent.channelsLabel"
      >
        <li
          v-for="channel in contacts.channels"
          :key="channel.id"
          class="contacts__channel"
        >
          <a
            :href="channel.href"
            :target="channel.id === 'viber' ? undefined : '_blank'"
            rel="noopener noreferrer"
          >
            <ContactIcon :name="channel.id" />
            <span>{{ channel.label }}</span>
          </a>
        </li>
      </ul>
      <button
        class="button button--primary contacts__booking"
        data-text-reveal
        type="button"
        @click="emit('book')"
      >
        {{ contactsContent.bookingLabel }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { contacts, contactsContent } from '~/data/contacts';

const emit = defineEmits<{ book: [] }>();
const assetBase = useRuntimeConfig().app.baseURL;
const section = useTemplateRef<HTMLElement>('section');
// Заголовок з’являється плавно, як в інших секціях.
useTextReveal(section);
</script>

<style scoped lang="scss">
@use '../assets/styles/breakpoints' as bp;
@use '../assets/styles/links' as link;

.contacts {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  // Однакові відступи зверху й знизу; рушники лишаються фоном під контентом.
  padding: 3rem var(--space-page);
  background: #ead9c8;

  @include bp.medium {
    min-height: 25rem;
    display: grid;
    align-items: center;
  }

  &__picture {
    position: absolute;
    z-index: -1;
    inset: 0;
    width: 100%;
    height: 100%;

    & img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center bottom;
    }
  }

  &__content {
    width: min(100%, 48rem);
    margin-inline: auto;
    text-align: center;
  }

  &__title {
    margin: 0 0 1rem;
    font-family: var(--font-hero-heading);
    font-size: clamp(2.5rem, 4.8vw, 4.5rem);
    font-weight: 400;
    line-height: 1.05;
    text-wrap: balance;
  }

  &__details {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem 1.5rem;
  }

  &__link {
    min-height: 2.75rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: inherit;
    font-size: 1rem;

    @include link.hover-underline-text;
  }

  &__channels {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.75rem 1rem;
    margin: 1.25rem 0;
    padding: 0;
    list-style: none;
  }

  &__channel {
    & a {
      display: inline-flex;
      min-height: 2.75rem;
      align-items: center;
      gap: 0.5rem;
      color: inherit;
      font-size: 1rem;

      @include link.hover-underline-text;
    }

    @include bp.medium {
      & + & {
        padding-left: 1.5rem;
        border-left: 1px solid var(--color-border-strong);
      }
    }
  }

  &__booking {
    min-width: min(100%, 18rem);
  }

  &__note {
    margin: 0.75rem 0 0;
    font-size: 1rem;
  }
}
</style>
