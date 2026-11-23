import type { Ref } from 'vue';
import { parseCssDuration } from '~/utils/parseCssDuration';

/** Контент видимий за замовчуванням; анімація лише доповнює появу у viewport. */
export const useTextReveal = (root: Readonly<Ref<HTMLElement | null>>): void => {
  let observer: IntersectionObserver | undefined;
  let motionQuery: MediaQueryList | undefined;
  const animations = new Set<Animation>();
  const revealed = new WeakSet<HTMLElement>();

  const stop = (): void => {
    observer?.disconnect();
    observer = undefined;
    animations.forEach((animation) => animation.cancel());
    animations.clear();
  };

  const start = (): void => {
    stop();
    if (
      !root.value ||
      motionQuery?.matches ||
      typeof window.IntersectionObserver !== 'function' ||
      typeof Element.prototype.animate !== 'function'
    ) {
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries
          .filter((entry) => entry.isIntersecting)
          .forEach((entry, index) => {
            const element = entry.target as HTMLElement;
            observer?.unobserve(element);
            if (revealed.has(element)) return;
            revealed.add(element);
            const styles = getComputedStyle(element);
            const duration = parseCssDuration(
              styles.getPropertyValue('--text-reveal-duration'),
              1400,
            );
            const distance = styles.getPropertyValue('--text-reveal-distance').trim() || '10px';
            const easing = styles.getPropertyValue('--text-reveal-easing').trim() || 'ease';
            // Варіант «zoom» — для фото й карток: легке наближення замість зсуву вгору.
            const from =
              element.dataset.textReveal === 'zoom'
                ? { opacity: 0, transform: 'scale(0.96)' }
                : { opacity: 0, transform: `translateY(${distance})` };
            // Клас дозволяє CSS запускати вкладені ефекти (лінії орнаменту, лічильники).
            element.classList.add('is-revealed');

            try {
              const animation = element.animate([from, { opacity: 1, transform: 'none' }], {
                duration,
                delay: Math.min(index, 5) * 90,
                easing,
                fill: 'backwards',
              });
              animations.add(animation);
              const release = (): boolean => animations.delete(animation);
              void animation.finished.then(release, release);
            } catch {
              // Якщо браузер не може анімувати, базові стилі залишають текст видимим.
            }
          });
      },
      { threshold: 0.12 },
    );
    root.value.querySelectorAll<HTMLElement>('[data-text-reveal]').forEach((element) => {
      if (!revealed.has(element)) observer?.observe(element);
    });
  };

  onMounted(() => {
    motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', start);
    start();
  });

  onScopeDispose(() => {
    motionQuery?.removeEventListener('change', start);
    stop();
  });
};
