<script setup lang="ts">
const model = defineModel<boolean>({ required: true });
</script>

<template>
  <label
    class="inline-flex items-center gap-2 cursor-pointer select-none group"
  >
    <span
      class="w-[18px] h-[18px] rounded-[5px] border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200"
      :class="
        model
          ? 'bg-gradient-to-br from-purple-500 to-violet-600 border-purple-500 shadow-md shadow-purple-500/30 scale-100'
          : 'bg-gray-200 border-gray-500 shadow-sm group-hover:border-purple-400 group-hover:shadow-md'
      "
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
