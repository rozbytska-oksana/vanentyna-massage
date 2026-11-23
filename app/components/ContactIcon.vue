<template>
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <template v-if="name === 'instagram'">
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
      />
      <circle
        cx="12"
        cy="12"
        r="4"
      />
      <circle
        cx="17.5"
        cy="6.5"
        r="0.8"
        fill="currentColor"
        stroke="none"
      />
    </template>
    <template v-else-if="name === 'facebook'">
      <circle
        cx="12"
        cy="12"
        r="9"
      />
      <path d="M13 21V12h3l.5-3H13V7.5c0-1 .5-1.5 1.5-1.5H17M9 12h4" />
    </template>
    <template v-else-if="name === 'location'">
      <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
      <circle
        cx="12"
        cy="10"
        r="2.5"
      />
    </template>
    <template v-else>
      <path
        v-if="name === 'viber'"
        d="M5 18 3 22l5-2c9 2 14-2 13-10-.5-5-3-7-9-7S3 5 3 11c0 3 .5 5 2 7Z"
      />
      <path d="m8 7-2 2c0 4 5 9 9 9l2-2-3-2-1 1c-2-1-3-2-4-4l1-1-2-3Z" />
      <path
        v-if="name === 'viber'"
        d="M13 7c3 0 5 2 5 5m-5-2c1 0 2 1 2 2"
      />
    </template>
  </svg>
</template>

<script setup lang="ts">
defineProps<{ name: string }>();
</script>
