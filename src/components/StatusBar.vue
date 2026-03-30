<script setup lang="ts">
import { computed } from 'vue'

declare const __APP_VERSION__: string

defineProps<{
  validPackets: number
  paramCount: string
  diffCount: number
  analyzed: boolean
  loading?: boolean
  showInfo?: boolean
}>()

const version = computed(() => __APP_VERSION__)
</script>

<template>
  <div class="status-bar">
    <template v-if="showInfo">
      <span v-if="loading" class="text-yellow-400 flex items-center gap-1.5">
        <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        分析中...
      </span>
      <span v-else-if="analyzed" class="text-green-400">
        分析完成，有效包 {{ validPackets }} 个，参数数量
        {{ paramCount }} 个，相异参数 {{ diffCount }} 个。
      </span>
      <span v-else class="text-gray-400">就绪</span>
    </template>
    <span v-else />
    <span class="text-gray-500">v{{ version }}</span>
  </div>
</template>
