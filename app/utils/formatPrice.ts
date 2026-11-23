const priceFormatter = new Intl.NumberFormat('uk-UA', {
  maximumFractionDigits: 0,
});

// Назва валюти явна: різні версії ICU можуть повертати «₴» або «грн».
export const formatPrice = (price: number): string => `${priceFormatter.format(price)}\u00a0грн`;
