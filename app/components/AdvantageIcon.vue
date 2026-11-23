<template>
  <svg
    viewBox="0 0 24 24"
    width="28"
    height="28"
    fill="none"
    stroke="currentColor"
    stroke-width="1.25"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <!-- Людина: індивідуальний підхід -->
    <template v-if="name === 'person'">
      <circle
        cx="12"
        cy="7.5"
        r="3.5"
      />
      <path d="M5 20c.6-3.8 3.4-6 7-6s6.4 2.2 7 6" />
    </template>
    <!-- Розкрита книга: навчання -->
    <template v-else-if="name === 'learning'">
      <path
        d="M12 6.5C10 5 7.5 4.5 4 4.8v13c3.5-.3 6 .2 8 1.7 2-1.5 4.5-2 8-1.7v-13c-3.5-.3-6 .2-8 1.7Z"
      />
      <path d="M12 6.5v13" />
    </template>
    <!-- Листки: різні види масажу -->
    <template v-else-if="name === 'range'">
      <path d="M12 20V10" />
      <path d="M12 10c0-3.5 2-6 5.5-6.5.4 3.6-1.8 6.3-5.5 6.5Z" />
      <path d="M12 13c0-3-1.8-5.2-5-5.6-.4 3.1 1.6 5.4 5 5.6Z" />
    </template>
    <!-- Медаль: роки досвіду -->
    <template v-else-if="name === 'experience'">
      <circle
        cx="12"
        cy="9"
        r="5"
      />
      <path d="m9.2 13.2-1.7 6.8 4.5-2.3 4.5 2.3-1.7-6.8" />
      <path d="m10 9 1.4 1.4L14 7.8" />
    </template>
    <!-- Будиночок: затишний кабінет -->
    <template v-else-if="name === 'room'">
      <path d="M4 11 12 4.5 20 11" />
      <path d="M6 9.5V20h12V9.5" />
      <path d="M10 20v-5h4v5" />
    </template>
    <!-- Календар: зручний запис -->
    <template v-else>
      <rect
        x="4"
        y="5.5"
        width="16"
        height="14.5"
        rx="2"
      />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
      <path d="m9.5 14.5 1.8 1.8 3.5-3.5" />
    </template>
  </svg>
</template>

<script setup lang="ts">
import type { AdvantageIconName } from '~/types/content';

defineProps<{ name: AdvantageIconName }>();
</script>
