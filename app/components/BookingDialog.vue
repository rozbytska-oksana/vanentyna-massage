<template>
  <dialog
    ref="dialog"
    class="booking-dialog"
    aria-labelledby="booking-title"
    aria-describedby="booking-description"
    @click="closeOnBackdrop"
  >
    <div class="booking-dialog__topbar">
      <SiteLogo
        class="booking-dialog__brand"
        @click="dialog?.close()"
      />
      <button
        class="booking-dialog__close"
        type="button"
        :aria-label="bookingContent.closeLabel"
        autofocus
        @click="dialog?.close()"
      >
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="m6 6 12 12M18 6 6 18"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>

    <div class="booking-dialog__body">
      <h2
        id="booking-title"
        class="booking-dialog__title"
      >
        {{ bookingContent.title }}
      </h2>
      <p
        id="booking-description"
        class="booking-dialog__description"
      >
        {{ bookingContent.description }}
      </p>
      <ul
        class="booking-dialog__channels"
        :aria-label="contactsContent.channelsLabel"
      >
        <li
          v-for="(option, index) in options"
          :key="option.id"
          class="booking-dialog__item"
        >
          <a
            class="booking-dialog__link"
            :href="option.href"
            :target="option.external ? '_blank' : undefined"
            :rel="option.external ? 'noopener noreferrer' : undefined"
          >
            <span
              class="booking-dialog__number"
              aria-hidden="true"
            >
              {{ String(index + 1).padStart(2, '0') }}
            </span>
            <span class="booking-dialog__label">
              {{ option.label }}
              <small v-if="option.detail">{{ option.detail }}</small>
            </span>
            <span
              class="booking-dialog__icon"
              aria-hidden="true"
            >
              <ContactIcon :name="option.id" />
            </span>
          </a>
        </li>
      </ul>
    </div>

    <p class="booking-dialog__note">{{ bookingContent.note }}</p>
  </dialog>
</template>

<script setup lang="ts">
import { contacts, contactsContent } from '~/data/contacts';
import { bookingContent } from '~/data/home';

// Спосіб зв’язку: телефон першим, далі канали з contacts.ts. Viber відкривається застосунком.
const options = [
  {
    id: 'phone',
    label: contactsContent.callLabel,
    detail: contactsContent.phoneLabel,
    href: `tel:${contacts.phone}`,
    external: false,
  },
  ...contacts.channels.map((channel) => ({
    id: channel.id,
    label: channel.label,
    detail: undefined,
    href: channel.href,
    external: channel.id !== 'viber',
  })),
];

const dialog = useTemplateRef<HTMLDialogElement>('dialog');

const closeOnBackdrop = (event: MouseEvent): void => {
  const element = dialog.value;
  if (!element || event.target !== element) return;
  const bounds = element.getBoundingClientRect();
  if (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  ) {
    element.close();
  }
};

defineExpose({ open: (): void => dialog.value?.showModal() });
</script>

<style scoped lang="scss">
@use '../assets/styles/breakpoints' as bp;

// У стилі мобільного меню: фон сайту, логотип і кругла кнопка закриття зверху, нумеровані
// пункти з тонкими лініями. На mobile — на весь екран, від medium — центрована панель.
.booking-dialog {
  // Без власного position: модальний dialog уже fixed у top layer (relative ламав позицію
  // й прокручував сторінку нагору).
  width: 100%;
  max-width: none;
  height: 100dvh;
  max-height: none;
  margin: 0;
  padding: max(1.25rem, env(safe-area-inset-top)) max(1.25rem, env(safe-area-inset-right))
    max(1.5rem, env(safe-area-inset-bottom)) max(1.25rem, env(safe-area-inset-left));
  overflow-y: auto;
  overscroll-behavior: contain;
  border: 0;
  border-radius: 0;
  background-color: var(--color-content-background);
  background-image: var(--background-content-image);
  background-size: var(--background-content-size);
  color: var(--color-text);
  font-family: var(--font-hero-body);

  &[open] {
    display: flex;
    flex-direction: column;

    @media (prefers-reduced-motion: no-preference) {
      animation: booking-dialog-in 420ms var(--menu-easing);
    }
  }

  &::backdrop {
    background: rgb(42 28 20 / 45%);
  }

  @include bp.medium {
    width: min(100% - 4rem, 38rem);
    // fit-content, а не auto: у fixed-dialog auto розтягує його на всю висоту екрана.
    height: fit-content;
    max-height: calc(100dvh - 4rem);
    margin: auto;
    padding: 1.75rem 2.25rem 2rem;
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-md);
    box-shadow: 0 1.5rem 3rem -1.5rem rgb(42 28 20 / 45%);
  }

  &__topbar,
  &__body,
  &__note {
    width: min(100%, 44rem);
    margin-inline: auto;
  }

  &__topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-bottom: 1.25rem;
    border-bottom: 1px solid var(--color-border-strong);
  }

  &__brand {
    color: var(--color-button);
  }

  // Кругла кнопка закриття — як у мобільному меню.
  &__close {
    display: grid;
    flex-shrink: 0;
    width: 2.75rem;
    height: 2.75rem;
    padding: 0;
    place-items: center;
    border: 1px solid var(--color-button);
    border-radius: 50%;
    background: transparent;
    color: var(--color-button);
    transition:
      background-color 350ms ease,
      color 350ms ease;

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }

    @media (hover: hover) {
      &:hover {
        background: var(--color-button);
        color: var(--color-button-text);
      }
    }
  }

  // На mobile блок із каналами по центру висоти, як пункти меню.
  &__body {
    display: grid;
    flex: 1;
    align-content: center;
    padding-block: clamp(1.5rem, 5svh, 3rem);

    @include bp.medium {
      flex: none;
      padding-block: 1.75rem 1.5rem;
    }
  }

  &__title {
    margin: 0;
    font-family: var(--font-hero-heading);
    font-size: clamp(2.25rem, 9vw, 3rem);
    font-weight: 500;
    line-height: 1.1;
  }

  &__description {
    margin: 0.75rem 0 clamp(1.25rem, 3svh, 2rem);
    color: var(--color-text-muted);
    font-size: 1.0625rem;
    line-height: 1.6;
  }

  &__channels {
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--color-border-strong);
    list-style: none;
  }

  &__item {
    border-bottom: 1px solid var(--color-border-strong);
  }

  &__link {
    display: flex;
    align-items: center;
    gap: 1rem;
    min-height: 3rem;
    padding-block: clamp(0.625rem, 1.8svh, 1rem);
    color: inherit;
    text-decoration: none;

    &:focus-visible {
      outline-offset: 2px;
    }

    @media (hover: hover) {
      &:hover .booking-dialog__icon {
        background: var(--color-button);
        color: var(--color-button-text);
      }
    }
  }

  &__number {
    flex-shrink: 0;
    width: 1.75rem;
    color: var(--color-accent);
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    font-variant-numeric: tabular-nums;
  }

  &__label {
    display: grid;
    flex: 1;
    min-width: 0;
    font-family: var(--font-hero-heading);
    font-size: clamp(1.75rem, 7vw, 2.25rem);
    font-weight: 500;
    line-height: 1.1;

    small {
      margin-top: 0.25rem;
      color: var(--color-text-muted);
      font-family: var(--font-hero-body);
      font-size: 0.9375rem;
      font-weight: 400;
      letter-spacing: 0.02em;
    }
  }

  // Іконка в колі — як канали в мобільному меню; заливається при наведенні на рядок.
  &__icon {
    display: grid;
    flex-shrink: 0;
    width: 2.75rem;
    height: 2.75rem;
    place-items: center;
    border: 1px solid var(--color-button);
    border-radius: 50%;
    color: var(--color-button);
    transition:
      background-color 350ms ease,
      color 350ms ease;

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  }

  &__note {
    margin-top: 0;
    margin-bottom: 0;
    color: var(--color-text-muted);
    font-size: 0.9375rem;
    line-height: 1.6;
  }
}

@keyframes booking-dialog-in {
  from {
    opacity: 0;
    transform: translateY(-16px);
  }
}
</style>
