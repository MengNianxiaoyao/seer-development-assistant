<script setup lang="ts">
defineProps<{
  options: { value: number | string; label: string }[]
}>()

const model = defineModel<number | string>({ required: true })
</script>

<template>
  <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
    <label
      v-for="opt in options"
      :key="opt.value"
      class="flex items-center gap-1.5 px-3 py-1 rounded-md cursor-pointer select-none transition-all duration-200"
      :class="model === opt.value
        ? 'bg-white text-purple-600 shadow-sm font-medium'
        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      "
      @click="model = opt.value"
    >
      <span class="text-xs font-mono">{{ opt.label }}</span>
    </label>
  </div>
</template>
