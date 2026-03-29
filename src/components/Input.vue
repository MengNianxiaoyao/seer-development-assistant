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
    class="input-base"
  >
</template>
