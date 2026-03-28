<script setup lang="ts">
const model = defineModel<boolean>({ required: true })
</script>

<template>
  <label class="checkbox-wrapper">
    <span
      class="checkbox-box"
      :class="model ? 'checkbox-checked' : 'checkbox-unchecked'"
      @click="model = !model"
    >
      <svg
        v-if="model"
        class="w-3 h-3 text-white transition-transform duration-150"
        viewBox="0 0 12 12"
        fill="none"
      >
        <path
          d="M2.5 6L5 8.5L9.5 3.5"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
    <slot />
  </label>
</template>
