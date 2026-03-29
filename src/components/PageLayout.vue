<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <div class="flex-1 flex flex-col">
    <div class="flex-1 flex flex-col gap-2 md:gap-3 p-2 md:p-3 min-h-0">
      <slot />
    </div>
  </div>
</template>
