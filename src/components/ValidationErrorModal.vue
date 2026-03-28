<script setup lang="ts">
import Button from '@/components/Button.vue'
import type { ValidationError } from '@/types'

defineProps<{
  errors: ValidationError[]
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <div
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-2xl shadow-2xl w-[500px] max-h-[70vh] flex flex-col overflow-hidden animate-scale-in">
      <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-red-50 to-white">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <svg class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 class="text-sm font-semibold text-red-600">校验不通过</h2>
        </div>
        <span
          class="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors text-lg leading-none"
          @click="emit('close')"
        >×</span>
      </div>
      <div class="p-5 overflow-y-auto flex-1 space-y-3">
        <div v-for="err in errors" :key="err.label">
          <div class="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            {{ err.label }}
          </div>
          <div class="bg-red-50 border border-red-100 rounded-lg p-3 space-y-1">
            <div
              v-for="(reason, idx) in err.reasons"
              :key="idx"
              class="text-xs text-red-500 flex items-start gap-1.5"
            >
              <span class="text-red-300 mt-0.5">·</span>
              <span>{{ reason }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="px-5 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50">
        <Button type="default" size="sm" @click="emit('close')">关闭</Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95) translateY(-10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}
.animate-scale-in {
  animation: scale-in 0.25s ease-out;
}
</style>
