<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/base/Button.vue'
import { copyToClipboard } from '@/utils'

const props = defineProps<{
  output: string
  label?: string
}>()

const emit = defineEmits<{
  copy: []
}>()

const copied = ref(false)

async function handleCopy() {
  if (!props.output)
    return
  const success = await copyToClipboard(props.output)
  if (success) {
    copied.value = true
    emit('copy')
    setTimeout(() => {
      copied.value = false
    }, 1500)
  }
}
</script>

<template>
  <div class="flex flex-col gap-1.5 flex-1 overflow-hidden">
    <div class="flex items-center justify-between">
      <label class="text-xs font-medium text-gray-600 flex items-center gap-1">
        <svg
          class="w-3.5 h-3.5 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {{ label || "转换结果" }}
      </label>
      <div class="flex items-center gap-2">
        <span
          class="px-2 py-1 text-white text-[10px] font-medium rounded-full shadow-sm transition-all duration-200"
          :class="copied ? 'bg-green-600 scale-110' : 'bg-green-500'"
        >{{ output.length }} 字符</span>
        <Button
          :type="copied ? 'success' : 'primary'"
          size="sm"
          @click="handleCopy"
        >
          <span class="flex items-center gap-1">
            <svg
              v-if="!copied"
              class="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <svg
              v-else
              class="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {{ copied ? "已复制" : "复制" }}
          </span>
        </Button>
      </div>
    </div>
    <div class="relative flex-1">
      <textarea
        :value="output"
        readonly
        class="w-full h-full min-h-[80px] px-4 py-3 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl text-xs font-mono resize-none shadow-inner transition-colors duration-200"
        :class="{ 'border-green-400 bg-green-50/80': copied }"
      />
    </div>
  </div>
</template>
