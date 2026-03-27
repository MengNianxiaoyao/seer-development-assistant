<script setup lang="ts">
import Button from '@/components/Button.vue'

defineProps<{
  message: string
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
    <div class="bg-white rounded-2xl shadow-2xl w-[400px] overflow-hidden animate-scale-in">
      <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            <svg class="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 class="text-sm font-semibold text-gray-800">提示</h2>
        </div>
        <span
          class="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors text-lg leading-none"
          @click="emit('close')"
        >×</span>
      </div>
      <div class="px-5 py-5">
        <p class="text-sm text-gray-600 leading-relaxed">{{ message }}</p>
      </div>
      <div class="px-5 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50">
        <Button type="primary" size="sm" @click="emit('close')">确定</Button>
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
.animate-fade-in { animation: fade-in 0.2s ease-out; }
.animate-scale-in { animation: scale-in 0.25s ease-out; }
</style>
