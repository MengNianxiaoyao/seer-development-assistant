<script setup lang="ts">
defineProps<{
  type?: "primary" | "warning" | "danger" | "success" | "default";
  size?: "sm" | "md";
}>();

const emit = defineEmits<{
  click: [];
}>();
</script>

<template>
  <button
    class="font-medium cursor-pointer border-none outline-none select-none active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[
      size === 'sm'
        ? 'px-3 py-1 text-xs rounded-md'
        : 'px-4 py-1.5 text-sm rounded-lg',
      {
        'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30 hover:from-purple-500 hover:to-violet-500':
          type === 'primary' || !type,
        'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 hover:from-orange-400 hover:to-amber-400':
          type === 'warning',
        'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 hover:from-red-400 hover:to-rose-400':
          type === 'danger',
        'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/20 hover:shadow-lg hover:shadow-green-500/30 hover:from-green-400 hover:to-emerald-400':
          type === 'success',
        'bg-white text-gray-600 border border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300 hover:shadow-md':
          type === 'default',
      },
    ]"
    @click="emit('click')"
  >
    <slot />
  </button>
</template>
