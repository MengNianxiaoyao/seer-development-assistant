<script setup lang="ts">
defineProps<{
  type?: 'primary' | 'warning' | 'danger' | 'success' | 'default'
  size?: 'sm' | 'md' | 'xs'
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    :class="[
      size === 'xs' ? 'btn-xs' : size === 'sm' ? 'btn-sm' : 'btn-md',
      {
        'btn-primary': type === 'primary' || !type,
        'btn-warning': type === 'warning',
        'btn-danger': type === 'danger',
        'btn-success': type === 'success',
        'btn-default': type === 'default',
      },
    ]"
    @click="emit('click')"
  >
    <slot />
  </button>
</template>
