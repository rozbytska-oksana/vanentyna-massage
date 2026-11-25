<template>
  <header class="site-header">
    <div class="site-header__inner">
      <SiteLogo class="site-header__brand" />
      <nav
        class="site-header__navigation"
        :aria-label="headerContent.navigationLabel"
      >
        <ul class="site-header__links">
          <li
            v-for="item in headerContent.navigation"
            :key="item.id"
          >
            <a
              :href="item.href"
              class="site-header__link"
            >
              {{ item.label }}
            </a>
          </li>
        </ul>
      </nav>
      <button
        class="site-header__menu-button"
        type="button"
        :aria-label="headerContent.menuLabel"
        aria-controls="mobile-navigation"
        :aria-expanded="menuOpen"
        @click="openMenu"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 7h16M4 12h16M4 17h16"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>
    <dialog
      id="mobile-navigation"
      ref="menu"
      class="site-header__mobile-menu"
      :aria-label="headerContent.navigationLabel"
      @close="onMenuClosed"
      @cancel.prevent="closeMenu"
    >
      <div class="site-header__mobile-topbar">
        <SiteLogo
          class="site-header__mobile-brand"
          @click="closeMenu"
        />
        <button
          class="site-header__close"
          type="button"
          :aria-label="headerContent.closeLabel"
          autofocus
          @click="closeMenu"
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
      <nav
        class="site-header__mobile-navigation"
        :aria-label="headerContent.navigationLabel"
      >
        <ul class="site-header__mobile-links">
          <li
            v-for="(item, index) in headerContent.navigation"
            :key="item.id"
            class="site-header__mobile-item"
          >
            <span
              class="site-header__mobile-number"
              aria-hidden="true"
            >
              {{ String(index + 1).padStart(2, '0') }}
            </span>
            <a
              class="site-header__link"
              :href="item.href"
              @click="navigateFromMenu($event, item.href)"
            >
              {{ item.label }}
            </a>
          </li>
        </ul>
      </nav>
      <div class="site-header__mobile-footer">
        <div class="site-header__mobile-contacts">
          <a
            class="site-header__mobile-phone"
            :href="`tel:${contacts.phone}`"
          >
            <ContactIcon name="phone" />
            <span>{{ contactsContent.phoneLabel }}</span>
          </a>
          <ul
            class="site-header__mobile-channels"
            :aria-label="contactsContent.channelsLabel"
          >
            <li
              v-for="channel in contacts.channels"
              :key="channel.id"
            >
              <a
                :href="channel.href"
                :target="channel.id === 'viber' ? undefined : '_blank'"
                rel="noopener noreferrer"
                :aria-label="channel.label"
              >
                <ContactIcon :name="channel.id" />
              </a>
            </li>
          </ul>
        </div>
        <button
          class="button button--primary site-header__mobile-booking"
          type="button"
          @click="bookFromMenu"
        >
          {{ headerContent.bookingLabel }}
        </button>
      </div>
    </dialog>
  </header>
</template>

<script setup lang="ts">
import { contacts, contactsContent } from '~/data/contacts';
import { headerContent } from '~/data/home';
import { parseCssDuration } from '~/utils/parseCssDuration';

const emit = defineEmits<{ book: [] }>();
const menu = useTemplateRef<HTMLDialogElement>('menu');
const menuOpen = ref(false);
let menuAnimation: Animation | undefined;
let closing: Promise<void> | undefined;
let disposed = false;
let motionQuery: MediaQueryList | undefined;

const menuMotion = (): { duration: number; easing: string } => {
  const element = menu.value;
  if (
    !element ||
    typeof element.animate !== 'function' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return { duration: 0, easing: 'ease' };
  }
  const styles = getComputedStyle(element);
  return {
    duration: parseCssDuration(styles.getPropertyValue('--menu-duration'), 420),
    easing: styles.getPropertyValue('--menu-easing').trim() || 'ease',
  };
};

const openMenu = (): void => {
  const element = menu.value;
  if (!element || element.open || closing) return;
  element.showModal();
  menuOpen.value = true;
  const motion = menuMotion();
  if (!motion.duration) return;
  try {
    const animation = element.animate(
      [
        { opacity: 0, transform: 'translateY(-16px)' },
        { opacity: 1, transform: 'none' },
      ],
      motion,
    );
    menuAnimation = animation;
    const release = (): void => {
      if (menuAnimation === animation) {
        animation.cancel();
        menuAnimation = undefined;
      }
    };
    void animation.finished.then(release, release);
  } catch {
    // Нативне модальне меню залишається доступним без анімацій.
  }
};

const closeMenu = (): Promise<void> => {
  if (closing) return closing;
  const element = menu.value;
  if (!element?.open) return Promise.resolve();
  closing = (async () => {
    const styles = getComputedStyle(element);
    const initial = { opacity: styles.opacity, transform: styles.transform };
    menuAnimation?.cancel();
    const motion = menuMotion();
    if (motion.duration) {
      try {
        menuAnimation = element.animate([initial, { opacity: 0, transform: 'translateY(-16px)' }], {
          ...motion,
          duration: motion.duration * 0.75,
          fill: 'forwards',
        });
        await menuAnimation.finished;
      } catch {
        // Закриття й відновлення фокуса не залежать від успішності анімації.
      }
    }
    if (!disposed && element.open) element.close();
    menuAnimation?.cancel();
    menuAnimation = undefined;
  })().finally(() => {
    closing = undefined;
  });
  return closing;
};

const onMenuClosed = (): void => {
  menuOpen.value = Boolean(menu.value?.open);
  if (!menuOpen.value) {
    menuAnimation?.cancel();
    menuAnimation = undefined;
  }
};

const navigateFromMenu = async (event: MouseEvent, href: string): Promise<void> => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    return;
  event.preventDefault();
  await closeMenu();
  if (disposed) return;
  document.getElementById(href.slice(1))?.focus({ preventScroll: true });
  window.location.assign(href);
};

const bookFromMenu = async (): Promise<void> => {
  await closeMenu();
  if (!disposed) emit('book');
};

const finishReducedMotion = (): void => {
  if (motionQuery?.matches) menuAnimation?.finish();
};

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  motionQuery.addEventListener('change', finishReducedMotion);
});

onScopeDispose(() => {
  disposed = true;
  motionQuery?.removeEventListener('change', finishReducedMotion);
  menuAnimation?.cancel();
});
</script>

<style scoped lang="scss">
@use '../assets/styles/breakpoints' as bp;
@use '../assets/styles/links' as link;

.site-header {
  position: absolute;
  inset: 0 0 auto;
  z-index: 2;
  min-height: var(--header-height);
  background: transparent;
  color: var(--color-hero-text);
  font-family: var(--font-hero-body);

  &__inner {
    display: flex;
    align-items: center;
    gap: clamp(0.75rem, 2vw, 2rem);
    width: min(100% - 2 * var(--space-page), var(--container-wide));
    min-height: var(--header-height);
    margin-inline: auto;
  }

  &__brand {
    margin-right: auto;
  }

  &__navigation {
    display: none;

    @include bp.x-large {
      display: block;
    }
  }

  &__links {
    display: flex;
    gap: clamp(1.5rem, 2.2vw, 2.25rem);
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: 1.0625rem;
  }

  &__link {
    color: inherit;

    @include link.hover-underline;

    &:focus-visible {
      outline-color: currentColor;
    }
  }

  &__menu-button {
    display: grid;
    flex: 0 0 2.75rem;
    width: 2.75rem;
    height: 2.75rem;
    place-items: center;
    border: 1px solid var(--color-hero-muted);
    border-radius: 50%;
    background: transparent;
    color: var(--color-hero-text);

    &:focus-visible {
      outline-color: currentColor;
    }

    @include bp.x-large {
      display: none;
    }
  }

  // Мобільне меню: фон як у сайту, логотип і кругла кнопка закриття, нумеровані пункти з
  // тонкими лініями, внизу контакти й запис.
  &__mobile-menu {
    position: fixed;
    inset: 0;
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
    }

    &::backdrop {
      background: rgb(42 28 20 / 45%);
    }
  }

  &__mobile-topbar,
  &__mobile-footer,
  &__mobile-navigation {
    width: min(100%, 44rem);
    margin-inline: auto;
  }

  &__mobile-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-bottom: 1.25rem;
    border-bottom: 1px solid var(--color-border-strong);
  }

  &__mobile-brand {
    color: var(--color-button);
  }

  // Кругла кнопка закриття — як круглі кнопки каруселі: тонка коричнева рамка, плавна заливка.
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

  &__mobile-navigation {
    display: grid;
    flex: 1;
    align-content: center;
    padding-block: clamp(1rem, 4svh, 3rem);
  }

  &__mobile-links {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__mobile-item {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    // Висота пунктів залежить від висоти екрана, щоб 5 пунктів вміщувалися й на 320×640.
    padding-block: clamp(0.5rem, 1.6svh, 1.125rem);
    border-bottom: 1px solid var(--color-border-strong);
    font-family: var(--font-hero-heading);
    font-size: clamp(2rem, min(9vw, 5.5svh), 3.25rem);
    font-weight: 500;
    line-height: 1.1;
  }

  &__mobile-number {
    flex-shrink: 0;
    width: 1.75rem;
    color: var(--color-accent);
    font-family: var(--font-hero-body);
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    font-variant-numeric: tabular-nums;
  }

  &__mobile-footer {
    display: grid;
    gap: 1.25rem;
  }

  &__mobile-contacts {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem 1rem;
  }

  &__mobile-phone {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 2.75rem;
    color: var(--color-button);
    font-size: 1.0625rem;
    font-weight: 500;

    @include link.hover-underline-text;
  }

  &__mobile-channels {
    display: flex;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    list-style: none;

    a {
      display: grid;
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

      @media (hover: hover) {
        &:hover {
          background: var(--color-button);
          color: var(--color-button-text);
        }
      }
    }
  }

  &__mobile-booking {
    width: 100%;
  }
}
</style>
