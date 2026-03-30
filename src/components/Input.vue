<script setup lang="ts">
defineProps<{
  placeholder?: string
  type?: string
}>()

const model = defineModel<string>({ required: true })
</script>

<template>
  <input
    v-model="model"
    :type="type ?? 'text'"
    :placeholder="placeholder"
    class="input-base"
    v-bind="$attrs"
  >
</template>
