/**
 * Визначає жест за першим рухом, як Embla: true — горизонтальний (сторінка забирає жест і
 * одразу викликає preventDefault, поки вбудовані браузери на кшталт Telegram не почали свій
 * «свайп для закриття»), false — вертикальний (нативна прокрутка/зум), null — руху ще немає.
 */
export function firstMoveIsHorizontal(dx: number, dy: number): boolean | null {
  if (dx === 0 && dy === 0) return null;
  return Math.abs(dx) > Math.abs(dy);
}

/**
 * Чи завершений рух пальцем є горизонтальним свайпом.
 * 1 — наступний елемент (палець рушив ліворуч), -1 — попередній, 0 — не свайп.
 */
export function swipeDirection(dx: number, dy: number, zoom = 1): -1 | 0 | 1 {
  // У збільшеному щипком вигляді рух панорамує, а не перемикає елементи.
  if (zoom > 1.01) return 0;
  if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return 0;
  return dx < 0 ? 1 : -1;
}
