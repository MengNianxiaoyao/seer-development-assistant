<script setup lang="ts">
import { ref, computed } from 'vue'
import { formatValue, getHighlightClass, copyToClipboard } from '@/utils/hex'
import { usePacketData } from '@/composables/usePacketData'
import type { AnalysisResult, DisplayFormat } from '@/types'

const props = defineProps<{
  result: AnalysisResult | null
  format: DisplayFormat
}>()

const copiedIndex = ref<number | null>(null)

const { receivePackets, sendPacketParams, diffIndexSet } = usePacketData(computed(() => props.result))

const hasContent = computed(() => {
  if (!props.result && sendPacketParams.value.length === 0) return false
  return (props.result?.packets.length ?? 0) > 0 || sendPacketParams.value.length > 0
})

function getSendParamClass(paramIdx: number): string {
  return diffIndexSet.value.has(paramIdx) ? 'highlight-yellow' : 'highlight-orange'
}

async function handleCopy(value: string, index: number) {
  const success = await copyToClipboard(value)
  if (success) {
    copiedIndex.value = index
    setTimeout(() => {
      copiedIndex.value = null
    }, 1200)
  }
}
</script>

<template>
  <div class="panel h-full flex flex-col">
    <div class="section-title">
      <span class="label-with-icon">
        <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        输出区 - 所有参数区
      </span>
      <span v-if="copiedIndex !== null" class="text-[10px] text-green-500 ml-2 animate-fade-in">已复制</span>
    </div>

    <div v-if="!hasContent" class="text-gray-400 text-xs text-center py-4 flex-1">
      点击"开始分析"查看结果
    </div>

    <div v-else class="flex-1 overflow-x-auto overflow-y-auto">
      <div class="flex gap-2">
        <div
          v-if="sendPacketParams.length > 0"
          class="card inline-block flex-shrink-0 border-2 border-orange-300"
        >
          <div class="text-orange-600 font-bold mb-1 flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            发包标识参数
          </div>
          <div class="space-y-0.5">
            <div
              v-for="param in sendPacketParams"
              :key="param.index"
              class="diff-item-clickable hover:ring-orange-300"
              :class="[getSendParamClass(param.index), copiedIndex === param.index ? 'ring-2 ring-green-400' : '']"
              @click="handleCopy(formatValue(param.hex, param.decimal, param.binary, format), param.index)"
            >
              <span class="param-index">[{{ param.index }}]</span>
              <span>{{ formatValue(param.hex, param.decimal, param.binary, format) }}</span>
            </div>
          </div>
        </div>

        <div v-for="(packet, pIdx) in receivePackets" :key="packet.id" class="card inline-block flex-shrink-0">
          <div class="text-purple-600 font-bold mb-1">{{ packet.label }}</div>
          <div v-if="packet.params.length === 0" class="text-gray-400">无参数</div>
          <div v-else class="space-y-0.5">
            <div
              v-for="param in packet.params"
              :key="param.index"
              class="diff-item-clickable"
              :class="[
                getHighlightClass(pIdx, param.index, diffIndexSet),
                copiedIndex === param.index ? 'ring-2 ring-green-400' : '',
              ]"
              @click="handleCopy(formatValue(param.hex, param.decimal, param.binary, format), param.index)"
            >
              <span class="param-index">[{{ param.index }}]</span>
              <span>{{ formatValue(param.hex, param.decimal, param.binary, format) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
