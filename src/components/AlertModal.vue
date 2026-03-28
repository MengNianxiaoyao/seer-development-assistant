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
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="true"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @click.self="emit('close')"
      >
        <div class="modal-backdrop absolute inset-0" @click="emit('close')" />
        <div class="modal-dialog w-[400px] relative">
          <div class="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-center bg-gradient-to-r from-gray-50 to-white">
              <div class="flex items-center gap-2">
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
            </div>
            <div class="px-5 py-5">
              <p class="text-sm text-gray-600 leading-relaxed text-center">{{ message }}</p>
            </div>
            <div class="px-5 py-4 border-t border-gray-100 flex justify-center bg-gray-50/50">
              <Button type="primary" @click="emit('close')">确定</Button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
