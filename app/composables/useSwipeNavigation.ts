import type { Ref } from 'vue';
import { firstMoveIsHorizontal, swipeDirection } from '~/utils/swipeDirection';

/**
 * Свайп ліворуч / праворуч у збільшеному перегляді (сертифікати, відгуки): палець, стилус або
 * перетягування мишею. Під час руху зображення йде за вказівником (`offset`), після відпускання
 * або перемикається, або плавно повертається. Вертикальна прокрутка й зум щипком лишаються
 * нативними (на елементі має бути `touch-action: pan-y pinch-zoom`).
 */
export const useSwipeNavigation = (
  target: Readonly<Ref<HTMLElement | null>>,
  onSwipe: (direction: -1 | 1) => void,
) => {
  const offset = ref(0);
  const dragging = ref(false);
  let gesture: { id: number; x: number; y: number; horizontal: boolean | null } | null = null;

  const zoomed = (): boolean => (window.visualViewport?.scale ?? 1) > 1.01;

  const reset = (): void => {
    gesture = null;
    dragging.value = false;
    offset.value = 0;
  };

  const onPointerDown = (event: PointerEvent): void => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0) || zoomed()) {
      return;
    }
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, horizontal: null };
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const dx = event.clientX - gesture.x;
    gesture.horizontal ??= firstMoveIsHorizontal(dx, event.clientY - gesture.y);
    // Вертикальний рух віддаємо браузеру (прокрутка); для дотику він надішле pointercancel.
    if (!gesture.horizontal) return;
    if (!dragging.value) {
      dragging.value = true;
      (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
    }
    offset.value = dx;
  };

  const onPointerUp = (event: PointerEvent): void => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const direction = gesture.horizontal
      ? swipeDirection(event.clientX - gesture.x, event.clientY - gesture.y, zoomed() ? 2 : 1)
      : 0;
    reset();
    if (direction) onSwipe(direction);
  };

  // Горизонтальний дотик забираємо на першому русі, щоб вбудовані браузери (Telegram, Instagram)
  // не сприйняли його як «свайп для закриття». Слухач не пасивний, тому додається вручну.
  let touch: { x: number; y: number; horizontal: boolean | null } | null = null;
  const onTouchStart = (event: TouchEvent): void => {
    const point = event.touches[0];
    touch =
      event.touches.length === 1 && point
        ? { x: point.clientX, y: point.clientY, horizontal: null }
        : null;
  };
  const onTouchMove = (event: TouchEvent): void => {
    const point = event.touches[0];
    if (!touch || !point || event.touches.length > 1 || zoomed()) {
      touch = null;
      return;
    }
    touch.horizontal ??= firstMoveIsHorizontal(point.clientX - touch.x, point.clientY - touch.y);
    if (touch.horizontal && event.cancelable) event.preventDefault();
  };
  // Зображення не «перетягується» браузером як файл, коли гортаємо мишею.
  const onDragStart = (event: DragEvent): void => event.preventDefault();

  const listeners = [
    ['pointerdown', onPointerDown, undefined],
    ['pointermove', onPointerMove, undefined],
    ['pointerup', onPointerUp, undefined],
    // lostpointercapture не слухаємо: на дотик браузер неявно захоплює вказівник на <img>, і
    // перехоплення на контейнер одразу надсилає цю подію — жест скидався б на першому русі.
    ['pointercancel', reset, undefined],
    ['touchstart', onTouchStart, { passive: true }],
    ['touchmove', onTouchMove, { passive: false }],
    ['dragstart', onDragStart, undefined],
  ] as const;

  watch(
    target,
    (element, _previous, onCleanup) => {
      if (!element) return;
      listeners.forEach(([type, listener, options]) =>
        element.addEventListener(type, listener as EventListener, options),
      );
      onCleanup(() => {
        listeners.forEach(([type, listener]) =>
          element.removeEventListener(type, listener as EventListener),
        );
        reset();
      });
    },
    { immediate: true, flush: 'post' },
  );

  /** Нове зображення м’яко «виїжджає» з боку, куди гортали. */
  const slideIn = (direction: number): void => {
    const element = target.value;
    if (
      !element ||
      typeof element.animate !== 'function' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    element.animate(
      [
        { opacity: 0, transform: `translateX(${direction * 48}px)` },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' },
    );
  };

  /** Стиль для елемента: слідує за вказівником, повертається з переходом. */
  const swipeStyle = computed(() => ({
    transform: offset.value ? `translateX(${offset.value}px)` : undefined,
    opacity: offset.value ? String(Math.max(0.55, 1 - Math.abs(offset.value) / 600)) : undefined,
    transition: dragging.value ? 'none' : undefined,
  }));

  return { offset, dragging, slideIn, swipeStyle };
};
