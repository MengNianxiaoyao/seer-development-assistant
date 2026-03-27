<script setup lang="ts">
defineProps<{
  placeholder?: string
}>()

const model = defineModel<string>({ required: true })
</script>

<template>
  <input
    v-model="model"
    type="text"
    :placeholder="placeholder"
    class="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-mono shadow-sm transition-all duration-200 placeholder:text-gray-300 hover:border-gray-300 hover:shadow focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 focus:shadow-md"
  />
</template>
