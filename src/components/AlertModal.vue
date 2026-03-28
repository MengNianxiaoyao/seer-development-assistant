<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import Button from '@/components/Button.vue'

defineProps<{
  message: string
}>()

const emit = defineEmits<{
  close: []
}>()

function handleKeydown(e: globalThis.KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div
    class="modal-overlay"
    @click.self="emit('close')"
  >
    <div class="modal-container w-[400px]">
      <div class="modal-header bg-gradient-to-r from-gray-50 to-white">
        <div class="label-with-icon">
          <div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            <svg
              class="w-4 h-4 text-purple-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 class="text-sm font-semibold text-gray-800">提示</h2>
        </div>
        <span class="modal-close" @click="emit('close')">×</span>
      </div>
      <div class="modal-body">
        <p class="text-sm text-gray-600 leading-relaxed">{{ message }}</p>
      </div>
      <div class="modal-footer">
        <Button type="primary" size="sm" @click="emit('close')">确定</Button>
      </div>
    </div>
  </div>
</template>
