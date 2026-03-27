<script setup lang="ts">
defineProps<{
  placeholder?: string;
}>();

const model = defineModel<string>({ required: true });
</script>

<template>
  <input
    v-model="model"
    type="text"
    :placeholder="placeholder"
    class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono transition-all duration-200 placeholder:text-gray-400 hover:bg-white hover:border-indigo-300 hover:shadow-sm focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:shadow-sm outline-none"
  />
</template>
