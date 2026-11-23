/** Збірник CSS може нормалізувати 420ms у .42s; обидва записи повертаємо в ms. */
export const parseCssDuration = (value: string, fallback: number): number => {
  const match = value.trim().match(/^(\d*\.?\d+)(ms|s)$/);
  if (!match) return fallback;
  return Number(match[1]) * (match[2] === 's' ? 1000 : 1);
};
